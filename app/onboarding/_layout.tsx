import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="name" />
      <Stack.Screen name="age" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="relationship" />
      <Stack.Screen name="familiarity" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="widgets" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}

