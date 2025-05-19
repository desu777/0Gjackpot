# Galileo Jackpot Frontend

Frontend application for the Galileo Jackpot lottery system.

## Project Structure

```
src/
├── components/
│   ├── jackpot/
│   │   ├── theme/
│   │   │   └── ThemeConfig.js
│   │   ├── layout/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   └── MainLayout.js
│   │   ├── views/
│   │   │   ├── LandingView.js
│   │   │   └── ConnectedView.js
│   │   ├── panels/
│   │   │   ├── InfoPanel.js
│   │   │   ├── WheelSection.js
│   │   │   ├── BuyPanel.js
│   │   │   └── HistoryPanel.js
│   │   └── animations/
│   │       └── GlobalStyles.js
├── pages/
│   └── JackpotPage.js
├── App.js
└── index.js
```

## Component Breakdown

### Theme
- **ThemeConfig.js** - Contains the UI theme configuration (colors, etc.)

### Layout Components
- **Header.js** - App header with logo and wallet connection
- **Footer.js** - App footer
- **MainLayout.js** - Main layout wrapper

### View Components
- **LandingView.js** - Landing page view when wallet is not connected
- **ConnectedView.js** - Main view when wallet is connected

### Panel Components
- **InfoPanel.js** - Displays round information and statistics
- **WheelSection.js** - Drawing wheel animation and timer
- **BuyPanel.js** - Panel for buying lottery tickets
- **HistoryPanel.js** - Displays round history

### Animation
- **GlobalStyles.js** - Global styles and animations

## Pages
- **JackpotPage.js** - Main page that holds the state and logic

## Setup and Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ``` 