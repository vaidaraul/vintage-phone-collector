import os
import struct
import sys

CHUNK = 2048
NAME_OFF = 0x0A
MODE_OFF = 0x10C
FSIZE_OFF = 0x124

TARGETS = """
AdobeReader AppSharing DebugTool FieldTest Flickr FriendStream
com.htc.FriendStreamWidget HtcFacebook HtcTwitter com.htc.TwitterWidget
Stock com.htc.StockWidget DCSStock DCSImpl DCSUtility
teeter QxdmLog TransferData UpgradeSetup Updater WidgetDownloadManager
HtcMessageUploader PluginManager HtcCopyright Quickoffice PCSCII
MediaUploader Street YouTube Talk Gmail Maps GoogleFeedback
LatinImeTutorial MarketUpdater restartapp
""".split()

target_names = set()
for t in TARGETS:
    target_names.add(t + '.apk')
    target_names.add(t + '.odex')


def parse_header(b, off):
    t, parent = struct.unpack_from('<II', b, off)
    if t < 1 or t > 5:
        return None
    raw = b[off + NAME_OFF:off + NAME_OFF + 256].split(b'\0')[0]
    if not raw:
        return None
    try:
        name = raw.decode('utf-8')
    except Exception:
        return None
    if any(ord(c) < 32 for c in name):
        return None
    mode, uid, gid, atime, mtime, ctime, fsize = struct.unpack_from('<IIIIIII', b, off + MODE_OFF)
    return dict(type=t, parent=parent, name=name, mode=mode, fsize=fsize)


def main(image, outdir):
    b = open(image, 'rb').read()
    n = len(b) // CHUNK
    os.makedirs(outdir, exist_ok=True)
    found = {}
    for i in range(n):
        h = parse_header(b, i * CHUNK)
        if not h or h['type'] != 1 or h['name'] not in target_names:
            continue
        size = h['fsize']
        if size <= 0 or size > 64 * 1024 * 1024:
            continue
        data = b[(i + 1) * CHUNK:(i + 1) * CHUNK + size]
        if len(data) != size:
            print('truncated', h['name'], size, len(data), file=sys.stderr)
            continue
        magic = data[:8]
        if h['name'].endswith('.apk') and magic[:4] != b'PK\x03\x04':
            print('bad apk magic', h['name'], magic.hex(), file=sys.stderr)
            continue
        if h['name'].endswith('.odex') and magic != b'dey\n036\x00':
            print('bad odex magic', h['name'], magic.hex(), file=sys.stderr)
            continue
        found.setdefault(h['name'], []).append((size, i, data))

    total = 0
    for name in sorted(found):
        items = found[name]
        items.sort(key=lambda x: x[0], reverse=True)
        size, chunk, data = items[0]
        path = os.path.join(outdir, name)
        with open(path, 'wb') as f:
            f.write(data)
        total += 1
        if len(items) > 1:
            print('duplicate', name, [(x[0], x[1]) for x in items], file=sys.stderr)
        print('%-42s size=%-8d chunk=%d' % (name, size, chunk))

    missing = sorted(target_names - set(found))
    print('\nExtracted', total, 'files to', outdir)
    print('Not present in image (usually no odex):')
    for m in missing:
        print(' ', m)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
