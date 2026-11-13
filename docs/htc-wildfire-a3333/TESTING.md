# Game testing process

This is the repeatable procedure used to inspect, install, exercise and classify every title in [GAMES.md](GAMES.md). It records the lab method for the rooted HTC Wildfire A3333 on stock Froyo 2.2.1. Test APKs, save backups and helper scripts stay outside Git.

## Evidence rules

- Record only what was observed on the phone: package and version, install path, foreground activity, screenshots, logcat lines, tombstones and measured frame times.
- Keep "installs", "launches", "reaches the menu", "reaches gameplay" and "is playable" separate. A live process that never draws a usable frame is not a working game.
- A clean install is not proof of compatibility. Exercise at least one menu branch and one gameplay action where the game provides them.
- Mark repacks and locally re-signed builds as provisional. Record the patch, the new hash and the fact that the signature changed.
- Do not change firmware, `/system`, GPU drivers or CPU governors for a game test. Stop and report if a test seems to require one.

## Common harness

### 1. Inspect the APK before installing

Use the local APK inspector (manifest, signer and native-library list) and the install-location checker; both are kept outside Git. Then unpack and inspect the libraries directly:

```text
unzip -l app.apk
readelf -A lib/armeabi/<library>.so
readelf -d lib/armeabi/<library>.so
strings lib/armeabi/<library>.so | grep -E 'libGLESv[12]'
```

Record:

- package, versionName, versionCode, `minSdkVersion`, `targetSdkVersion`, `installLocation`;
- signing certificate subject and whether the build is official or debug-signed;
- APK size and SHA-256;
- native libraries, `Tag_CPU_arch` and `NEEDED` entries.

Flag as likely incompatible when `minSdkVersion` is above 8, when the only native code is `armeabi-v7a`, when the engine links `libGLESv2.so`, or when the signer is not the expected publisher. Confirm with an install or launch attempt where useful, but do not bypass the manifest or ABI check. A debug-signed repack is tested only with explicit approval.

### 2. Install to SD

```text
adb push app.apk /sdcard/app.apk
adb shell pm install -s /sdcard/app.apk
adb shell pm path <package>
adb shell df /data
```

- `Success` is required. Record `INSTALL_FAILED_OLDER_SDK`, `INSTALL_FAILED_INVALID_APK` (ABI mismatch), `INSTALL_FAILED_INSUFFICIENT_STORAGE` and `INSTALL_FAILED_INVALID_INSTALL_LOCATION` as results.
- If the APK does not support external installation, a manifest-only change from `installLocation=auto` to `preferExternal` may be used. Re-sign locally, record the new hash and mark the result provisional.
- Install from `/sdcard` rather than copying through `/data/local/tmp` when `/data` is tight.

### 3. Launch and confirm the foreground activity

```text
adb logcat -c
adb shell am start -n <package>/<activity>
sleep 8
adb shell dumpsys window | grep mCurrentFocus
adb shell ps | grep <package>
```

- The expected package activity must hold focus. Launcher, `Keyguard` or HTC Stocks means the game is not in the foreground.
- Wake or unlock with `adb shell input keyevent` if needed. Do not disable Stocks. If Stocks repeatedly steals focus, pause the test and report it.
- Allow 10-20 seconds for large native games and record the cold-start time.

### 4. Capture the frame

Froyo has no `screencap`. As root, read `/dev/graphics/fb0`; it contains 240x640 RGB565 pixels as two 240x320 buffers. Run the local framebuffer helper, pull `/sdcard/fb0.raw`, then split and convert both buffers to PNG.

Inspect both images: the active buffer alternates, so one image may be the previous frame. Rotate landscape captures before reading labels; do not assume the raw image orientation.

### 5. Drive touch and keys

Froyo's `input` command does not support tap or swipe. Use the local `sendevent` helpers.

- Touch range is X 0-1023 and Y 0-915 for the 240x320 panel. Convert screenshot coordinates with `rawX = x * 1023 / 240` and `rawY = y * 915 / 320`.
- For a landscape app, map the logical 320x240 point back to the framebuffer first. For example, Robo Defense's logical Start Game at (240,215) maps to framebuffer (25,240).
- Use `adb shell input keyevent 4` for Back, `82` for Menu, and `19`/`20`/`23` for DPAD up/down/center.
- Take a screenshot after each action and record the resulting activity or visible change.

### 6. Collect evidence

```text
adb logcat -d -v brief | grep -Ei '<package>|FATAL|ANR|SIGSEGV|SIGILL|EGL|GLES|unimplemented|NoSuchMethodError'
adb shell ls -l /data/tombstones
```

- For a native crash, record the signal, fault address, library and `I/DEBUG` stack.
- For an EGL failure, record whether the app loaded `libGLES_android.so`, logged `called unimplemented OpenGL ES API` or `call to OpenGL ES API with no current context`, or threw an EGL config exception.
- For performance, use the game's own counter or repeated frame-time logs. Do not estimate FPS from one screenshot.
- A black screen with a live process is not a pass. Look for a missing GL context or a surface that never received a frame.

### 7. Classify and clean up

- Classify as Works, Playable but marginal, Works but slow, Not playable, or Not tested.
- Uninstall failed or rejected packages after recording the result. Keep verified builds on SD unless they are being compared.
- Recheck `df /data` and the low-storage notification. Clear only the failed package and its cache.
- Put the APK hash and the tested build in [GAMES.md](GAMES.md); keep the APK, save backup and helper scripts outside Git.

## Per-game procedures

### Doodle Jump

- Install with `adb install -r`; the replace install preserved the existing save.
- Launch, dismiss the sound prompt, open the main menu, high-score screen and help overlay, then start a run.
- Observed: full 240x320 rendering, DPAD/optical-trackpad navigation and offline play. The game is self-contained and has no network requirement.

### Skater Boy

- Install the original 1.6 build first. Later builds were tested with a clean uninstall/install because an in-place reinstall returned `INSTALL_FAILED_INSUFFICIENT_STORAGE`.
- Launch, load the restored save, start a run and read the diagnostic build's own `Current Fps` counter after loading.
- Observed: about 18-19 FPS. The stock update clamp runs at roughly 0.5x game speed; the 0.75x timing-cap build is closer to the intended speed but visibly choppy. The recommended build is re-signed, so back up `/data/data/com.game.SkaterBoy` before replacing it.

### Fruit Ninja

- Install stock 1.3, then the later 1.5.2 build for comparison. Test the 160x120 half-res patch as a separate build.
- Launch, measure menu frame time, start a game, slice fruit, and verify that the halved touch coordinates still line up with the visible fruit.
- Observed: stock 1.3 about 8 FPS; 1.5.2 about 4.6 FPS; the half-res patch about 21-23 FPS on the menu and 25-50 FPS in gameplay, with a softer image. The owner confirmed the patch is playable. OpenFeint and ad calls fail offline without blocking play. The patched build is re-signed; back up `/data/data/com.halfbrick.fruitninja` before replacing it.

### Cut the Rope

- Install the free 1.4.1 build, launch and wait through the splash.
- Follow the tutorial, then play two levels through the normal touch controls.
- Observed: landscape 320x240 rendering, somewhat slow but playable. Flurry requests fail offline and do not block the game.

### Logo Quiz Ultimate

- Install 2.2, launch and wait for the first-run database update dialog.
- Open Play, enter Level 1, tap the Apple logo, type `apple` in the answer screen and press Enter.
- Observed: the logo gets a green check. Ad/network noise and `IllegalStateException` messages from the level loader do not block the offline quiz flow.

### Pou

- Install 1.0.31 directly from `/sdcard` with `pm install`. The newer 1.4.70 build was also attempted.
- Launch, use the kitchen, switch the food carousel between Fries and Cherries, and open the Fridge.
- Observed: the 240x320 kitchen, food carousel and Fridge work with touch. The feeding drag was not completed remotely because HTC Stocks repeatedly stole focus. The 1.4.70 install failed with `INSTALL_FAILED_INSUFFICIENT_STORAGE` when `/data` had about 25 MB free.

### Talking Tom Cat

- Install 1.0, launch, tap Tom's head, then tap the milk carton.
- Observed: the full cat scene renders, the head changes expression and the milk interaction works. AdMob requests fail offline without blocking the app. The voice-repeat feature was not exercised because the test was remote and no audio was spoken into the microphone.

### Jetpack Joyride

- The original APK failed `pm install -s` with `INSTALL_FAILED_INVALID_INSTALL_LOCATION`; a normal install then failed with `INSTALL_FAILED_INSUFFICIENT_STORAGE`.
- Patch only the manifest root from `installLocation=0` to `installLocation=2`, re-sign locally, then install with `pm install -s`.
- Launch, pass the Halfbrick splash and title screen, tap to start, run until the HUD passes 23 m, record the best distance and sector, and open the pause/missions screen.
- Observed: the title, HUD and pause screens work, but gameplay is about 5 FPS and decorative only. The 160x120 half-res experiment rendered in a small centered window and did not reduce the texture cache, so it was rejected and the full-res build restored. Clear `cache/cache13050` after a first run because the texture cache can fill `/data`. The re-signed build cannot update over the official Halfbrick build.
- Historical note: the 1.5 build crashed with `SIGILL` in `libmortargame.so` and was not retested in this pass.

### Bonsai Blast

- Install 1.8 with `pm install -s`, launch and open Adventure mode.
- Wait for the marble path, score, timer and shooter to render, then tap to fire a marble.
- Observed: the shot registers and the score advances from 100 to 425. The offline Google ad request fails without blocking play.

### Paper Toss

- Install 1.2.3 with `pm install -s`, open the office menu and choose Easy.
- Perform a swipe toss with the touch helper and check the scoreboard.
- Observed: the office menu, Easy office and swipe toss work; the scoreboard showed Best 2. MoPub/Flurry requests fail offline without blocking play.

### Bubble Blast 2

- Install 1.0.45 with `pm install -s`, tap Play, choose Puzzle and open Level Pack 1.
- Start level 1, tap the central bubble and watch the chain reaction, score, level and combo counters.
- Observed: the tap scores 20 points, advances to level 2 and records combo 1. Offline ad requests fail without blocking play.

### Abduction! World Attack

- Install 1.2.6 with `pm install -s`, open Quick Game and choose Easy.
- Wait for the game scene, let the score advance, then tap to pause and tap again to resume.
- Observed: the landscape menu, cow, platforms and Stonehenge background render; the score advanced from 2686 to 4522 and the pause/resume overlay worked. Accelerometer steering was not exercised because the test was remote.

### Robo Defense FREE

- Install 2.0.0 with `pm install -s`, dismiss the beta-expired welcome dialog and open New Game.
- Leave difficulty at 0 and the map at Basic Level, then tap Start Game.
- Because the game is landscape, map the logical Start Game point (240,215) to framebuffer (25,240) before sending touch.
- Observed: GameActivity starts at 320x240, the grass map, enemies and HUD render, and the pause menu opens. The beta dialog warns that the beta period is over but the game still runs.

### Glow Hockey

- Install 1.2.15 with `pm install -s`, launch and watch logcat.
- Observed for 1.2.15: the process loads `libnategame.so`, then dies with `FATAL EXCEPTION: AdWorker #1` and `java.lang.NoSuchMethodError: java.io.IOException.<init>`. It is not usable on Froyo; uninstall it.
- Install the older 1.2.12 with `pm install -s`, launch, tap through the "Glow Hockey FREE" splash and Tap to Continue, pass the Glow Hockey 2 cross-promo with Continue Free Version, then start a match.
- Observed for 1.2.12: the original neon table, paddles, pucks and score render. This is the original game. The 1.2.16 build remains minSdk 9 and is rejected with `INSTALL_FAILED_OLDER_SDK`.

### Glow Hockey 2

- Install 1.0.4 with `pm install -s`, pass the full-version upsell with Continue Free Version, open 1 Player and start a match.
- Observed: the free-version menu and a match render. The hands-on comparison found it worse and slower than the original 1.2.12, but it is kept for fun.

### Angry Birds 3.1.0

- Install and launch the official 3.1.0 build, then read the EGL logs.
- Observed: the activity starts, but EGL config selection fails with `java.lang.IllegalArgumentException: No configs match configSpec`. No menu or gameplay is reached; the app requires ES 2.0.

### Angry Birds 1.0.0 KA3D port

- Install the debug-signed KA3D port and launch it.
- Observed: `FATAL EXCEPTION: GLThread 7`, with `java.lang.IllegalArgumentException` at `EGLImpl.eglGetConfigAttrib` from `MySurfaceView$ConfigChooser.findConfigAttrib`. No gameplay. This is an untrusted repack and is not recommended.

### Angry Birds Seasons 1.1.1

- Install the ARMv6/ES 1.1 build and launch it.
- Observed: the activity reaches the foreground and loads the software GL driver, but the screen stays a solid blue frame for more than a minute with no menu or gameplay. Uninstalled after testing.

### Temple Run

- Attempt to install the official 1.0.0 build.
- Observed: `INSTALL_FAILED_INVALID_APK`; logcat reports `Native ABI mismatch from package file` because the native libraries are `armeabi-v7a` only. No package was installed; the empty data directory was removed.

### Subway Surfers

- Attempt to install the official 1.0 build.
- Observed: the same `INSTALL_FAILED_INVALID_APK` / `Native ABI mismatch` result. The build is ARMv7-only and has no ARMv6 fallback. No package was installed.

### Plants vs. Zombies

- Attempt to install the official 1.1.44 free build.
- Observed: `INSTALL_FAILED_OLDER_SDK` because `minSdkVersion` is 9. Static inspection also shows `libpvz.so` links `libGLESv2.so` and `libOpenSLES.so`, so bypassing the manifest check would not make it playable on this ES 1.1 device.

### Hill Climb Racing

- Install and launch 1.0.0, then read the renderer logs.
- Observed: the process loads `libgame.so` and logs `Your device doesn't support OpenGLES 2.0`, then aborts with a `NullPointerException` in `AdManager.getPrefValueString`. No gameplay; uninstalled.

### Where's My Water?

- Install both official builds separately: `com.disney.WMW` 1.2.0 and the HTC-specific `com.disney.WMW_BN` 1.5.1.
- Launch each, wait for the splash/menu, and tap Play to load gameplay.
- Observed: 1.2.0 crashes during startup/splash. 1.5.1-bn reaches the main menu at 240x320, but both processes die with `SIGSEGV` at fault address `0000000c` in `libwmw.so` when gameplay loads, after repeated `called unimplemented OpenGL ES API` lines. Tombstones confirm the native crashes. Both packages were uninstalled.

### Peggle

- The only located APK was debug-signed, not PopCap-signed. It was tested only after patching `installLocation` to `preferExternal` and re-signing locally.
- Install with `pm install -s`, launch and wait for a frame.
- Observed: the process stays alive but renders a black screen; logcat repeats `called unimplemented OpenGL ES API` and `call to OpenGL ES API with no current context`. No menu or frame is reached. Uninstalled; the result is provisional because no official-signed APK was available.

### Zuma

- Do not install. Inspect each candidate archive first.
- Rejected candidates: the Chinese build is a Transmension QCast cloud-streaming client (`com.trans.zuma_qcast`, minSdk 13); the 63 MB "Extended" file and the "Zuma Deluxe" file are PC game zips renamed to `.apk`; the remaining archive is a debug-signed minSdk 21 SDL2 fan port with a spoofed package name.
- Observed: no trustworthy Froyo-compatible classic Zuma APK exists in the sources checked. Nothing was installed or run.

## Limits of this test pass

- The phone was driven remotely over ADB. Accelerometer, microphone and multi-touch gestures were not exercised unless a game's own controls allowed it.
- HTC Stocks can auto-open and steal focus. It was not disabled; affected tests were paused or repeated.
- The screen can time out and show `Keyguard`; wake/unlock before concluding that a game has stopped drawing.
- Frame-rate figures come from the game's own counters or repeated frame-time logs. A single screenshot cannot establish performance.
- Results apply to this exact device and stock Froyo build. A different GL driver, kernel GPU device or Android version would change the compatibility picture.
