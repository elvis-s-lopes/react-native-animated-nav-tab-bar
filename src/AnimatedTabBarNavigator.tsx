import * as React from "react";
import { BlurIntensity, DotSize, IAppearanceOptions, TabButtonLayout, TabElementDisplayOptions } from './types';
import {
  TabRouter,
  createNavigatorFactory,
  useNavigationBuilder,
} from "@react-navigation/native";
import TabBarElement from "./TabBarElement";

const defaultAppearance: IAppearanceOptions = {
  topPadding: 10,
  bottomPadding: 10,
  horizontalPadding: 10,
  tabBarBackground: "#FFFFFF",
  floating: false,
  dotCornerRadius: 100,
  whenActiveShow: TabElementDisplayOptions.BOTH,
  whenInactiveShow: TabElementDisplayOptions.ICON_ONLY,
  shadow: false,
  dotSize: DotSize.DEFAULT,
  tabButtonLayout: TabButtonLayout.HORIZONTAL,
  activeColors: undefined,
  activeTabBackgrounds: undefined,
  blurEnabled: false,
  blurIntensity: BlurIntensity.DEFAULT,
  blurAmount: 10
};

const defaultTabBarOptions = {
  activeTintColor: "black",
  inactiveTintColor: "black",
  activeBackgroundColor: "#FFCF64",
  labelStyle: {
    fontWeight: "bold",
  },
};

interface IBottomTabNavigatorProps {
  initialRouteName?: string;
  backBehavior?: "history" | "initialRoute" | "order" | "none" | undefined;
  children: React.ReactNode;
  screenOptions?: any;
  tabBarOptions?: any;
  appearance: Partial<IAppearanceOptions>;
  lazy?: boolean;
}

const BottomTabNavigator: React.FC<IBottomTabNavigatorProps> = ({
  initialRouteName,
  backBehavior,
  children,
  screenOptions,
  tabBarOptions,
  appearance,
  lazy = true,
  ...rest
}) => {
  const { state, descriptors, navigation } = useNavigationBuilder(TabRouter, {
    initialRouteName,
    backBehavior,
    children,
    screenOptions,
  });

  const finalAppearance: IAppearanceOptions = {
    ...defaultAppearance,
    ...appearance
  }

  const finalTabBarOptions = {
    ...defaultTabBarOptions,
    ...tabBarOptions
  }

  return (
    <TabBarElement
      {...rest}
      state={state}
      navigation={navigation}
      descriptors={descriptors}
      tabBarOptions={finalTabBarOptions}
      appearance={finalAppearance}
    />
  ) as React.ReactElement;
}

export default createNavigatorFactory(BottomTabNavigator);