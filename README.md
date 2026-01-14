# أذكار – أقوال وأدعية يومية

A beautiful Arabic iOS app for daily Islamic quotes (أذكار) and supplications (أدعية) with an Instagram-style swipeable card interface.

## Features

- 🕯️ **Beautiful UI** - Clean, modern design with purple theme matching the app logo
- 📱 **Swipeable Cards** - Instagram-style card swiping to browse through daily quotes
- ❤️ **Like & Share** - Like your favorite quotes and share them with others
- 🔔 **Notifications** - Daily reminders for morning and evening supplications
- 📋 **Categories** - Organize quotes by categories (Growth, Peace, Anxiety, Stress Relief, etc.)
- 🎯 **Onboarding** - Personalized onboarding flow to customize your experience
- 🌐 **RTL Support** - Full right-to-left layout support for Arabic language
- 📊 **Widget Support** - Widget configuration for home screen (setup required)

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Reanimated** for smooth animations
- **Gesture Handler** for swipe gestures
- **AsyncStorage** for local data persistence
- **Expo Notifications** for push notifications

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Run on iOS:
```bash
npx expo start --ios
```

4. Run on Android:
```bash
npx expo start --android
```

## App Structure

```
app/
├── (tabs)/           # Main app tabs
│   ├── index.tsx     # Home screen with swipeable cards
│   └── explore.tsx   # Categories explore screen
├── onboarding/       # Onboarding flow
│   ├── welcome.tsx
│   ├── name.tsx
│   ├── age.tsx
│   ├── gender.tsx
│   ├── relationship.tsx
│   ├── familiarity.tsx
│   ├── categories.tsx
│   ├── widgets.tsx
│   └── complete.tsx
└── _layout.tsx       # Root layout with navigation

components/
├── CandleIcon.tsx    # Candle mascot icon component
└── SwipeableCard.tsx # Swipeable card component for quotes

context/
└── UserContext.tsx   # User state management

data/
├── categories.ts      # Category definitions
└── quotes.ts         # Sample quotes/do3aa

services/
├── notifications.ts  # Notification setup and scheduling
└── widgets.ts        # Widget configuration

types/
└── index.ts          # TypeScript type definitions
```

## Features in Detail

### Onboarding Flow
1. **Welcome** - Introduction to the app
2. **Name** - User name input
3. **Age** - Age range selection
4. **Gender** - Gender identification
5. **Relationship** - Relationship status
6. **Familiarity** - Experience with affirmations/do3aa
7. **Categories** - Select preferred categories
8. **Widgets** - Widget setup information
9. **Complete** - Onboarding completion

### Main Features
- **Swipeable Cards**: Swipe left/right to navigate through quotes
- **Like System**: Tap heart icon to like quotes (saved locally)
- **Share**: Share quotes via native share sheet
- **Categories**: Browse and filter quotes by category
- **Notifications**: Daily reminders at 8 AM and 8 PM

## Configuration

### Notifications
Notifications are automatically set up during onboarding. To customize:
- Edit `services/notifications.ts`
- Modify `scheduleDailyNotification()` function

### Widgets
Widget setup requires native code:
- iOS: Create Widget Extension in Xcode
- Android: Implement App Widget using Android Widget API
- See `services/widgets.ts` for configuration structure

### Colors
Theme colors are defined in `constants/theme.ts`:
- Primary Purple: `#8B5CF6`
- Dark Purple: `#6D28D9`
- Light Purple: `#A78BFA`
- Cream Background: `#FEF3E2`
- Dark Blue: `#1E3A8A`

## Adding More Quotes

Edit `data/quotes.ts` to add more quotes/do3aa:

```typescript
{
  id: 'unique-id',
  text: 'Arabic text here',
  translation: 'English translation',
  category: 'category-id',
  isLiked: false,
  date: new Date().toISOString(),
}
```

## Future Enhancements

- [ ] Backend integration for quotes
- [ ] User accounts and sync
- [ ] More categories and quotes
- [ ] Widget implementation (native code required)
- [ ] Dark mode support
- [ ] Font customization
- [ ] Favorite quotes collection
- [ ] Search functionality

## License

Private project

## Support

For issues or questions, please contact the development team.
