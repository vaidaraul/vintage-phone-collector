#!/bin/bash
# Start the HTC DGW stock bridge.
# Use --if-needed from cron so a running bridge is left alone.
set -u
cd "$(dirname "$0")" || exit 1
PORT="${PORT:-8090}"

if [ "${1:-}" = "--if-needed" ] && pgrep -f 'stock-bridge.py' >/dev/null 2>&1; then
  exit 0
fi

pkill -f 'stock-bridge.py' 2>/dev/null || true
sleep 1
PORT="$PORT" setsid nohup python3 stock-bridge.py >> bridge.log 2>&1 < /dev/null &
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS "http://127.0.0.1:$PORT/healthz" >/dev/null 2>&1; then
    exit 0
  fi
  sleep 1
done
exit 0
