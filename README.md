# 📱 Ride-Sharing App — Frontend

Mobile frontend for a ride-sharing platform that lets users post rides, request to join others, and track their ride history in a categorized view. The goal of this project is to simplify shared travel and promote efficient, affordable, and eco-friendly commuting through an intuitive mobile experience.

Built using React Native, the app provides a clean and responsive UI, connects securely to a Spring Boot backend via JWT-authenticated API calls, and supports a wide range of features including ride creation, joining rides, request management, and ride tracking.

---

## 🔧 Tech Stack

- React Native CLI
- React Navigation
- Axios (HTTP requests)
- AsyncStorage (JWT & session management)
- Vector Icons (react-native-vector-icons)
- JavaScript (ES6+)

---

## 📱 Core Features

- User registration and login with JWT integration
- Post new rides with details like source, destination, date, and fare
- Request to join available rides
- View categorized ride history: upcoming, previous, and pending
- Accept, reject, or cancel ride requests
- Interactive UI with icons and responsive design
- Session handling and persistent login using AsyncStorage

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js (v14+)
- React Native CLI
- Android Studio / Xcode (for running emulator or device)
- Backend server (Spring Boot) running at a valid IP

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Girivenkat18/Ride-Sharing-Frontend.git
cd Ride-Sharing-Frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Backend API URL
Edit your services/api.js file:

```js
const BASE_URL = 'http://<your-local-ip>:8080/api';
```
Use your local IP address (e.g., 192.168.x.x) for mobile devices to connect to your local backend.

### Step 4: Run the App

For Android:
```bash
npx react-native run-android
```

For IOS:

```bash
npx react-native run-ios
```
