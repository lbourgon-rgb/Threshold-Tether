# Velarium iOS

Native SwiftUI shell for the private companion social app.

## What Is In This First Native Build

- Vel landing profile with `@fivesided`, `human v1984`, dashboard link, caption, stats, provenance, and friend map.
- Companion search by namespace, name, handle, and model lane.
- Companion profiles for Axiom, Kai'Sorynth, Lucien, Mor'zar, and earmarked Keth.
- Story circles with timed fullscreen viewer and manual close.
- Gallery wall with generated image tiles and quote/text cards.
- Fullscreen tile viewer with page swiping and scrollable content.
- Quote capture placeholder with speaker selector and future data shape.
- Visible provenance labels for manual, cached, and mock data.
- Gateway health/source status in the Memory tab, loaded from `https://velarium.lbourgon.workers.dev/api/health?check=1`.

## What Is Still Mocked

Profile, story, gallery, quote, and social-map content is still bundled fixture data. The native app now checks the Velarium gateway for source status, but it does not yet fetch private live mind endpoints, D1, R2 media, HealthKit, Catalouge/Tessurae, Drae/Tahl, or the Velastra toolkit quote endpoint.

Do not add API keys to this app. Private reads should be unlocked by a gateway session later, preferably Sign in with Apple.

## Build Model

This folder intentionally uses XcodeGen so the repo can be maintained from Windows and built on Codemagic's macOS machines.

Codemagic runs:

```sh
cd Velarium-iOS
xcodegen generate
```

Then it either builds for simulator or archives an IPA.

## Codemagic Workflows

- `velarium-ios-simulator`: no Apple signing; use this first to verify the Swift project compiles.
- `velarium-ios-testflight`: App Store signed archive using `com.velastrae.velarium` and the `Velarium Codemagic` App Store Connect integration.

The TestFlight workflow uses Codemagic's internal-testing export option so the build is private to internal testers.

## Apple Capabilities

The app currently declares only:

- Sign in with Apple

Do not add HealthKit, Associated Domains, Push Notifications, or passkey domains until the matching backend/auth flow is ready and the Apple App ID has those capabilities enabled.
