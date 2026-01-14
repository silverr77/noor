# Quick Start Guide

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npx expo start
   ```

3. **Run on your device:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

## First Run

When you first launch the app, you'll go through the onboarding flow:

1. **Welcome Screen** - Introduction to the app
2. **Enter Your Name** - Personalize your experience
3. **Select Age Range** - Choose your age group
4. **Select Gender** - How you identify
5. **Relationship Status** - Current relationship status
6. **Familiarity** - Your experience with do3aa/affirmations
7. **Categories** - Choose your preferred categories
8. **Widgets** - Information about widgets
9. **Complete** - Finish onboarding

After onboarding, you'll see the main screen with swipeable cards.

## Using the App

### Swipeable Cards
- **Swipe left or right** to navigate through quotes
- **Tap the heart icon** to like a quote
- **Tap the share icon** to share a quote
- Cards stack on top of each other for smooth navigation

### Categories
- Navigate to the "استكشف" (Explore) tab to see all categories
- Categories are personalized based on your onboarding preferences

### Notifications
- Notifications are automatically set up during onboarding
- You'll receive reminders at 8 AM and 8 PM daily
- You can modify notification times in `services/notifications.ts`

## Customization

### Adding More Quotes
Edit `data/quotes.ts` and add new quote objects:

```typescript
{
  id: 'unique-id',
  text: 'Arabic text here',
  translation: 'English translation',
  category: 'category-id', // Use IDs from categories.ts
  isLiked: false,
  date: new Date().toISOString(),
}
```

### Changing Colors
Edit `constants/theme.ts` to customize the color scheme.

### Modifying Categories
Edit `data/categories.ts` to add or modify categories.

## Troubleshooting

### RTL Layout Issues
The app uses `I18nManager.forceRTL(true)` for Arabic support. If you see layout issues:
- Check that text alignment is set to 'right'
- Verify flexDirection is correct for RTL

### Gesture Issues
If swipe gestures don't work:
- Ensure `react-native-gesture-handler` is properly installed
- Check that `react-native-reanimated` is configured correctly

### Notification Issues
If notifications don't work:
- Check device permissions
- Verify `expo-notifications` is properly configured
- On iOS, ensure notifications are enabled in device settings

## Next Steps

- [ ] Add more quotes/do3aa to `data/quotes.ts`
- [ ] Customize categories in `data/categories.ts`
- [ ] Implement widget support (requires native code)
- [ ] Add backend integration for quotes
- [ ] Implement user accounts and sync

