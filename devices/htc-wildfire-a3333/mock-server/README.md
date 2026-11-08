# HTC Weather mock server: isolated Wi-Fi test

Status: manually verified on an HTC Wildfire A3333 running stock Android 2.2.1. The original HTC Weather app refreshed against the local mock and displayed synthetic weather. This is a local compatibility smoke test, not live weather.

## What the test proves

- The unmodified HTC Weather app can reach an HTTP endpoint at the original hostname when local DNS maps it to the mock.
- The app accepted the mock's parser-shaped XML during the exercised refresh.
- The phone did not need internet access; it connected directly to the Linux host's isolated access point.
- The test does not establish the historical server's exact response, especially for `lat-lon-search.asp`; the mock currently returns the same sample XML for both legacy paths.

The server returns fixed demo temperatures (18 C current; forecast highs 19, 20, 17, 16 C and lows 11, 12, 10, 9 C). Dates are generated from the Linux host's local date. No real weather provider is contacted.

## Requirements

- Linux host with an Ethernet uplink and a separate Wi-Fi adapter that supports AP mode.
- `hostapd`, `dnsmasq-base`, `iw`, Python 3.
- HTC Wildfire connected to the temporary SSID; USB ADB may remain connected in parallel.

On Ubuntu, the diagnostic and AP packages used in the investigation were installed with:

```bash
sudo apt install iw hostapd dnsmasq-base
```

`dnsmasq-base` supplies the binary without enabling a DHCP/DNS service by itself. Start the test processes in foreground terminals so they are easy to stop.

## Start the isolated access point

Use a local-only WPA2 password; do not commit it to this repository. Example temporary hostapd config:

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

Save it outside the repository, for example as `/tmp/htc-lab-hostapd.conf`. Assign the AP address and run hostapd:

```bash
sudo ip addr add 192.168.50.1/24 dev wlp3s0
sudo ip link set wlp3s0 up
sudo hostapd /tmp/htc-lab-hostapd.conf
```

Leave hostapd running in the foreground. It should report `AP-ENABLED`.

## Start DHCP and local DNS

In a second terminal, run:

```bash
sudo dnsmasq --no-daemon --no-resolv --no-hosts --bind-interfaces \
  --interface=wlp3s0 --listen-address=192.168.50.1 --port=53 \
  --dhcp-range=192.168.50.10,192.168.50.20,255.255.255.0,1h \
  --dhcp-option=3,192.168.50.1 --dhcp-option=6,192.168.50.1 \
  --address=/htc.accuweather.com/192.168.50.1 --dhcp-authoritative
```

The expected `no upstream servers configured` warning is intentional. The AP has no internet forwarding, and only the HTC hostname is needed for the local test. DHCP gives the phone an address in `192.168.50.10`–`192.168.50.20` and the laptop as its DNS server.

## Start the HTTP mock

From this directory, run the mock on HTTP port 80, which is the port embedded in the original HTC URLs:

```bash
sudo python3 server.py --host 192.168.50.1 --port 80
```

This binds only to the AP address. Port 80 requires elevated privileges on Linux. The investigation initially used `--host 0.0.0.0`; binding to `192.168.50.1` is preferable for repeat tests because it limits access to the AP interface.

## Connect and verify

1. Connect the Wildfire to SSID `HTC-Lab` using the local password configured above. The test AP intentionally provides no general internet access.
2. With USB ADB still connected, run `adb shell netcfg` on the Windows PC. On this Froyo build the Wi-Fi interface appeared as `eth0`; expect an address in `192.168.50.10`–`192.168.50.20`.
3. In the phone browser, open `http://192.168.50.1/healthz`; expect `ok`.
4. Open `http://htc.accuweather.com/widget/htc/forecast-data_v3.asp`; expect demo XML.
5. Refresh HTC Weather. The manually observed test completed and displayed the mock weather.

## Stop and restore

- Press `Ctrl+C` in the mock, dnsmasq, and hostapd foreground terminals.
- On the Wildfire, disconnect from `HTC-Lab` and reconnect to the preferred Wi-Fi network.
- On Linux, remove the temporary AP address and restore the interface to its original down state:

```bash
sudo ip addr del 192.168.50.1/24 dev wlp3s0
sudo ip link set wlp3s0 down
```

No router DNS change, Android root, app replacement, ROM change, or system-partition edit is part of this procedure. The investigation did install the `iw`, `hostapd`, and `dnsmasq-base` packages on the Linux host.

## Privacy

Do not commit a Wi-Fi passphrase, HTC vendor query parameter, raw logcat, PPPoE credentials, device serial, or personal location data. The mock suppresses request logging because legacy requests can include a vendor parameter and location.