# Casual sensor apps

Tested on the rooted HTC Wildfire A3333 running WWE Froyo `2.22.405.1`: Android 2.2.1 (API 8), 528 MHz ARM11, 240x320, 384 MB RAM. These are the classic accelerometer/microphone novelty apps, not games. The tested APKs are the older Uptodown builds; their exact sizes and hashes are below. The APKs stay outside Git.

The Wildfire does not expose a gyroscope. These apps use the BMA150 accelerometer (`/dev/bma150`, `sensors.buzz.so`) and the microphone, which is enough for their tilt, flick and blow interactions.

## Summary

| App | Package / build | Result | Notes |
| --- | --- | --- | --- |
| iBeer FREE | `com.hottrix.ibeerfree` 1.28 | Works | Tilt to drink; shake for foam; top-down glass view |
| Lighter | `com.progimax.lighter.free` 8.0 | Works | Tap the flint wheel to open and light; blow to extinguish |
| Candle | `com.progimax.candle.free` 6.2 (versionCode 19) | Works | Tap the wick to toggle the flame; blow to extinguish |

All three were installed with `adb install` and verified on the phone by the owner, including the physical tilt and blow interactions. No `/system`, firmware, or GPU changes were made.

## iBeer FREE

- Package `com.hottrix.ibeerfree`; versionName `1.28`; versionCode `18`; `minSdkVersion 7`.
- APK: 8,974,958 bytes; SHA-256 `37e4d6e5920195cf99c6c6a3c010bffb984813754d79a6d5d23028b02fc2b2e1`.
- The app opens to a top-down view of the glass when the phone is flat. Tilting the phone pours/drinks the beer; shaking it creates foam. The owner confirmed the full interaction.
- This is the older Froyo-compatible free build. The later iBeer FREE 1.35 build declares `minSdkVersion 9` and will not install on API 8. The app contains Hottrix ads and an in-app purchase link; its network permissions are for those services.

## Lighter

- Package `com.progimax.lighter.free`; versionName `8.0`; versionCode `21`; `minSdkVersion 3`.
- APK: 1,706,814 bytes; SHA-256 `3f56eb79e4f6c45ecbc1fc0f712ed02f7a3a8e23bbf8d3cb4f15e3828dcdf36f`.
- The menu opens the flame view. Tapping the flint wheel opens the lid and lights the flame; blowing into the bottom microphone extinguishes it. The owner confirmed both interactions.
- The APK contains both `armeabi` and `armeabi-v7a` builds of `libprogimax-android-util-opengl.so`, so it runs on the Wildfire's ARMv6 CPU. The app is ad-supported and requests microphone access. Later Lighter builds on Uptodown require API 9 or newer and are not Froyo-compatible.

## Candle

- Package `com.progimax.candle.free`; versionName `6.2`; versionCode `19`; `minSdkVersion 3`.
- APK: 866,203 bytes; SHA-256 `45c0678f0466a6f8284c4b565c3898dda7685577e9994d031cc0fedc83ee080f`.
- It launches directly to a lit candle. Tapping the wick toggles the flame on and off; blowing into the microphone extinguishes it. The owner confirmed both interactions.
- This is the **versionCode 19** build. A newer 6.2 build with versionCode 20 declares `minSdkVersion 9`, so use versionCode 19 on Froyo. It contains the same `armeabi`/`armeabi-v7a` OpenGL utility library as Lighter and is ad-supported.

## Testing notes

- The Wildfire's accelerometer is exposed as `/dev/bma150` and through `sensors.buzz.so`; the apps do not need a gyroscope.
- Lighter and Candle were observed holding an active `AudioRecord` stream (`/dev/msm_pcm_in`), and the owner verified that blowing into the microphone extinguishes the flame.
- Froyo's `input` command cannot tap. Raw Atmel touchscreen taps work with a type-A sequence using `ABS_MT_TOUCH_MAJOR` (48), `ABS_MT_POSITION_X` (53), `ABS_MT_POSITION_Y` (54), `SYN_MT_REPORT` (2), and `SYN_REPORT` (0), then releasing with `ABS_MT_TOUCH_MAJOR=0`. The test scripts stay outside Git.
- All three apps are ad-supported. Their core functions do not require an account; network access is used by the ad SDKs.
