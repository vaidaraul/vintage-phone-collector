# Game compatibility

Tested on the rooted HTC Wildfire A3333 running the WWE Froyo `2.22.405.1` build: Android 2.2.1 (API 8), 528 MHz ARM11, Adreno 200, 240x320, 384 MB RAM. Test APKs are kept outside Git.

For the classic accelerometer/microphone novelty apps, see [CASUAL.md](CASUAL.md).

## Summary

| Game | Package / build | Result | Notes |
| --- | --- | --- | --- |
| Doodle Jump | `com.realarcade.DOJ` 1.3.0 | Works | RealArcade/RealNetworks 2009 signature; offline Java/MIDlet port |
| Skater Boy | `com.game.SkaterBoy` 1.6 (versionCode 10) | Playable, marginal | Re-signed 0.75x timing-cap build; ~19 FPS, visibly choppy |
| Angry Birds | `com.rovio.angrybirds` 3.1.0 | Not playable | Requires OpenGL ES 2.0; stock kernel has no GPU device |
| Angry Birds | `com.rovio.angrybirds` 1.0.0 KA3D port | Not playable | ES 1.x, but its EGL config chooser throws |
| Angry Birds Seasons | `com.rovio.angrybirdsseasons` 1.1.1 | Not playable | ARMv6 ES 1.1 build installs, but hangs on a blue frame; no menu |
| Temple Run | `com.imangi.templerun` 1.0.0 | Not playable | armeabi-v7a only and requires ES 2.0; install fails with native ABI mismatch |
| Subway Surfers | `com.kiloo.subwaysurf` 1.0 (3) | Not playable | Unity/Mono; `armeabi-v7a` only; Froyo rejects install with native ABI mismatch |
| Plants vs. Zombies | `com.ea.game.pvzfree_row` 1.1.44 (52) | Not playable | minSdk 9 (Froyo is API 8); `libpvz.so` needs ES 2.0; 2011 release also excluded HTC Aria |
| Fruit Ninja | `com.halfbrick.fruitninja` 1.3 (1301) | Playable with patch | Official build ~8 FPS; 160x120 half-res patched build ~25–50 FPS, softer image |
| Cut the Rope | `com.zeptolab.ctr.ads` 1.4.1 (9) | Playable, slow | Free ad build; ARMv6/ES 1.1; two levels played, somewhat slow |
| Hill Climb Racing | `com.fingersoft.hillclimb` 1.0.0 | Not playable | Cocos2d-x; ARMv6 `armeabi` library exists, but it links `libGLESv2.so` and needs ES 2.0 |
| Logo Quiz Ultimate | `de.androidcrowd.logoquiz` 2.2 | Works | Pure Java, minSdk 8; menu, level grid and answer input verified |
| Pou | `me.pou.app` 1.0.31 (31) | Works | Pure Java, minSdk 4; kitchen, food carousel and Fridge UI verified |
| Talking Tom Cat | `com.outfit7.talkingtom` 1.0 (1) | Works | Original ARMv6 build; full scene, head and milk interactions verified |
| Jetpack Joyride | `com.halfbrick.jetpackjoyride` 1.5 | Crashes | Historical: SIGILL in `libmortargame.so` |

## Doodle Jump

- Package `com.realarcade.DOJ`; resource version `1.3.0`; signed by RealArcade/RealNetworks in 2009.
- SHA-256: `db578b60fb16e2cf17e9968d8541e6cb21f33f3f3615ced26f71842576f60bf2`.
- Installed with `adb install -r`. The replace install preserved existing app data.
- Verified on the phone: sound prompt, main menu, high-score screen, help overlay, and in-game rendering at 240x320. The optical trackpad/DPAD navigates the menus. The game is self-contained and has no network dependency.
- The APK stays outside Git. It came from an Internet Archive preservation item; its MD5 matched the archive's `7c1008da25c0cf45b25ae686c4b51b50`.

## Skater Boy

- Package `com.game.SkaterBoy`; versionName `1.6`; versionCode `10`; `minSdkVersion 7`. The tested APK is a classic 1.6 release downloaded from Uptodown; its SHA-256 matches the archived copy.
- Original APK: 7,301,719 bytes; SHA-256 `18c7922b473956a7d96c1f8f093444dfd6864b0e589cc3d6bfb403134e5268e2`. It stays outside Git.
- Stock behavior: the game launches and is playable, but its main update loop clamps the frame delta to 1/35 s (0.02857 s). On the Wildfire's software GL path it renders at about 18–19 FPS, so the clamped update limits game speed to roughly 0.5x. The result looks smooth but runs at about half speed.
- A raw-delta test build fed the real frame delta into the update and restored approximately 1x average speed. At about 19 FPS it advanced almost a whole extra frame per update, which looked like fast-forward with skipped frames. That build is preserved as `skaterboy-1.6-speedfix.apk` (7,294,140 bytes; SHA-256 `45a4354fc770d6075efedf18d4471b96e3a3a8cd40676b3756a7773b411d149a`; patched `classes.dex` SHA-256 `57fc8603674f9b66cbf402660c0f4d815ab18514d13b5736bf71a747b39f7763`). It is not the recommended build.
- Recommended build: the original update path is kept, but the clamp constant is raised from 1/35 s to 0.04 s. This limits the largest step, gives approximately 0.75x at 19 FPS (about 0.8x at 20 FPS), and runs at native speed once the phone reaches about 25 FPS. The patched APK is 7,294,138 bytes; SHA-256 `edfbee2a8b9d2f6ecacdc10e17954edad831f8a0ec7b0830f52059a8b592a9d1`; patched `classes.dex` SHA-256 `0fa27d1ab1858a777d692df4fb7f2f34a5858be861d6e078557f95a066f9f4ae`.
- Verified on the phone: it launches, loads the restored save, and is playable. The result is marginal but usable: slower than a true 1x and visibly choppy at 19 FPS, but considerably closer to the intended speed than the stock build. There is no low-quality or render-scale setting in this release.
- The patched APK is re-signed with a local self-signed compatibility key. The signer differs from the original RunnerGames APK, so future official updates cannot be installed over it. Back up `/data/data/com.game.SkaterBoy` first (root is required), uninstall the patched build, install the replacement, then restore the data with the new package UID. On this Froyo image an in-place reinstall failed with `INSTALL_FAILED_INSUFFICIENT_STORAGE` despite free space; a clean uninstall/install succeeded.
- No firmware, GPU driver, `/system`, or CPU-governor changes were made. The original and patched APKs are kept outside Git.

## Fruit Ninja

- Package `com.halfbrick.fruitninja`; the tested build is Fruit Ninja Classic `1.3`, versionCode `1301`, `minSdkVersion 4`. Its only native library is `lib/armeabi/libfruitninja.so` (ARMv5TE), and it links `libGLESv1_CM.so`, so it does not require OpenGL ES 2.0.
- Original APK: 14,821,263 bytes; SHA-256 `cbae071b4fc1a600ce59bafd94e6b629ee15810e9673b1791fdc22e3b7a7f964`. It was obtained from APKMirror and stays outside Git.
- Stock behavior: it installs and launches, but the menu holds about 125 ms/frame (~8 FPS). Gameplay is variable and visibly slow. The bottleneck is the 528 MHz ARM11 rendering through `libGLES_android.so`; the kernel exposes no `/dev/kgsl-3d0` GPU device. Moving the app from the SD card to internal storage removed one variable but did not make the stock build playable.
- A later official build, `1.5.2` (versionCode `1502`; 11,920,424 bytes; SHA-256 `ac8f4988922256948afe5c6bdbd65145c582a94cbff08eb15b025df628edce9e`), was tested and was worse: about 218 ms/frame (~4.6 FPS) on the menu. It is not recommended.
- The recommended build is a locally patched 1.3:
  - `FruitNinjaView.init` is changed to call `SurfaceHolder.setFixedSize(160, 120)` after `setFormat`. SurfaceFlinger scales the 160x120 surface by 2x to the 320x240 landscape view.
  - `FruitNinjaView.onTouchEvent` halves the X/Y values before passing them to `NativeGameLib.touchEvent`, so the visible UI and touch targets stay aligned.
  - Patched APK: 14,804,806 bytes; SHA-256 `67322e0b00b55c8699ece623f377224a036173758c9882f16f2e9fd8fd0c6472`; patched `classes.dex` SHA-256 `f90cca591fa18bf59d4c70438c30b149b998841c37cf6c3ad636e69f6f346c3a`.
  - Measured on the phone: menu about 44–48 ms/frame (~21–23 FPS); gameplay samples 16–44 ms, mostly 20–35 ms (about 25–50 FPS). The owner confirmed it is playable. The 160x120 internal resolution makes text and fruit edges visibly soft.
- A hard 30 FPS cap was attempted by setting `debug.egl.swapinterval 2`. On the software EGL path the observed frame time rose to about 56 ms (~18 FPS) instead of a clean 33 ms cap, so the setting was reverted. The recommended APK stays uncapped and uses the game's normal frame pacing.
- OpenFeint 0.9 is embedded. On this phone it repeatedly tries to reach the dead `api.openfeint.com` service and logs SSL hostname errors; it does not block offline play and no account is required. The core modes work without network.
- The patched APK is re-signed with a local compatibility key. It cannot be installed over the original Halfbrick-signed APK. Back up `/data/data/com.halfbrick.fruitninja` first (root required), uninstall, install the patched APK, then restore the data with the new package UID. An in-place update produced `INSTALL_FAILED_INSUFFICIENT_STORAGE` despite free space; a clean uninstall/install worked.
- No firmware, GPU driver, `/system`, or CPU-governor changes were made. The original and patched APKs and the save backup stay outside Git.
- The earlier note about 1.7.5 was a historical observation from a different build and was not re-measured in this pass.

## Cut the Rope

- Package `com.zeptolab.ctr.ads`; tested version `1.4.1` (versionCode `9`; `minSdkVersion 4`; `targetSdkVersion 13`; 21,823,043 bytes; SHA-256 `e2355938a886ac5e70c93f02bf35f4413f8693c519fd3c5dfd05746789b80d60`). This is the free, ad-supported ZeptoLab build; it was obtained from APKMirror and stays outside Git.
- The APK ships `lib/armeabi/libctr-jni.so` and `lib/armeabi-v7a/libctr-jni.so`. The ARMv6 library is ARMv5TE (`Tag_CPU_arch: v5TE`) and links `libGLESv1_CM.so`, not `libGLESv2.so`, so it runs on the Wildfire's software OpenGL ES 1.1 path.
- Install and launch succeed. The splash screen takes about 16 seconds to appear on first launch. The game then opens the tutorial in landscape at 320x240. Ad/analytics calls fail offline (`UnknownHostException: data.flurry.com`), but they do not block the game.
- Verified on the phone: the owner played two levels. The game is somewhat slow but playable; no frame-rate measurement was taken in this pass. It remains installed.
- No firmware, GPU driver, `/system`, or CPU-governor changes were made. The APK stays outside Git.

## Hill Climb Racing

- Package `com.fingersoft.hillclimb`; tested version `1.0.0` (versionCode `5`; `minSdkVersion 8`; 7,156,298 bytes; SHA-256 `ecf63cab1c2cfe4c93d602bce3735dc48bdd1e5b66ea738ce4158b03e7d8325`). It was obtained from APKMirror and stays outside Git.
- The APK contains both `lib/armeabi/libgame.so` and `lib/armeabi-v7a/libgame.so`. The `armeabi` library is ARMv5TE, so installation on the Wildfire succeeds.
- Both libraries link `libGLESv2.so`, and the APK ships Cocos2d-x vertex and fragment shaders under `assets/shaders/`. This is an OpenGL ES 2.0 renderer, not an ES 1.x path.
- Launch result: the process starts and loads `libgame.so`, then logs `D/activity: Your device doesn't support OpenGLES 2.0`. The app aborts into a `NullPointerException` in `AdManager.getPrefValueString` (`AdManager.java:353`) instead of exiting cleanly. No gameplay is reached.
- The Wildfire's kernel exposes no `/dev/kgsl-3d0` and the system has only the software `libGLES_android.so` ES 1.1 path, so there is no ES 2.0 context to create. This is the same limitation documented under Angry Birds.
- Hill Climb Racing was uninstalled after testing. The APK stays outside Git for provenance.

## Logo Quiz Ultimate

- Package `de.androidcrowd.logoquiz`; tested version `2.2` (versionCode `34`; `minSdkVersion 8`; 27,302,516 bytes; SHA-256 `52efaf205401a94004d4d0b71df0024719ffc38a82373d52b349b304e7484307`). This is the symblCrowd release; the APK stays outside Git.
- The APK has no native libraries. It is a pure Java/Android app with 1,593 assets, mostly logo PNGs, so the Wildfire's ARMv6 CPU and software GL are not a compatibility problem.
- Verified on the phone: the first launch shows an "update database, do not cancel" dialog while it unpacks `logoquiz.sqlite`; the main menu then shows Play, Leaderboard, Statistics, Achievements, About, and More Games. Tapping Play opens the level list; Level 1 shows the 50-logo grid. Tapping Apple opens the answer screen with the on-screen keyboard; typing `apple` and pressing Enter marks the logo with a green check.
- The app is ad-supported (InMobi, AdMob, Flurry, Swarm, and others). On this phone it logs some ad/network errors and repeated `IllegalStateException` messages from the level loader, but the offline quiz flow remains usable. The first launch's database update takes a little time.
- Uptodown lists 2.5 as the other Android 2.2-compatible build; 4.3 requires Android 2.3 and is not Froyo-compatible. The 2.2 build is the one verified.
- No firmware, `/system`, or GPU changes were made. The APK stays outside Git.

## Pou

- Package `me.pou.app`; tested version `1.0.31` (versionCode `31`; `minSdkVersion 4`; 8,238,768 bytes; SHA-256 `209f68cd0ed4ea49fa2e777cb35d1fc4d8041b5ed2206e9bc26b37baf7ac08da`). It is the Zakeh release and stays outside Git.
- The APK has no native libraries; it is pure Java and installs on Froyo. Launch took about 3.7 seconds. The 240x320 kitchen renders correctly, the food carousel switches between Fries and Cherries, and the Fridge inventory opens. Touch input is confirmed.
- The newer `1.4.70` build (versionCode `215`; 21,498,345 bytes; SHA-256 `8602bc76cf2c98a6ea8424594211c34d9e748a83528960afb5379b7b1906d278`) also declares `minSdkVersion 4`, but it could not be installed on the current phone: `/data` had about 25 MB free and `adb install` returned `INSTALL_FAILED_INSUFFICIENT_STORAGE`. The `1.0.31` APK was installed directly from `/sdcard` with `pm install`, avoiding the extra `/data/local/tmp` copy. With about 18 MB of free `/data`, 1.0.31 is the practical Froyo build.
- The feeding drag was not completed during remote testing because the HTC Stocks app repeatedly auto-opened and stole focus. The kitchen, food carousel and Fridge were verified; the app remains installed for a hands-on feeding test.
- No firmware, `/system`, or GPU changes were made. The APK stays outside Git.

## Talking Tom Cat

- Package `com.outfit7.talkingtom`; tested version `1.0` (versionCode `1`; `minSdkVersion 3`; 13,203,425 bytes; SHA-256 `b61e6d8b6d3e97f9af5e43e7fbaaa5c3b264c59b7e4b1ab497f514616e5ff7e9`). This is the original Outfit7 release and stays outside Git.
- The only native library is `lib/armeabi/libsoundtouch.so`, an audio pitch-shift library. There is no native GL renderer and no ES 2.0 dependency. It installs and launches in about 2.1 seconds.
- Verified on the phone: the full 240x320 cat scene renders, tapping Tom's head makes him close his eyes and change expression, and tapping the milk carton makes him drink. AdMob requests fail offline with `UnknownHostException`; they do not block the app.
- The voice-repeat feature was not exercised because the test was remote and no audio was spoken into the microphone. The app holds `RECORD_AUDIO` and loads `libsoundtouch.so`; the phone's microphone is already verified by the Lighter and Candle blow tests. It remains installed.
- No firmware, `/system`, or GPU changes were made. The APK stays outside Git.

## Angry Birds

Three builds were tested. All install, but none reaches gameplay.

### Official 3.1.0

- Package `com.rovio.angrybirds`; `minSdkVersion 8`; `targetSdkVersion 13`; native `armeabi` library; requires OpenGL ES 2.0 (`uses-feature glEsVersion=0x00020000`).
- SHA-256: `a21719a7b2fb6546b79ef4e15bfb38cf8154b2edf2f3bbb7641dbca7ddd5b1e0`.
- Launch result: the process and activity start, then EGL config selection fails with `java.lang.IllegalArgumentException: No configs match configSpec`. Logcat shows only `loaded /system/lib/egl/libGLES_android.so`.

### 1.0.0 KA3D port

- Package `com.rovio.angrybirds`; activity `com.rovio.ka3d.App`; ARMv5TE `libangrybirds.so`; uses `GL10` (ES 1.x); the manifest marks ES 2.0 as optional. It is signed with a debug key, so treat it as an untrusted repack, not an official Rovio build.
- SHA-256: `c80ed55b5a7e594653402217b61569049300358d2c2f6c4515c867608104c477`.
- Launch result: the process and activity start, then `FATAL EXCEPTION: GLThread 7`: `java.lang.IllegalArgumentException` at `com.google.android.gles_jni.EGLImpl.eglGetConfigAttrib`, called from `MySurfaceView$ConfigChooser.findConfigAttrib` (`App.java:245`).

### Angry Birds Seasons 1.1.1

- Package `com.rovio.angrybirdsseasons`; versionName `1.1.1`; versionCode `111`; `minSdkVersion 4`; 12,872,398 bytes; SHA-256 `114b810306ceab1e04fac49d3581cece65acdc988524384914a19995c40be2f2`. It was obtained from APKMirror and stays outside Git.
- This is an ARMv6 build: `lib/armeabi/libangrybirds.so` is ARMv5TE and links only `libGLESv1_CM.so`, so it does not need ES 2.0. It installs and starts on the Wildfire.
- Result: the activity reaches the foreground and loads the software GL driver, but the screen stays a solid blue frame for more than a minute. No menu, loading graphic, or gameplay appears. AdMob and Flurry requests complete with "No fill"; the process remains CPU-busy. It was uninstalled after testing.
- This is a different failure from the ES 2.0 builds: the app is ES 1.1 and ARMv6-compatible, but the KA3D renderer does not reach a usable frame on this software-GL/528 MHz device.

### Why it fails

- The app's config chooser queries `EGL_DEPTH_SIZE`, `EGL_STENCIL_SIZE`, `EGL_RED_SIZE`, `EGL_GREEN_SIZE`, `EGL_BLUE_SIZE`, and `EGL_ALPHA_SIZE` for each candidate config. On this Froyo software EGL implementation, at least one query throws instead of returning `EGL_FALSE`; the app does not catch it.
- The stock kernel exposes no `hw3dc` device: `/proc/devices` and `/dev` have no `hw3dc`, and `/system/lib/modules` contains only `bcm4329.ko`. The Qualcomm EGL driver is present but cannot initialize.
- Adding `/system/lib/egl/egl.cfg`:

  ```text
  0 0 android
  0 1 qcom
  ```

  makes `libEGL` load `libGLES_qcom.so`, but it fails with `E/EGL.oem: could not open hw3dc` and `E/libEGL: No EGLDisplay for hardware EGL!`. The change was reverted.
- Replacing `libGLES_android.so` with the CM7 buzz build's software driver produced the same `eglGetConfigAttrib` exception. The stock Froyo driver was restored.
- The CM7 buzz zip also contains only `libGLES_android.so`; it does not provide the Qualcomm driver.
- The Wildfire is effectively OpenGL ES 1.1 software-only. Angry Birds for Android requires ES 2.0. A custom kernel that exposes `hw3dc` would be required; that is a separate, higher-risk project and was not attempted.

### Cleanup

- Angry Birds was uninstalled after testing.
- `egl.cfg` was removed; `/system/lib/egl/libGLES_android.so` was restored to the stock 114,120-byte Froyo file; `/system` was remounted read-only.
- Doodle Jump and the patched Skater Boy build remain installed and verified.

## Temple Run

- Package `com.imangi.templerun`; versionName `1.0.0`; versionCode `3`; `minSdkVersion 7`; `targetSdkVersion 15`. The tested APK is the earliest official Android release, obtained from APKMirror: 26,998,867 bytes; SHA-256 `d42e8799fa7b43365e0390bc7f27b3718ef7df366d873f8f1a439bafcbbb60ec`. It stays outside Git.
- The manifest requires OpenGL ES 2.0 (`uses-feature android:glEsVersion="0x00020000"`), an accelerometer, and multitouch.

### Why it fails

- Native code is `armeabi-v7a` only: `lib/armeabi-v7a/libmono.so` and `libunity.so`. Both are ELF ARMv7 shared objects with `Tag_CPU_arch: v7`, Thumb-2, and VFPv2.
- The Wildfire reports `ro.product.cpu.abi=armeabi` (ARMv6). Installation is rejected with `INSTALL_FAILED_INVALID_APK`; logcat shows `Native ABI mismatch from package file` and `Package couldn't be installed`.
- Bypassing the ABI check would not help: the game requires ES 2.0, while this stock Froyo image has no `/system/lib/egl/egl.cfg`, no `/dev/hw3dc`, and only the software `libGLES_android.so` path. This is the same GPU limitation documented under Angry Birds. A working ES 2.0 driver and kernel GPU device would be required.
- Unofficial “ARMv6” repacks circulated in 2012, but their hashes do not match the official APK and at least one was publicly flagged as modified. They were not trusted or tested.

### Cleanup

- The failed install left only `/data/data/com.imangi.templerun`; it was removed. The game is not installed.

## Subway Surfers

- Package `com.kiloo.subwaysurf`; tested version `1.0` (versionCode `3`; `minSdkVersion 8`; `targetSdkVersion 15`; 22,882,094 bytes; SHA-256 `7843365cf5726abfcde31964e268ed3b4944e4df8efe9bb181be1aacea2d6e71`). This is the earliest official Android release and the only one that lists Android 2.2 support. It was obtained from APKMirror and stays outside Git.
- The APK is a Unity 3.x/Mono game. Its only native libraries are `lib/armeabi-v7a/libmono.so` and `lib/armeabi-v7a/libunity.so`, with matching copies under `assets/libs/armeabi-v7a/`. `readelf -A` on `libunity.so` reports `Tag_CPU_name: "7-A"` and `Tag_CPU_arch: v7`, so the code is ARMv7, not ARMv6.
- The full engine under `assets/libs/armeabi-v7a/libunity.so` references both `libGLESv1` and `libGLESv2`, so the renderer has an ES 1.x path. The blocker is the CPU architecture: the Wildfire reports `ro.product.cpu.abi=armeabi` (ARMv6).
- `adb install` fails. The client prints `Failure [INSTALL_FAILED_INVALID_APK]`; logcat shows `W/PackageManager: Native ABI mismatch from package file` followed by `Package couldn't be installed`. This is the same installer behavior seen with Temple Run.
- There is no ARMv6 build to fall back to. Version 1.0.1 and later require Android 2.3.3 (`minSdkVersion 10`), so 1.0 is the only Froyo-compatible release, and it is ARMv7-only. Bypassing the ABI check would not make it run on the ARMv6 CPU.
- The failed install left only an empty `/data/data/com.kiloo.subwaysurf/lib` directory; it was removed. No package, APK, or save data was created. The APK stays outside Git for provenance.

## Plants vs. Zombies

- APKMirror's earliest listed free ARM build is Plants vs. Zombies FREE `1.1.44` (versionCode `52`; `minSdkVersion 9`; `targetSdkVersion 23`; 9,568,521 bytes; SHA-256 `f3c7fc9754f1abce2b97c2f8f326bec7147c43e2b9c6879cde24a61eb54b6fad`). It is EA-signed and stays outside Git.
- The APK's native libraries are all under `lib/armeabi` (`libgnustl_shared.so`, `libnimble.so`, `libpvz.so`). `libpvz.so` is ARMv5TE (`Tag_CPU_arch: v5TE`), so the CPU ABI is not the blocker. However, it links `libGLESv2.so` and `libOpenSLES.so`, so the engine requires OpenGL ES 2.0 and Android 2.3-era OpenSL ES. The Wildfire has only the software ES 1.1 path.
- The manifest also blocks installation on Froyo: `minSdkVersion 9` requires Android 2.3 or newer. `adb install` returns `Failure [INSTALL_FAILED_OLDER_SDK]`; logcat shows `Requires newer sdk version #9 (current version is #8)`. Nothing was installed and no app data was created.
- Bypassing the manifest check would not make it playable: the renderer needs ES 2.0, which this stock Froyo image does not provide. This is the same GPU limitation documented under Angry Birds and Hill Climb Racing.
- The original paid 2011 release claimed Android 2.2 support, but PopCap's published compatibility list explicitly excluded the HTC Aria, another ARMv6 HTC phone, and the contemporaneous requirements listed HVGA (320x480) as the smallest supported resolution. The Wildfire is 240x320.
- A trustworthy original 1.0 APK was not located. An Internet Archive upload labeled "paid version" was a debug-signed 6.1.11 repack requiring Android 4.0.3, so it was inspected and rejected without installation.
- No firmware, GPU driver, `/system`, or CPU-governor changes were made. The official 1.1.44 APK stays outside Git.

## Testing notes

- Froyo has no `screencap`. To capture the screen, read `/dev/graphics/fb0` as root: 240x640 RGB565, two 240x320 buffers; split and convert to PNG. The capture script is kept outside Git with the test APKs.
- Use `adb shell input keyevent` for the optical trackpad (`19` up, `20` down, `23` center, `4` back). Froyo's `input` command does not support tap or swipe.
- Skater Boy's frame rate came from its engine's own `Current Fps` counter in a temporary diagnostic build; the production APK leaves debug logging disabled. It held around 18–19 FPS after loading.
- Check `adb shell dumpsys window` for focus and `adb logcat` for EGL/native errors.
