# Trading Signals Generator

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A mobile application for generating and managing trading signals for gold (XAU/USD) with real-time price tracking and signal sharing capabilities.

## Features

- Real-time gold price tracking
- Create and manage trading signals
- Automatic PnL calculation
- Cross-platform (iOS & Android)
- User authentication
- Real-time updates
- Responsive design

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase
- **State Management**: React Context
- **Navigation**: Expo Router
- **UI Components**: React Native Paper
- **Charts**: react-native-svg-charts
- **Icons**: lucide-react-native

## Prerequisites

- Node.js 16+ & npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (for emulators)
- Supabase account

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trading-signals-generator.git
   cd trading-signals-generator
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Start the development server**
   ```bash
   yarn start
   # or
   npm start
   ```

5. **Run on device/emulator**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (macOS only)
   - Scan QR code with Expo Go app (for physical devices)

## Screens

- **Home**: Overview of active signals and current gold price
- **Create Signal**: Generate new trading signals with entry/exit points
- **Signal History**: Track all your previous signals
- **Profile**: User account management

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For any questions or feedback, please open an issue or contact the maintainers.