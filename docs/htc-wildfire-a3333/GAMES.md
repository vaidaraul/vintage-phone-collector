# Game compatibility

Tested on the rooted HTC Wildfire A3333 running the WWE Froyo `2.22.405.1` build: Android 2.2.1 (API 8), 528 MHz ARM11, Adreno 200, 240x320, 384 MB RAM. Test APKs are kept outside Git.

## Summary

| Game | Package / build | Result | Notes |
| --- | --- | --- | --- |
| Doodle Jump | `com.realarcade.DOJ` 1.3.0 | Works | RealArcade/RealNetworks 2009 signature; offline Java/MIDlet port |
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
- Doodle Jump remains installed and verified.

## Testing notes

- Froyo has no `screencap`. To capture the screen, read `/dev/graphics/fb0` as root: 240x640 RGB565, two 240x320 buffers; split and convert to PNG. The capture script is kept outside Git with the test APKs.
- Use `adb shell input keyevent` for the optical trackpad (`19` up, `20` down, `23` center, `4` back). Froyo's `input` command does not support tap or swipe.
- Check `adb shell dumpsys window` for focus and `adb logcat` for EGL/native errors.
