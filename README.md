# 🏃‍♂️ MyActivityMonitor

**MyActivityMonitor** is a minimal React Native demo app that integrates with **Google Health Connect** (and Apple Health) to display your **daily steps** and **active minutes**.  
Its purpose is to validate the Health Connect permission flow, privacy-safe data handling, and Google Play review process.

---

## ✨ Features

- Reads and displays **Steps (StepsRecord)** and **Exercise sessions (ExerciseSessionRecord)** from Health Connect  
- **Auto-refreshes every 5 seconds** while app is active  
- Animated progress values and background color based on goal completion  
- Simple goal setting via modal dialog with persistence on device  
- Privacy-compliant: no data leaves the device  
- Matching **app icon** and **splash screen** built around a “walk + target” concept  

---

## 🧱 Tech stack

| Platform | Library / Framework |
|-----------|--------------------|
| **React Native 0.7x** | base framework |
| **TypeScript** | app logic |
| **react-native-health-connect** | Android Health Connect bridge |
| **react-native-health** | iOS Health Kit bridge (future) |
| **rxjs** | reactive wrappers for native services |
| **react-native-safe-area-context** | layout safety |
| **Animated API** | smooth value transitions |
| **AsyncStorage** | local goal persistence |

---

## ⚙️ Setup & build

### Install dependencies

   ```bash
   npm install
   ```

### Link native modules

```bash
npx pod-install
```

### Android SDK setup

- minSdkVersion = 26
- compileSdkVersion = 36
- Kotlin 2.1.x
- Java 17+

### Run

```bash
npm run android # android
npm run ios # ios
```

## Permissions

The app requests read-only access to:


| Health Connect record type | Purpose | Access |
|----------------------------|---------|---------|
| StepsRecord | Count daily steps | read |
| StepsRecord | Total active minutes | read |

---
