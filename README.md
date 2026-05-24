# react-native-pill-tabs

An animated pill-shaped tab bar for React Native with switchable tab groups. Features smooth spring animations, badge support, and full customization.

![React Native](https://img.shields.io/badge/React%20Native-0.72%2B-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-first-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- Two switchable tab groups with animated transitions
- Pill-shaped bar with a sliding circle toggle
- Spring-based animations via `react-native-reanimated`
- Badge support with automatic "99+" truncation
- Fully customizable theme, sizing, and icons
- Icon-library agnostic (Ionicons, MaterialIcons, SF Symbols, custom SVGs, etc.)
- TypeScript-first with full type exports
- Works with any navigation library (Expo Router, React Navigation, etc.)
- No Expo dependency required

## Peer Dependencies

This package does **not** bundle its own copy of React Native or Reanimated. Instead, it uses your project's installed versions as [peer dependencies](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies):

| Package | Version |
|---------|---------|
| `react` | >= 18.0.0 |
| `react-native` | >= 0.72.0 |
| `react-native-reanimated` | >= 3.0.0 |

If your project already uses React Native with Reanimated (most RN projects do), you're good to go — no extra installs needed.

If you don't have `react-native-reanimated` yet, install and configure it first: [Reanimated setup guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/).

## Installation

```bash
npm install react-native-pill-tabs
```

## Quick Start

```tsx
import { AnimatedTabBar } from 'react-native-pill-tabs';
import { Ionicons } from '@expo/vector-icons';

function MyTabBar() {
  const [activeGroup, setActiveGroup] = useState('home');
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <AnimatedTabBar
      groups={[
        {
          id: 'home',
          label: 'Home',
          icon: 'home',
          tabs: [
            { name: 'feed', label: 'Feed', icon: 'home-outline', activeIcon: 'home' },
            { name: 'search', label: 'Search', icon: 'search-outline', activeIcon: 'search' },
            { name: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
          ],
        },
        {
          id: 'store',
          label: 'Store',
          icon: 'grid-outline',
          tabs: [
            { name: 'products', label: 'Products', icon: 'grid-outline', activeIcon: 'grid' },
            { name: 'cart', label: 'Cart', icon: 'cart-outline', activeIcon: 'cart' },
            { name: 'orders', label: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt' },
          ],
        },
      ]}
      activeGroupId={activeGroup}
      activeTabName={activeTab}
      onGroupChange={setActiveGroup}
      onTabPress={setActiveTab}
      renderIcon={({ name, size, color }) => (
        <Ionicons name={name} size={size} color={color} />
      )}
    />
  );
}
```

## Usage with Expo Router

```tsx
import { View, StyleSheet } from 'react-native';
import { Stack, useSegments, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedTabBar, type TabGroup } from 'react-native-pill-tabs';

export default function AppLayout() {
  const segments = useSegments();
  const router = useRouter();

  // Single source of truth: tab data + routes together
  const tabGroups = [
    {
      id: 'main',
      label: 'Home',
      icon: 'home',
      tabs: [
        { name: 'index', label: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/(tabs)' },
        { name: 'notifications', label: 'Alerts', icon: 'notifications-outline', activeIcon: 'notifications', route: '/(tabs)/notifications' },
        { name: 'settings', label: 'Settings', icon: 'person-outline', activeIcon: 'person', route: '/(tabs)/settings' },
      ],
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: 'grid-outline',
      tabs: [
        { name: 'explore-home', label: 'Browse', icon: 'grid-outline', activeIcon: 'grid', route: '/(explore)' },
        { name: 'explore-search', label: 'Search', icon: 'search-outline', activeIcon: 'search', route: '/(explore)/search' },
        { name: 'explore-favorites', label: 'Favorites', icon: 'heart-outline', activeIcon: 'heart', route: '/(explore)/favorites' },
      ],
    },
  ] as const;

  // Derive groups (for the component) and routeMap (for navigation)
  const groups: [TabGroup, TabGroup] = tabGroups.map(({ id, label, icon, tabs }) => ({
    id,
    label,
    icon,
    tabs: tabs.map(({ route, ...tab }) => tab),
  })) as [TabGroup, TabGroup];

  const routeMap = Object.fromEntries(
    tabGroups.flatMap((g) => g.tabs.map((tab) => [tab.name, tab.route]))
  );

  const isInExplore = segments.includes('(explore)');

  const handleTabPress = (tabName: string) => {
    const route = routeMap[tabName];
    if (route) router.navigate(route as Href);
  };

  const handleGroupChange = (groupId: string) => {
    const group = tabGroups.find((g) => g.id === groupId);
    if (group) router.navigate(group.tabs[0].route as Href);
  };

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
      <AnimatedTabBar
        groups={groups}
        activeGroupId={isInExplore ? 'explore' : 'main'}
        // Resolve active tab name from segments — implement based on your route structure
        activeTabName={getActiveTab(segments)}
        onGroupChange={handleGroupChange}
        onTabPress={handleTabPress}
        renderIcon={({ name, size, color }) => (
          <Ionicons name={name} size={size} color={color} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

## Usage with React Navigation

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AnimatedTabBar } from 'react-native-pill-tabs';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => (
          <AnimatedTabBar
            groups={[
              {
                id: 'main',
                label: 'Main',
                icon: 'home',
                tabs: [
                  { name: 'Home', label: 'Home', icon: 'home', activeIcon: 'home' },
                  { name: 'Search', label: 'Search', icon: 'search', activeIcon: 'search' },
                ],
              },
              {
                id: 'account',
                label: 'Account',
                icon: 'account-circle',
                tabs: [
                  { name: 'Profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
                  { name: 'Settings', label: 'Settings', icon: 'settings', activeIcon: 'settings' },
                ],
              },
            ]}
            activeGroupId={getActiveGroup(props.state)}
            activeTabName={props.state.routes[props.state.index].name}
            onGroupChange={(id) => {/* navigate to first tab in group */}}
            onTabPress={(name) => props.navigation.navigate(name)}
            renderIcon={({ name, size, color }) => (
              <MaterialIcons name={name} size={size} color={color} />
            )}
          />
        )}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

## API Reference

### `AnimatedTabBar`

The main component. Renders an animated pill-shaped tab bar with two switchable groups.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `groups` | `[TabGroup, TabGroup]` | Yes | Exactly two tab groups |
| `activeGroupId` | `string` | Yes | ID of the currently active group |
| `activeTabName` | `string` | Yes | Name of the currently active tab |
| `onGroupChange` | `(groupId: string) => void` | Yes | Called when the user taps the circle to switch groups |
| `onTabPress` | `(tabName: string) => void` | Yes | Called when the user taps a tab |
| `renderIcon` | `(props: RenderIconProps) => ReactNode` | Yes | Render function for tab icons |
| `badge` | `Record<string, number>` | No | Badge counts keyed by tab name |
| `theme` | `Partial<PillTabsTheme>` | No | Theme colors (has sensible defaults) |
| `config` | `PillTabsConfig` | No | Size and animation config |
| `style` | `ViewStyle` | No | Override container style |

### `TabGroup`

```typescript
interface TabGroup {
  id: string;       // Unique group identifier
  label: string;    // Shown in the circle toggle button
  icon: string;     // Icon name shown in the circle toggle
  tabs: TabItem[];  // Tabs in this group
}
```

### `TabItem`

```typescript
interface TabItem {
  name: string;       // Unique tab identifier
  label: string;      // Text below the icon
  icon: string;       // Icon name (inactive state)
  activeIcon?: string; // Icon name (active state), falls back to `icon`
}
```

### `RenderIconProps`

Passed to your `renderIcon` function:

```typescript
interface RenderIconProps {
  name: string;    // The icon name from TabItem or TabGroup
  size: number;    // Icon size in pixels (default: 20)
  color: string;   // Resolved color based on active state and theme
  focused: boolean; // Whether this tab is currently active
}
```

### `PillTabsTheme`

All fields are optional — defaults are provided.

```typescript
interface PillTabsTheme {
  tint: string;             // Active tab color (default: '#1693e0')
  text: string;             // Inactive tab color (default: '#11181C')
  background: string;   // Pill and circle background (default: '#f5f5f5')
  border: string;           // Pill and circle border (default: '#e0e0e0')
  badgeBackground?: string; // Badge background (default: '#FF3B30')
  badgeText?: string;       // Badge text color (default: '#ffffff')
}
```

### `PillTabsConfig`

All fields are optional — defaults are provided.

```typescript
interface PillTabsConfig {
  circleSize?: number;      // Circle toggle diameter (default: 66)
  gap?: number;             // Gap between pill and circle (default: 8)
  horizontalMargin?: number; // Left/right margin (default: 16)
  bottomPadding?: number;   // Bottom padding (default: 16)
  tabLabelFontSize?: number; // Tab label font size (default: 11)
  iconSize?: number;        // Icon size (default: 20)
  springConfig?: {          // Animation spring config
    damping?: number;       // default: 22
    stiffness?: number;     // default: 170
    mass?: number;          // default: 1
  };
}
```

## Theming

### Dark Mode

Pass different theme colors based on your app's color scheme:

```tsx
import { useColorScheme } from 'react-native';

function MyTabBar() {
  const colorScheme = useColorScheme();

  const theme = colorScheme === 'dark'
    ? { tint: '#1693e0', text: '#ECEDEE', background: '#1f2022', border: '#333333' }
    : { tint: '#1693e0', text: '#11181C', background: '#f5f5f5', border: '#e0e0e0' };

  return (
    <AnimatedTabBar
      theme={theme}
      // ...other props
    />
  );
}
```

### Custom Colors

```tsx
<AnimatedTabBar
  theme={{
    tint: '#6C5CE7',
    text: '#2D3436',
    background: '#FFFFFF',
    border: '#DFE6E9',
    badgeBackground: '#E17055',
    badgeText: '#FFFFFF',
  }}
  // ...other props
/>
```

## Badges

Pass a `badge` object with tab names as keys and counts as values:

```tsx
<AnimatedTabBar
  badge={{
    notifications: 5,   // Shows "5" badge on the notifications tab
    messages: 142,       // Shows "99+" badge (auto-truncated)
  }}
  // ...other props
/>
```

Badges only appear when count > 0. Counts over 99 display as "99+".

## Custom Icon Libraries

The `renderIcon` prop accepts any icon library:

```tsx
// Ionicons (Expo)
renderIcon={({ name, size, color }) => (
  <Ionicons name={name} size={size} color={color} />
)}

// MaterialIcons (react-native-vector-icons)
renderIcon={({ name, size, color }) => (
  <MaterialIcons name={name} size={size} color={color} />
)}

// Custom SVG icons
renderIcon={({ name, size, color }) => (
  <MySvgIcon name={name} width={size} height={size} fill={color} />
)}

// Conditional by focused state
renderIcon={({ name, size, color, focused }) => (
  <MyIcon name={name} size={size} color={color} weight={focused ? 'bold' : 'regular'} />
)}
```

## Animation Config

Customize the spring animation:

```tsx
<AnimatedTabBar
  config={{
    springConfig: {
      damping: 15,    // Lower = more bouncy (default: 22)
      stiffness: 200, // Higher = faster (default: 170)
      mass: 0.8,      // Lower = lighter feel (default: 1)
    },
  }}
  // ...other props
/>
```

## How It Works

The tab bar consists of two animated elements:

1. **Pill** — a rounded rectangle containing the active group's tabs
2. **Circle** — a round toggle button showing the inactive group's icon

When the user taps the circle, the pill and circle swap positions with a spring animation. The pill slides in one direction while the circle slides the opposite way, with tab content crossfading between groups.

```
Active group: Home                    Active group: Store
┌─────────────────────────┐ ┌───┐    ┌───┐ ┌──────────────────────────┐
│ Feed | Search | Profile │ │ S │ -> │ H │ │ Products | Cart | Orders │
└─────────────────────────┘ └───┘    └───┘ └──────────────────────────┘
```

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Clone and install dependencies:
   ```bash
   cd animated-tab-bar
   npm install
   ```
3. Make your changes in `src/`
4. Build and verify:
   ```bash
   npm run build
   ```
5. To test locally in a React Native app, add it as a local dependency:
   ```json
   "react-native-pill-tabs": "file:../animated-tab-bar"
   ```
   And add the package path to `watchFolders` in your `metro.config.js` for hot reload.
6. Open a pull request

## License

MIT
