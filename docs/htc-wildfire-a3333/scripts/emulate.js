// Emulate a fastboot interface at the AdbWinApi layer after the real ADB stage.
// Logs every fastboot command/payload chunk Revolutionary sends.
const frida = require('frida');

const PROC = process.argv[2] || 'revolutionary.exe';
const FAKE_NAME = '\\\\?\\usb#vid_0bb4&pid_0fff#revolutionary#{f72fe0d4-cbcb-407d-8814-9ed673d0dd6b}';
const FAKE_IFACE = 0x0f001001;
const FAKE_READ = 0x0f002001;
const FAKE_WRITE = 0x0f003001;

(async () => {
  let session = null;
  for (let i = 0; i < 100; i++) {
    try {
      session = await frida.attach(PROC);
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  if (!session) {
    console.error('could not attach to ' + PROC);
    process.exit(1);
  }
  console.log('attached to ' + PROC);

  const source = `
    const FAKE_NAME = ${JSON.stringify(FAKE_NAME)};
    const FAKE_IFACE = ${FAKE_IFACE};
    const FAKE_READ = ${FAKE_READ};
    const FAKE_WRITE = ${FAKE_WRITE};

    let realSeen = false;
    let adbUsed = false;
    let injected = false;
    let lastCmd = '';
    let enumCount = 0;
    let injectedThisEnum = false;
    let pendingResp = 'OKAY';
    let respQueue = [];
    let downloadActive = false;
    let downloadRemaining = 0;
    let rebootBlocked = false;
    const BLOCK_REBOOT = false;
    let realIface = 0;
    let realRead = 0;
    let realWrite = 0;

    function isFake(h) {
      const v = h.toInt32 ? h.toInt32() : h;
      return v === FAKE_IFACE || v === FAKE_READ || v === FAKE_WRITE;
    }

    function asciiOf(buf, len) {
      try {
        let s = '';
        for (let i = 0; i < Math.min(len, 400); i++) {
          const c = buf.add(i).readU8();
          if (c === 0) break;
          s += (c >= 32 && c < 127) ? String.fromCharCode(c) : '.';
        }
        return s;
      } catch (e) { return ''; }
    }

    function printableText(buf, len) {
      try {
        let s = '';
        for (let i = 0; i < Math.min(len, 4096); i++) {
          const c = buf.add(i).readU8();
          if (c === 0) break;
          if (c < 32 || c > 126) return null;
          s += String.fromCharCode(c);
        }
        return s.length > 0 ? s : null;
      } catch (e) { return null; }
    }

    function findBytes(buf, len, word) {
      try {
        for (let i = 0; i + word.length <= len; i++) {
          let match = true;
          for (let j = 0; j < word.length; j++) {
            if (buf.add(i + j).readU8() !== word.charCodeAt(j)) { match = false; break; }
          }
          if (match) return i;
        }
      } catch (e) {}
      return -1;
    }

    function utf16Of(buf, maxChars) {
      try {
        let s = '';
        for (let i = 0; i < maxChars; i++) {
          const c = buf.add(i * 2).readU16();
          if (c === 0) break;
          s += String.fromCharCode(c);
        }
        return s;
      } catch (e) { return ''; }
    }

    function writeUtf16(buf, s) {
      for (let i = 0; i < s.length; i++) buf.add(i * 2).writeU16(s.charCodeAt(i));
      buf.add(s.length * 2).writeU16(0);
    }

    function hookAll() {
      const mod = Process.findModuleByName('AdbWinApi.dll');
      if (!mod) { setTimeout(hookAll, 200); return; }
      send({ev:'module', base: mod.base.toString()});

      const closeHandleFn = (function () {
        const p = mod.findExportByName('AdbCloseHandle');
        return p ? new NativeFunction(p, 'int', ['pointer']) : null;
      })();

      function hook(name, onEnter, onLeave) {
        const p = mod.findExportByName(name);
        if (!p) { send({ev:'missing', name:name}); return; }
        Interceptor.attach(p, { onEnter: onEnter, onLeave: onLeave });
      }

      hook('AdbEnumInterfaces', function (args) {
        enumCount = 0;
        injectedThisEnum = false;
      }, function (retval) {
        send({ev:'ENUM', handle:retval.toString()});
      });

      hook('AdbNextInterface', function (args) {
        this.info = args[1];
        this.size = args[2];
      }, function (retval) {
        if (retval.toInt32() !== 0) {
          realSeen = true;
          enumCount++;
          try {
            const p = this.info;
            const sz = this.size.readU32();
            const name = utf16Of(p.add(4), 120);
            send({ev:'REALINFO', size:sz, name:name, head:Array.from(new Uint8Array(p.readByteArray(96))).map(function(b){return b.toString(16).padStart(2,'0');}).join('')});
          } catch (e) { send({ev:'REALINFO', err:String(e)}); }
          return;
        }
        if (adbUsed && (enumCount === 0 || rebootBlocked) && !injectedThisEnum) {
          injectedThisEnum = true;
          injected = true;
          const need = 20 + (FAKE_NAME.length + 1) * 2;
          let cap = 0;
          try { cap = this.size.readU32(); } catch (e) {}
          send({ev:'FAKE', what:'inject', cap:cap, need:need, name:FAKE_NAME});
          try {
            this.info.writeByteArray([0xd4,0xe0,0x2f,0xf7,0xcb,0xcb,0x7d,0x40,0x88,0x14,0x9e,0xd6,0x73,0xd0,0xdd,0x6b]);
            this.info.add(16).writeU32(1);
            writeUtf16(this.info.add(20), FAKE_NAME);
            this.size.writeU32(need);
            retval.replace(1);
            enumCount++;
          } catch (e) { send({ev:'FAKE', what:'inject-error', err:String(e)}); }
        }
      });

      hook('AdbCreateInterfaceByName', function (args) {
        this.name = utf16Of(args[0], 300);
        try { this.hex = Array.from(new Uint8Array(args[0].readByteArray(48))).map(function(b){return b.toString(16).padStart(2,'0');}).join(''); } catch (e) { this.hex=''; }
      }, function (retval) {
        send({ev:'CREATE', name:this.name, hex:this.hex, ret:retval.toString()});
        if (this.name.indexOf('pid_0fff') >= 0 || this.name.indexOf('revolutionary') >= 0) {
          retval.replace(FAKE_IFACE);
          send({ev:'FAKE', what:'create-interface', name:this.name});
        }
      });

      hook('AdbGetSerialNumber', function (args) {
        this.h = args[0]; this.buf = args[1]; this.size = args[2]; this.ansi = args[3].toInt32() !== 0;
      }, function (retval) {
        send({ev:'SERIAL', h:this.h.toString(), ret:retval.toString(), ansi:this.ansi});
        if (isFake(this.h)) {
          // Fake serial: the emulator only needs a non-empty identifier.
          const s = 'FAKE00000000';
          if (!this.buf.isNull()) {
            if (this.ansi) this.buf.writeUtf8String(s); else writeUtf16(this.buf, s);
          }
          if (!this.size.isNull()) this.size.writeU32(s.length + 1);
          retval.replace(1);
        }
      });

      hook('AdbGetInterfaceName', function (args) {
        this.h = args[0]; this.buf = args[1]; this.size = args[2]; this.ansi = args[3].toInt32() !== 0;
      }, function (retval) {
        if (isFake(this.h)) {
          if (!this.buf.isNull()) {
            if (this.ansi) this.buf.writeUtf8String(FAKE_NAME); else writeUtf16(this.buf, FAKE_NAME);
          }
          if (!this.size.isNull()) this.size.writeU32(FAKE_NAME.length + 1);
          retval.replace(1);
        }
      });

      hook('AdbGetUsbDeviceDescriptor', function (args) {
        this.h = args[0]; this.desc = args[1];
      }, function (retval) {
        if (retval.toInt32() !== 0) {
          try { send({ev:'DEVDESC', h:this.h.toString(), ret:retval.toString(), hex:Array.from(new Uint8Array(this.desc.readByteArray(18))).map(function(b){return b.toString(16).padStart(2,'0');}).join('')}); } catch(e) {}
        }
        if (isFake(this.h)) {
          const d = this.desc;
          if (!d.isNull()) {
            d.writeU8(18); d.add(1).writeU8(1);
            d.add(2).writeU16(0x0200);
            d.add(4).writeU8(0); d.add(5).writeU8(0); d.add(6).writeU8(0);
            d.add(7).writeU8(64);
            d.add(8).writeU16(0x0bb4); d.add(10).writeU16(0x0fff);
            d.add(12).writeU16(0x0100);
            d.add(14).writeU8(0); d.add(15).writeU8(0); d.add(16).writeU8(0);
            d.add(17).writeU8(1);
          }
          retval.replace(1);
        }
      });

      hook('AdbGetUsbInterfaceDescriptor', function (args) {
        this.h = args[0]; this.desc = args[1];
      }, function (retval) {
        if (retval.toInt32() !== 0) {
          try { send({ev:'IFDESC', h:this.h.toString(), ret:retval.toString(), hex:Array.from(new Uint8Array(this.desc.readByteArray(9))).map(function(b){return b.toString(16).padStart(2,'0');}).join('')}); } catch(e) {}
        }
        if (isFake(this.h)) {
          const d = this.desc;
          if (!d.isNull()) {
            d.writeU8(9); d.add(1).writeU8(4); d.add(2).writeU8(0); d.add(3).writeU8(0);
            d.add(4).writeU8(2); d.add(5).writeU8(0xff); d.add(6).writeU8(0x42);
            d.add(7).writeU8(0x03); d.add(8).writeU8(0);
          }
          retval.replace(1);
        }
      });

      hook('AdbOpenEndpoint', function (args) {
        this.h = args[0]; this.idx = args[1].toInt32();
        this.access = args[2].toInt32(); this.share = args[3].toInt32();
      }, function (retval) {
        send({ev:'OPENEP', h:this.h.toString(), idx:this.idx, ret:retval.toString()});
        if (isFake(this.h)) {
          if (this.idx === 0xfe) { retval.replace(FAKE_READ); send({ev:'FAKE', what:'openep-read'}); }
          else if (this.idx === 0xfc) { retval.replace(FAKE_WRITE); send({ev:'FAKE', what:'openep-write'}); }
        } else if (retval.toInt32() !== 0) {
          realIface = this.h.toInt32();
          if (this.idx === 0xfe) realRead = retval.toInt32();
          else if (this.idx === 0xfc) realWrite = retval.toInt32();
        }
      });

      hook('AdbOpenDefaultBulkReadEndpoint', function (args) {
        this.h = args[0]; this.access = args[1].toInt32(); this.share = args[2].toInt32();
      }, function (retval) {
        send({ev:'OPEN', which:'read', h:this.h.toString(), ret:retval.toString(), access:this.access, share:this.share});
        if (isFake(this.h)) {
          retval.replace(FAKE_READ);
          send({ev:'FAKE', what:'open-read', handle:FAKE_READ.toString(16)});
        }
      });

      hook('AdbOpenDefaultBulkWriteEndpoint', function (args) {
        this.h = args[0]; this.access = args[1].toInt32(); this.share = args[2].toInt32();
      }, function (retval) {
        send({ev:'OPEN', which:'write', h:this.h.toString(), ret:retval.toString(), access:this.access, share:this.share});
        if (isFake(this.h)) {
          retval.replace(FAKE_WRITE);
          send({ev:'FAKE', what:'open-write', handle:FAKE_WRITE.toString(16)});
        }
      });

      function fillEndpointInfo(info, isRead) {
        try {
          info.writeU32(512);
          info.add(4).writeU32(0x10000);
          info.add(8).writeU32(3);
          info.add(12).writeU8(isRead ? 0x81 : 0x01);
          info.add(13).writeU8(0);
          info.add(14).writeU8(0);
          info.add(15).writeU8(0);
        } catch (e) { send({ev:'EPINFO-ERR', err:String(e)}); }
      }

      hook('AdbGetDefaultBulkReadEndpointInformation', function (args) {
        this.h = args[0]; this.info = args[1];
      }, function (retval) {
        send({ev:'EPINFO', which:'read-default', h:this.h.toString(), ret:retval.toString()});
        if (isFake(this.h)) { fillEndpointInfo(this.info, true); retval.replace(1); }
      });

      hook('AdbGetDefaultBulkWriteEndpointInformation', function (args) {
        this.h = args[0]; this.info = args[1];
      }, function (retval) {
        send({ev:'EPINFO', which:'write-default', h:this.h.toString(), ret:retval.toString()});
        if (isFake(this.h)) { fillEndpointInfo(this.info, false); retval.replace(1); }
      });

      hook('AdbGetEndpointInformation', function (args) {
        this.h = args[0]; this.idx = args[1].toInt32(); this.info = args[2];
      }, function (retval) {
        send({ev:'EPINFO', which:'by-index', idx:this.idx, h:this.h.toString(), ret:retval.toString()});
        if (isFake(this.h)) { fillEndpointInfo(this.info, this.idx === 0xfe); retval.replace(1); }
      });

      hook('AdbQueryInformationEndpoint', function (args) {
        this.h = args[0]; this.info = args[1];
      }, function (retval) {
        send({ev:'EPINFO', which:'endpoint', h:this.h.toString(), ret:retval.toString()});
        if (isFake(this.h)) { fillEndpointInfo(this.info, true); retval.replace(1); }
      });

      hook('AdbWriteEndpointSync', function (args) {
        this.h = args[0]; this.buf = args[1]; this.len = args[2].toInt32(); this.done = args[3];
        const text = printableText(this.buf, this.len);
        if (this.h.toInt32() === FAKE_WRITE) {
          const ascii = asciiOf(this.buf, this.len);
          let hex = '';
          try { hex = Array.from(new Uint8Array(this.buf.readByteArray(Math.min(this.len, 64)))).map(function(b){return b.toString(16).padStart(2,'0');}).join(''); } catch(e) {}
          send({ev:'W', len:this.len, ascii:ascii, text:text, hex:hex});
          if (text) {
            const cmd = text.trim();
            lastCmd = cmd;
            if (cmd.indexOf('download:') === 0) {
              const size = parseInt(cmd.substring(9), 16);
              downloadActive = isFinite(size) && size > 0;
              downloadRemaining = downloadActive ? size : 0;
              respQueue.push('DATA00010000');
            } else if (cmd.indexOf('getvar:') === 0) {
              const name = cmd.substring(7).trim();
              const vals = {
                platform: 'HBOOT-7225',
                mid: 'PC4910000',
                product: 'buzz',
                'version-bootloader': '1.01.0001',
                cidnum: 'VODAP102',
                'battery-status': 'good',
                'battery-voltage': '4180mV',
                'version-baseband': '3.35.20.10',
                'partition-layout': 'H',
                security: 'on',
                'build-mode': 'SHIP',
                'boot-mode': 'FASTBOOT',
                'version-tp': '0x0',
                mainver: '2.22.405.1',
                'commitno-bootloader': '2',
                hbootpreupdate: '12'
              };
              respQueue.push('OKAY' + (vals[name] || ''));
            } else {
              respQueue.push('OKAY');
            }
          } else if (downloadActive) {
            downloadRemaining -= this.len;
            if (downloadRemaining <= 0) {
              downloadActive = false;
              downloadRemaining = 0;
              respQueue.push('OKAY');
              send({ev:'DLDONE'});
            }
          }
        } else if (BLOCK_REBOOT && (findBytes(this.buf, this.len, 'reboot') >= 0 || findBytes(this.buf, this.len, 'oem-42') >= 0)) {
          try {
            function patchAll(word) {
              let base = 0;
              while (base < this.len) {
                const rel = findBytes(this.buf.add(base), this.len - base, word);
                if (rel < 0) break;
                const at = base + rel;
                for (let j = 0; j < word.length; j++) this.buf.add(at + j).writeU8(0x78);
                base = at + word.length;
              }
            }
            patchAll.call(this, 'reboot');
            patchAll.call(this, 'oem-42');
            rebootBlocked = true;
            send({ev:'REBOOT-BLOCKED', text:text, hex:(function(){try{return Array.from(new Uint8Array(this.buf.readByteArray(Math.min(this.len,96)))).map(function(b){return b.toString(16).padStart(2,'0');}).join('');}catch(e){return '';}}).call(this)});
            try {
              if (closeHandleFn) {
                if (realRead) { closeHandleFn(ptr(realRead)); send({ev:'CLOSED-REAL', what:'read', h:realRead}); }
                if (realWrite) { closeHandleFn(ptr(realWrite)); send({ev:'CLOSED-REAL', what:'write', h:realWrite}); }
                if (realIface) { closeHandleFn(ptr(realIface)); send({ev:'CLOSED-REAL', what:'iface', h:realIface}); }
              }
            } catch (e2) { send({ev:'CLOSE-ERR', err:String(e2)}); }
          } catch (e) { send({ev:'REBOOT-BLOCK-ERR', err:String(e)}); }
        }
      }, function (retval) {
        if (this.h.toInt32() === FAKE_WRITE) {
          if (!this.done.isNull()) this.done.writeU32(this.len);
          retval.replace(1);
        } else if (this.h.toInt32() !== FAKE_READ) {
          adbUsed = true;
        }
      });

      // Real ADB reads are unblocked by closing the endpoint from the write hook.
      hook('AdbReadEndpointSync', function (args) {
        this.h = args[0]; this.buf = args[1]; this.len = args[2].toInt32(); this.done = args[3];
      }, function (retval) {
        if (this.h.toInt32() === FAKE_READ) {
          const resp = respQueue.length > 0 ? respQueue.shift() : 'OKAY';
          const bytes = [];
          for (let i = 0; i < resp.length; i++) bytes.push(resp.charCodeAt(i));
          if (this.len >= bytes.length && !this.buf.isNull()) {
            this.buf.writeByteArray(bytes);
            if (!this.done.isNull()) this.done.writeU32(bytes.length);
            retval.replace(1);
          } else {
            if (!this.done.isNull()) this.done.writeU32(0);
            retval.replace(0);
          }
          send({ev:'R', cmd:lastCmd, resp:resp, len:this.len, q:respQueue.length});
        } else if (this.h.toInt32() !== FAKE_WRITE) {
          adbUsed = true;
        }
      });

      hook('AdbCloseHandle', function (args) {
        this.h = args[0];
      }, function (retval) {
        if (isFake(this.h)) retval.replace(1);
      });

      const handled = {
        AdbEnumInterfaces: 1, AdbNextInterface: 1, AdbCreateInterfaceByName: 1,
        AdbGetSerialNumber: 1, AdbGetInterfaceName: 1,
        AdbGetUsbDeviceDescriptor: 1, AdbGetUsbInterfaceDescriptor: 1,
        AdbOpenDefaultBulkReadEndpoint: 1, AdbOpenDefaultBulkWriteEndpoint: 1,
        AdbOpenEndpoint: 1,
        AdbGetDefaultBulkReadEndpointInformation: 1, AdbGetDefaultBulkWriteEndpointInformation: 1,
        AdbGetEndpointInformation: 1, AdbQueryInformationEndpoint: 1,
        AdbWriteEndpointSync: 1, AdbReadEndpointSync: 1, AdbCloseHandle: 1
      };
      mod.enumerateExports().forEach(function (exp) {
        if (exp.name.indexOf('Adb') !== 0) return;
        if (handled[exp.name]) return;
        try {
          Interceptor.attach(exp.address, {
            onEnter: function (args) {
              var a = [];
              for (var i = 0; i < 4; i++) { try { a.push(args[i].toString()); } catch (e) { a.push('?'); } }
              send({ev:'GEN-C', name:exp.name, a:a});
            },
            onLeave: function (retval) { send({ev:'GEN-E', name:exp.name, ret:retval.toString()}); }
          });
        } catch (e) { send({ev:'GEN-ERR', name:exp.name, err:String(e)}); }
      });
    }
    hookAll();
  `;

  const script = await session.createScript(source);
  script.message.connect((m) => {
    if (m.type === 'send') {
      const p = m.payload;
      if (p.ev === 'W') console.log('W len=' + p.len + ' text=' + JSON.stringify(p.text) + ' ascii=' + JSON.stringify(p.ascii) + ' hex=' + p.hex);
      else if (p.ev === 'R') console.log('R cmd=' + JSON.stringify(p.cmd) + ' resp=' + p.resp + ' len=' + p.len);
      else if (p.ev === 'DLDONE') console.log('DLDONE payload complete');
      else console.log(JSON.stringify(p));
    } else {
      console.log('script:', JSON.stringify(m));
    }
  });
  await script.load();
  console.log('emulator loaded');
  process.stdin.resume();
})();
