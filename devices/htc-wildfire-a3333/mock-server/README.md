# HTC Weather live compatibility adapter

The original HTC Weather app on the Wildfire A3333 successfully refreshed against the local XML mock. This version keeps the original app and endpoint paths, but gets current conditions and a four-day forecast from Open-Meteo and translates them into XML fields accepted by the legacy parser.

The live provider change is committed to this branch but has not yet been deployed to the Linux host or verified on the phone. Until the Docker image is rebuilt, the running container still serves the previous static demo data.

## Weather provider and location

- Provider: [Open-Meteo Forecast API](https://open-meteo.com/en/docs), no API key required for non-commercial personal use.
- The free service is limited to 10,000 calls per day, 5,000 per hour, and 600 per minute; it has no uptime guarantee. Data attribution under CC BY 4.0 is required. See [Open-Meteo terms](https://open-meteo.com/en/terms).
- Each coordinate's forecast is cached for 10 minutes. The last successful response is served if the provider temporarily fails.
- The server uses latitude/longitude from lat/latitude and lon/lng/longitude query parameters if the HTC request includes them.
- If the legacy request has no coordinates, the fallback is Bucharest (44.4268, 26.1025). Override it with WEATHER_LATITUDE and WEATHER_LONGITUDE in a local .env file beside compose.yaml. These are coordinates, not API keys; do not commit a private home location.
- WMO weather codes are mapped approximately to legacy AccuWeather icon IDs. Temperatures are rounded to whole degrees C/F.

## Deploy the live adapter

From this directory on the Linux host:

```bash
docker compose up -d --build
docker compose ps
curl -i http://192.168.50.1/healthz
curl -i 'http://192.168.50.1/widget/htc/forecast-data_v3.asp'
```

The second URL should return XML containing live forecast values and a source element naming Open-Meteo. Then refresh HTC Weather. The container needs outbound access to api.open-meteo.com.

To use another default city, create a local, untracked .env file beside compose.yaml. Example coordinates below are Cluj-Napoca:

```dotenv
WEATHER_LATITUDE=46.7712
WEATHER_LONGITUDE=23.6236
```

Rebuild after changing the location with docker compose up -d --build. The repository contains no location-specific .env file or provider key.

## What is verified

- The unmodified HTC Weather app can reach the original HTTP hostname when local DNS maps it to the host.
- The app accepted parser-shaped XML during the exercised refresh and displayed static mock weather.
- The Wildfire can use the isolated Linux-host Wi-Fi AP; the user confirmed ordinary HTTP internet access from the phone.
- Live weather through Open-Meteo still needs deployment and an on-phone refresh. The historical response format for lat-lon-search.asp is not independently known; both legacy paths currently return the same forecast XML.

## Linux AP test setup

The isolated AP uses an Ethernet uplink and a separate Wi-Fi adapter supporting AP mode. The Linux host was configured with iw, hostapd, dnsmasq-base, Docker Engine, and Docker Compose. DHCP/DNS and NAT are host-managed because they need the physical Wi-Fi interface. Their boot-time persistence is not configured; do not expect the full AP demo to return automatically after a Linux reboot.

Example temporary hostapd config (keep its password local and out of Git):

```ini
interface=wlp3s0
driver=nl80211
ssid=HTC-Lab
country_code=RO
hw_mode=g
channel=1
wpa=2
wpa_key_mgmt=WPA-PSK
rsn_pairwise=CCMP
wpa_passphrase=REPLACE_WITH_LOCAL_RANDOM_PASSPHRASE
```

Save it outside the repository, for example /tmp/htc-lab-hostapd.conf, assign the AP address, then start hostapd:

```bash
sudo ip addr add 192.168.50.1/24 dev wlp3s0
sudo ip link set wlp3s0 up
sudo hostapd /tmp/htc-lab-hostapd.conf
```

In another terminal, run DHCP and local DNS:

```bash
sudo dnsmasq --no-daemon --no-resolv --no-hosts --bind-interfaces \
  --interface=wlp3s0 --listen-address=192.168.50.1 --port=53 \
  --dhcp-range=192.168.50.10,192.168.50.20,255.255.255.0,1h \
  --dhcp-option=3,192.168.50.1 --dhcp-option=6,192.168.50.1 \
  --server=1.1.1.1 --server=1.0.0.1 \
  --address=/htc.accuweather.com/192.168.50.1 --dhcp-authoritative
```

Temporary interface-scoped NAT over the wired uplink was added, and the phone successfully loaded http://example.com over this AP. Those forwarding rules are runtime-only and are not restored after reboot. The AP subnet is intended to be isolated from the home LAN.

Compose publishes the adapter only on AP address 192.168.50.1:80 and uses restart: unless-stopped. The AP address must exist before Docker starts the published-port container. Host boot ordering is not configured.

## Connect and verify

1. Connect the Wildfire to SSID HTC-Lab with the local password configured on the Linux host.
2. With USB ADB connected, run adb shell netcfg on Windows. On this Froyo build Wi-Fi appeared as eth0 with an address in 192.168.50.10–192.168.50.20.
3. On the phone, open http://192.168.50.1/healthz; expect ok.
4. Open http://htc.accuweather.com/widget/htc/forecast-data_v3.asp; expect XML.
5. Refresh HTC Weather. Static mock weather was observed rendering successfully; live weather needs a refresh after deployment.

## Stop and restore

- Run docker compose down to stop the container.
- Stop dnsmasq and hostapd in their foreground terminals with Ctrl+C.
- Disconnect the Wildfire from HTC-Lab and reconnect to its usual Wi-Fi.
- Remove the temporary AP address and return the Wi-Fi adapter to its previous down state:

```bash
sudo ip addr del 192.168.50.1/24 dev wlp3s0
sudo ip link set wlp3s0 down
```

No router DNS change, Android root, app replacement, ROM change, or system-partition edit is required. No passphrase, HTC vendor parameter, raw logcat, PPPoE credentials, device serial, or private location data should be committed.
