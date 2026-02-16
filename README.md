# Emperor Shots - Mobile Trading App

This is a mobile trading application built with **Ionic Framework** and **React**.

## Tech Stack
- **Ionic Framework** (Components & Routing)
- **React** (UI Library)
- **TypeScript** (Language)
- **CSS Variables** (Theming)

## Features
- **Login Screen**: Custom UI with server selection and secure login input. 
  - Mock Credentials: `admin` / `admin`
- **Marketwatch**: Live listing of quotes with search functionality.
  - Green/Red indicators for positive/negative change.
- **Tabs Navigation**: Access to Quotes, Trade, Position, and Profile.
- **Profile**: Simple profile management with logout.

## Project Structure
- `src/theme/variables.css`: Contains the Deep Royal Green & Gold theme.
- `src/pages/Login.tsx`: The initial login screen.
- `src/pages/Tabs.tsx`: Main app layout after login.
- `src/pages/Marketwatch.tsx`: The Quotes tab.
- `src/pages/Trade.tsx`: Placeholder for trading screen.
- `src/pages/Position.tsx`: Placeholder for positions screen.
- `src/pages/Profile.tsx`: User profile and settings.

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   or
   ```bash
   ionic serve
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Theme Customization
Edit `src/theme/variables.css` to modify the primary color palette.
