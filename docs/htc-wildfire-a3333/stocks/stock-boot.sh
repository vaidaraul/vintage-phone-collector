#!/system/bin/sh
# Add the HTC Stocks DNAT rule at boot.
# Replace 192.0.2.10 with the LAN address of the bridge host.
BRIDGE_HOST=192.0.2.10
BRIDGE_PORT=8090
IPT=/system/bin/iptables
LOG=/data/local/stock-proxy/boot.log

$IPT -t nat -D OUTPUT -p tcp -d "$BRIDGE_HOST" --dport 80 -j DNAT --to-destination "$BRIDGE_HOST:$BRIDGE_PORT" 2>/dev/null
$IPT -t nat -A OUTPUT -p tcp -d "$BRIDGE_HOST" --dport 80 -j DNAT --to-destination "$BRIDGE_HOST:$BRIDGE_PORT"

{
  echo "=== $(date) ==="
  $IPT -t nat -L OUTPUT -n 2>&1
} >> "$LOG" 2>&1
