import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

export interface TabItem {
  name: string;
  label: string;
  icon: string;
  activeIcon?: string;
}

export interface TabGroup {
  id: string;
  label: string;
  icon: string;
  tabs: TabItem[];
}

export interface PillTabsTheme {
  tint: string;
  text: string;
  background: string;
  border: string;
  badgeBackground?: string;
  badgeText?: string;
}

export interface RenderIconProps {
  name: string;
  size: number;
  color: string;
  focused: boolean;
}

export interface PillTabsConfig {
  circleSize?: number;
  gap?: number;
  horizontalMargin?: number;
  bottomPadding?: number;
  tabLabelFontSize?: number;
  iconSize?: number;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

export interface AnimatedTabBarProps {
  groups: [TabGroup, TabGroup];
  activeGroupId: string;
  activeTabName: string;
  onGroupChange: (groupId: string) => void;
  onTabPress: (tabName: string) => void;
  badge?: Record<string, number>;
  renderIcon: (props: RenderIconProps) => ReactNode;
  theme?: Partial<PillTabsTheme>;
  config?: PillTabsConfig;
  style?: ViewStyle;
}
