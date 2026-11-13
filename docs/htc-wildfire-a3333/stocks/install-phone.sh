#!/system/bin/sh
# Install the HTC Stocks bridge hooks on the phone.
# Usage: install-phone.sh <bridge-host>
#
# Run as root on the phone. The bridge host is the LAN address of the
# machine running stock-bridge.py, for example 192.0.2.10.
BB=/system/bin/busybox
BRIDGE_HOST="$1"
SRC=/data/local/stock-proxy
WRAP=/system/bin/bootcomplete
IPT=/system/bin/iptables

if $BB test -z "$BRIDGE_HOST"; then
  echo "usage: $0 <bridge-host>"
  exit 1
fi

$BB mkdir -p "$SRC"
$BB mount -o remount,rw /system 2>/dev/null || true

# 1. Point the dead HTC/Yahoo DCS hostname at the bridge.
$BB cp /system/etc/hosts "$SRC/hosts.bak"
$BB sed -i '/api\.htc\.go\.yahoo\.com/d' /system/etc/hosts
echo "$BRIDGE_HOST api.htc.go.yahoo.com" >> /system/etc/hosts
$BB chmod 644 /system/etc/hosts

# 2. Install the boot hook with this bridge host baked in.
cat > "$SRC/stock-boot.sh" <<EOF
#!/system/bin/sh
BRIDGE_HOST=$BRIDGE_HOST
BRIDGE_PORT=8090
IPT=/system/bin/iptables
LOG=/data/local/stock-proxy/boot.log

\$IPT -t nat -D OUTPUT -p tcp -d "\$BRIDGE_HOST" --dport 80 -j DNAT --to-destination "\$BRIDGE_HOST:\$BRIDGE_PORT" 2>/dev/null
\$IPT -t nat -A OUTPUT -p tcp -d "\$BRIDGE_HOST" --dport 80 -j DNAT --to-destination "\$BRIDGE_HOST:\$BRIDGE_PORT"

{
  echo "=== \$(date) ==="
  \$IPT -t nat -L OUTPUT -n 2>&1
} >> "\$LOG" 2>&1
EOF
$BB chmod 755 "$SRC/stock-boot.sh"

# 3. Add the rule now.
/system/bin/sh "$SRC/stock-boot.sh"

# 4. Add the boot hook to the existing bootcomplete wrapper.
if $BB test -f /system/bin/bootcomplete.orig; then
  if $BB grep -q 'stock-boot.sh' "$WRAP"; then
    echo "boot hook already present"
  else
    $BB cp "$WRAP" "$SRC/bootcomplete.bak"
    $BB sed -i '/^exec \/system\/bin\/bootcomplete\.orig/i /system/bin/sh /data/local/stock-proxy/stock-boot.sh' "$WRAP"
    $BB chmod 755 "$WRAP"
    echo "boot hook installed"
  fi
else
  echo "No /system/bin/bootcomplete.orig found."
  echo "Add this line before 'exec /system/bin/bootcomplete.orig' manually:"
  echo "  /system/bin/sh /data/local/stock-proxy/stock-boot.sh"
fi

echo '== hosts =='
$BB cat /system/etc/hosts
echo '== nat =='
$IPT -t nat -L OUTPUT -n
