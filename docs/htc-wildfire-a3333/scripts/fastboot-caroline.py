#!/usr/bin/env python3
"""Replay the Revolutionary Caroline payload to an HTC Wildfire (buzz).

This is the Linux-side fastboot client used after the patched Revolutionary
tool has been captured with the Frida AdbWinApi emulator. It speaks the raw
HTC fastboot USB protocol directly, so it does not need the Android fastboot
driver stack.

WARNING: this payload is specific to the HTC Wildfire (buzz). Do not use it on
any other model. A wrong payload can brick the bootloader.

Usage:
    python3 fastboot-caroline.py [--blob caroline-buzz.bin]

The phone must be on the white FASTBOOT screen and connected by USB. The
script uploads the payload and then sends the getvar sequence. The
getvar:mainver response triggers the stub; the phone disconnects and comes
back with the patched HBOOT.
"""

from __future__ import annotations

import argparse
import hashlib
import sys
import time

try:
    import usb.core
    import usb.util
except ImportError:
    sys.exit("pyusb is required: sudo apt install python3-usb")

VID = 0x0BB4
PID = 0x0FFF
CHUNK = 4096
EXPECTED_SIZE = 0x800B8

GETVARS = [
    b"getvar:platform",
    b"getvar:mid",
    b"getvar:product",
    b"getvar:version-bootloader",
    b"getvar:battery-status",
    b"getvar:version-baseband",
    b"getvar:partition-layout",
    b"getvar:security",
    b"getvar:build-mode",
    b"getvar:boot-mode",
    b"getvar:version-tp",
    b"getvar:mainver",  # trigger; must be last
]


def find_device():
    dev = usb.core.find(idVendor=VID, idProduct=PID)
    if dev is None:
        time.sleep(1)
        dev = usb.core.find(idVendor=VID, idProduct=PID)
    return dev


def open_endpoints(dev):
    for cfg in dev:
        for intf in cfg:
            try:
                if dev.is_kernel_driver_active(intf.bInterfaceNumber):
                    dev.detach_kernel_driver(intf.bInterfaceNumber)
            except Exception:
                pass
    try:
        dev.set_configuration()
    except usb.core.USBError:
        pass
    cfg = dev.get_active_configuration()
    intf = cfg[(0, 0)]
    ep_out = usb.util.find_descriptor(
        intf,
        custom_match=lambda e: usb.util.endpoint_direction(e.bEndpointAddress)
        == usb.util.ENDPOINT_OUT,
    )
    ep_in = usb.util.find_descriptor(
        intf,
        custom_match=lambda e: usb.util.endpoint_direction(e.bEndpointAddress)
        == usb.util.ENDPOINT_IN,
    )
    if ep_out is None or ep_in is None:
        raise RuntimeError("bulk endpoints not found")
    return ep_out, ep_in


def read_all(ep_in, timeout_ms=800):
    """Read a fastboot response, which may span several 512-byte packets."""
    out = b""
    while True:
        try:
            data = bytes(ep_in.read(512, timeout=timeout_ms))
        except usb.core.USBError as exc:
            msg = str(exc)
            if "timed out" in msg or "Timeout" in msg:
                break
            if "Overflow" in msg:
                timeout_ms = 200
                continue
            raise
        if not data:
            break
        out += data
        if len(data) < 512:
            timeout_ms = 150
    return out


def command(ep_out, ep_in, cmd: bytes, timeout_ms=5000):
    print(">>", cmd.decode("ascii", "replace"), flush=True)
    ep_out.write(cmd, timeout=10000)
    response = read_all(ep_in, timeout_ms)
    print("<< len=%d %r" % (len(response), response[:200]), flush=True)
    return response


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--blob", default="caroline-buzz.bin")
    args = parser.parse_args()

    data = open(args.blob, "rb").read()
    if len(data) != EXPECTED_SIZE:
        sys.exit(
            "wrong payload size: %d, expected %d (0x%X)"
            % (len(data), EXPECTED_SIZE, EXPECTED_SIZE)
        )
    print("payload: %s" % args.blob)
    print("size: %d" % len(data))
    print("sha256: %s" % hashlib.sha256(data).hexdigest(), flush=True)

    dev = find_device()
    if dev is None:
        sys.exit("device 0bb4:0fff not found; is the phone on FASTBOOT?")
    ep_out, ep_in = open_endpoints(dev)
    print(
        "endpoints out=%02x in=%02x"
        % (ep_out.bEndpointAddress, ep_in.bEndpointAddress),
        flush=True,
    )

    response = command(ep_out, ep_in, b"download:000800b8")
    if not response.startswith(b"DATA"):
        sys.exit("device did not answer DATA: %r" % response)

    print("uploading %d bytes" % len(data), flush=True)
    for offset in range(0, len(data), CHUNK):
        ep_out.write(data[offset : offset + CHUNK], timeout=10000)
    print("upload complete", flush=True)
    time.sleep(0.2)
    print("final: %r" % read_all(ep_in, 15000), flush=True)
    time.sleep(0.5)

    for cmd in GETVARS:
        try:
            command(ep_out, ep_in, cmd, 4000)
        except usb.core.USBError as exc:
            print("USB error after %r: %s" % (cmd, exc), flush=True)
            if cmd == b"getvar:mainver":
                print(
                    "The trigger was sent. The phone should disconnect and "
                    "return with the patched HBOOT.",
                    flush=True,
                )
            break
        time.sleep(0.1)

    print("done; verify with: fastboot getvar version-bootloader", flush=True)
    print("expected: 6.01.1002 and security: off", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
