# Ticket Scanner Admin App

A React Native Expo application designed for administering ticket scanning operations. This admin app provides a user-friendly interface for managing tickets, approving entries, and monitoring dashboard metrics.

## Features

- **Dashboard**: Overview of key metrics and statistics for ticket operations.
- **All Tickets**: View and manage all scanned tickets in a comprehensive list.
- **Approve Tickets**: Review and approve pending ticket entries.
- **Camera Integration**: Utilize device camera for scanning tickets (via expo-camera).
- **Responsive Design**: Built with Expo Router for file-based routing and responsive UI components.

## Technologies Used

- **React Native**: Framework for building native apps using React.
- **Expo**: Platform for universal React applications.
- **Expo Router**: File-based routing for navigation.
- **TypeScript**: Typed JavaScript for better development experience.
- **Expo Camera**: For camera functionality in ticket scanning.

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd admin-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env` and configure your API endpoints and other settings.

## Usage

1. **Start the development server**:

   ```bash
   npx expo start
   ```

2. **Run on specific platforms**:
   - **Android**: `npm run android`
   - **iOS**: `npm run ios`
   - **Web**: `npm run web`

3. **Build for production**:
   - Use Expo Application Services (EAS) for building:
     ```bash
     npx eas build --platform android
     npx eas build --platform ios
     ```

## Project Structure

```
admin-app/
├── app/                    # Main application screens
│   ├── _layout.tsx        # Root layout
│   ├── modal.tsx          # Modal component
│   └── (tabs)/            # Tab-based navigation
│       ├── _layout.tsx
│       ├── index.tsx      # Home/Dashboard
│       ├── dashboard.tsx  # Dashboard screen
│       ├── all_tickets.tsx # All tickets view
│       └── approve.tsx    # Approve tickets screen
├── assets/                # Static assets (images, icons)
├── components/            # Reusable UI components
├── constants/             # App constants and themes
├── hooks/                 # Custom React hooks
├── services/              # API services
│   └── api.ts             # API configuration
├── scripts/               # Utility scripts
└── package.json           # Dependencies and scripts
```

## API Integration

The app integrates with backend services via the `services/api.ts` file. Ensure your API endpoints are configured in the environment variables.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or open an issue in the repository.

---

Built with ❤️ using [Expo](https://expo.dev) and [React Native](https://reactnative.dev).
