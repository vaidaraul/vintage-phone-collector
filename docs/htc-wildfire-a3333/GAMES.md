# Game compatibility

Tested on the rooted HTC Wildfire A3333 running the WWE Froyo `2.22.405.1` build: Android 2.2.1 (API 8), 528 MHz ARM11, Adreno 200, 240x320, 384 MB RAM. Test APKs are kept outside Git.

## Summary

| Game | Package / build | Result | Notes |
| --- | --- | --- | --- |
| Doodle Jump | `com.realarcade.DOJ` 1.3.0 | Works | RealArcade/RealNetworks 2009 signature; offline Java/MIDlet port |
| Skater Boy | `com.game.SkaterBoy` 1.6 (versionCode 10) | Playable, marginal | Re-signed 0.75x timing-cap build; ~19 FPS, visibly choppy |
| Angry Birds | `com.rovio.angrybirds` 3.1.0 | Not playable | Requires OpenGL ES 2.0; stock kernel has no GPU device |
| Angry Birds | `com.rovio.angrybirds` 1.0.0 KA3D port | Not playable | ES 1.x, but its EGL config chooser throws |
| Fruit Ninja | `com.halfbrick.fruitninja` 1.7.5 | Launches, stutters | Historical observation; not re-measured |
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

## Angry Birds

Two builds were tested. Both install, but neither reaches gameplay.

### Official 3.1.0

- Package `com.rovio.angrybirds`; `minSdkVersion 8`; `targetSdkVersion 13`; native `armeabi` library; requires OpenGL ES 2.0 (`uses-feature glEsVersion=0x00020000`).
- SHA-256: `a21719a7b2fb6546b79ef4e15bfb38cf8154b2edf2f3bbb7641dbca7ddd5b1e0`.
- Launch result: the process and activity start, then EGL config selection fails with `java.lang.IllegalArgumentException: No configs match configSpec`. Logcat shows only `loaded /system/lib/egl/libGLES_android.so`.

### 1.0.0 KA3D port

- Package `com.rovio.angrybirds`; activity `com.rovio.ka3d.App`; ARMv5TE `libangrybirds.so`; uses `GL10` (ES 1.x); the manifest marks ES 2.0 as optional. It is signed with a debug key, so treat it as an untrusted repack, not an official Rovio build.
- SHA-256: `c80ed55b5a7e594653402217b61569049300358d2c2f6c4515c867608104c477`.
- Launch result: the process and activity start, then `FATAL EXCEPTION: GLThread 7`: `java.lang.IllegalArgumentException` at `com.google.android.gles_jni.EGLImpl.eglGetConfigAttrib`, called from `MySurfaceView$ConfigChooser.findConfigAttrib` (`App.java:245`).

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

## Testing notes

- Froyo has no `screencap`. To capture the screen, read `/dev/graphics/fb0` as root: 240x640 RGB565, two 240x320 buffers; split and convert to PNG. The capture script is kept outside Git with the test APKs.
- Use `adb shell input keyevent` for the optical trackpad (`19` up, `20` down, `23` center, `4` back). Froyo's `input` command does not support tap or swipe.
- Skater Boy's frame rate came from its engine's own `Current Fps` counter in a temporary diagnostic build; the production APK leaves debug logging disabled. It held around 18–19 FPS after loading.
- Check `adb shell dumpsys window` for focus and `adb logcat` for EGL/native errors.
