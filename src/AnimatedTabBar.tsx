import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Pressable, Text, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import type {
  AnimatedTabBarProps,
  PillTabsTheme,
  PillTabsConfig,
  TabGroup,
} from './types';

const DEFAULT_THEME: Required<PillTabsTheme> = {
  tint: '#1693e0',
  text: '#11181C',
  background: '#f5f5f5',
  border: '#e0e0e0',
  badgeBackground: '#FF3B30',
  badgeText: '#ffffff',
};

const DEFAULT_CONFIG: Required<PillTabsConfig> = {
  circleSize: 66,
  gap: 8,
  horizontalMargin: 16,
  bottomPadding: 16,
  tabLabelFontSize: 11,
  iconSize: 20,
  springConfig: { damping: 22, stiffness: 170, mass: 1 },
};

export function AnimatedTabBar({
  groups,
  activeGroupId,
  activeTabName,
  onGroupChange,
  onTabPress,
  badge,
  renderIcon,
  theme,
  config,
  style,
}: AnimatedTabBarProps) {
  const t = useMemo(() => ({ ...DEFAULT_THEME, ...theme }), [theme]);
  const c = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  const { width: screenWidth } = useWindowDimensions();
  const [firstGroup, secondGroup] = groups;

  // 0 = first group active (circle on right), 1 = second group active (circle on left)
  const progress = useSharedValue(firstGroup.id === activeGroupId ? 0 : 1);

  useEffect(() => {
    const target = firstGroup.id === activeGroupId ? 0 : 1;
    progress.value = withSpring(target, c.springConfig);
  }, [activeGroupId, firstGroup.id, progress, c.springConfig]);

  const barWidth = screenWidth - c.horizontalMargin * 2;
  const pillWidth = barWidth - c.circleSize - c.gap;

  const handleSwitch = () => {
    const newGroupId = activeGroupId === firstGroup.id ? secondGroup.id : firstGroup.id;
    onGroupChange(newGroupId);
  };

  // Circle slides from right to left
  const circleStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [pillWidth + c.gap, 0],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateX }] };
  });

  // Circle icon crossfade
  const firstCircleIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
  }));
  const secondCircleIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    position: 'absolute' as const,
  }));

  // Pill slides from left to right (opposite of circle)
  const pillStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [0, c.circleSize + c.gap],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateX }] };
  });

  // First group content: slides out to the left
  const firstContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [1, 0.3, 0], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, -pillWidth], Extrapolation.CLAMP) },
    ],
  }));

  // Second group content: slides in from the right
  const secondContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0.3, 1], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [pillWidth, 0], Extrapolation.CLAMP) },
    ],
  }));

  const renderTabs = (group: TabGroup) =>
    group.tabs.map((tab) => {
      const isActive = tab.name === activeTabName;
      const badgeCount = badge?.[tab.name] ?? 0;
      const iconName = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;

      return (
        <Pressable key={tab.name} onPress={() => onTabPress(tab.name)} style={styles.tabItem}>
          <View style={styles.iconWrapper}>
            {renderIcon({
              name: iconName,
              size: c.iconSize,
              color: isActive ? t.tint : t.text,
              focused: isActive,
            })}
            {badgeCount > 0 && (
              <View style={[styles.badge, { backgroundColor: t.badgeBackground }]}>
                <Text style={[styles.badgeText, { color: t.badgeText }]}>
                  {badgeCount > 99 ? '99+' : badgeCount}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.tabLabel, { color: isActive ? t.tint : t.text, fontSize: c.tabLabelFontSize }]}
            numberOfLines={1}
          >
            {tab.label}
          </Text>
        </Pressable>
      );
    });

  return (
    <View style={[styles.container, { paddingBottom: c.bottomPadding, left: c.horizontalMargin, right: c.horizontalMargin }, style]}>
      <View style={[styles.barRow, { width: barWidth, height: c.circleSize }]}>
        {/* Pill — slides left/right */}
        <Animated.View style={[styles.pill, { width: pillWidth, height: c.circleSize }, pillStyle]}>
          <View style={[styles.pillBlur, { backgroundColor: t.background, borderColor: t.border }]}>
            {/* First group content layer */}
            <Animated.View style={[styles.contentLayer, firstContentStyle]}>
              {renderTabs(firstGroup)}
            </Animated.View>

            {/* Second group content layer */}
            <Animated.View style={[styles.contentLayer, secondContentStyle]}>
              {renderTabs(secondGroup)}
            </Animated.View>
          </View>
        </Animated.View>

        {/* Circle — slides right/left (opposite of pill) */}
        <Animated.View style={[styles.circleWrapper, circleStyle]}>
          <Pressable onPress={handleSwitch} style={styles.circleButton}>
            <View
              style={[
                styles.circleBlur,
                {
                  width: c.circleSize,
                  height: c.circleSize,
                  borderRadius: c.circleSize / 2,
                  backgroundColor: t.background,
                  borderColor: t.border,
                },
              ]}
            >
              <Animated.View style={[styles.circleContent, firstCircleIconStyle]}>
                {renderIcon({ name: secondGroup.icon, size: c.iconSize, color: t.text, focused: false })}
                <Text style={[styles.circleLabel, { color: t.text, fontSize: c.tabLabelFontSize }]} numberOfLines={1}>
                  {secondGroup.label}
                </Text>
              </Animated.View>
              <Animated.View style={[styles.circleContent, secondCircleIconStyle]}>
                {renderIcon({ name: firstGroup.icon, size: c.iconSize, color: t.text, focused: false })}
                <Text style={[styles.circleLabel, { color: t.text, fontSize: c.tabLabelFontSize }]} numberOfLines={1}>
                  {firstGroup.label}
                </Text>
              </Animated.View>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
  },
  barRow: {
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 0,
    borderRadius: 30,
    overflow: 'hidden',
  },
  pillBlur: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
  },
  contentLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    // paddingTop: 4,
  },
  circleWrapper: {
    position: 'absolute',
    top: 0,
  },
  circleBlur: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // paddingTop: 4,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  tabLabel: {
    marginTop: 1,
  },
  circleButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLabel: {
    marginTop: 1,
  },
});
