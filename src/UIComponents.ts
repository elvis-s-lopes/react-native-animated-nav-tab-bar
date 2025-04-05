import { Animated, StyleSheet, ViewStyle } from "react-native";
import Styled, { css } from "styled-components/native";
import { BlurIntensity, DotSize, TabButtonLayout, TabElementDisplayOptions } from "./types";
import { isIphoneX } from "./utils/iPhoneX";
import React from "react";
import { BlurView } from "expo-blur";

// Config
const BOTTOM_PADDING = 20;
const BOTTOM_PADDING_IPHONE_X = 30;

const floatingMarginBottom = css`
  margin-bottom: ${isIphoneX() ? BOTTOM_PADDING_IPHONE_X : BOTTOM_PADDING}px;
`;
const floatingMarginHorizontal = css`
  margin-horizontal: 20px;
`;

const floatingRoundCorner = css`
  border-radius: 40px;
`;

interface IBottomTabBarWrapper {
  floating: boolean;
  shadow: boolean;
  tabBarBackground: string;
  topPadding: number;
  horizontalPadding: number;
  bottomPadding: number;
  blurEnabled?: boolean;
  blurIntensity?: BlurIntensity;
  blurAmount?: number;
}

// Criamos um componente styled para o container principal
const TabBarWrapperStyled = Styled.View<IBottomTabBarWrapper>`
  position: relative;
  flex-direction: row;
  ${(p) => p.floating && floatingMarginHorizontal};
  elevation: 2;
  ${(p) => p.floating && floatingMarginBottom};
  ${(p) => p.floating && floatingRoundCorner};
  overflow: hidden;
  ${(p) => p.shadow && SHADOW};
`;

// Criamos um componente styled para o conteúdo
const TabBarContent = Styled.View<IBottomTabBarWrapper>`
  flex: 1;
  flex-direction: row;
  padding-bottom: ${(p) =>
    p.floating
      ? p.bottomPadding
      : isIphoneX()
        ? BOTTOM_PADDING_IPHONE_X + p.bottomPadding
        : p.bottomPadding}px;
  padding-top: ${(p) => p.topPadding}px;
  padding-horizontal: ${(p) => p.horizontalPadding}px;
`;

// Componente BottomTabBarWrapper usando createElement em vez de JSX
const BottomTabBarWrapper = (props: IBottomTabBarWrapper & { style?: ViewStyle, children?: React.ReactNode }) => {
  const { style, children, blurEnabled, blurIntensity, blurAmount, floating, shadow } = props;

  // Estilos dinâmicos
  const containerStyle = StyleSheet.create({
    container: {
      backgroundColor: blurEnabled ? 'transparent' : props.tabBarBackground,
      borderRadius: floating ? 40 : 0
    }
  });

  // Determinar a intensidade do blur
  const intensity = blurAmount || 10;
  let blurType = 'default';
  
  if (blurIntensity === BlurIntensity.LIGHT) {
    blurType = 'light';
  } else if (blurIntensity === BlurIntensity.DARK) {
    blurType = 'dark';
  }

  // Criamos o elemento BlurView para uso condicional
  const blurViewElement = blurEnabled ? 
    React.createElement(BlurView, {
      style: StyleSheet.absoluteFill,
      intensity: intensity,
      tint: blurType as 'light' | 'dark' | 'default'
    }) : null;
  
  // Criamos o elemento TabBarContent
  const contentElement = React.createElement(TabBarContent, {
    floating,
    topPadding: props.topPadding,
    bottomPadding: props.bottomPadding,
    horizontalPadding: props.horizontalPadding,
    tabBarBackground: props.tabBarBackground,
    shadow
  }, children);

  // Retornamos o elemento wrapper com seus filhos
  return React.createElement(
    TabBarWrapperStyled,
    {
      style: [containerStyle.container, style],
      floating,
      shadow,
      tabBarBackground: props.tabBarBackground,
      topPadding: props.topPadding,
      bottomPadding: props.bottomPadding,
      horizontalPadding: props.horizontalPadding,
      blurEnabled,
      blurIntensity,
      blurAmount
    },
    [blurViewElement, contentElement]
  );
};

const calculateDotSize = (size: DotSize) => {
  switch (size) {
    case DotSize.SMALL:
      return 40;
    case DotSize.MEDIUM:
      return 10;
    case DotSize.LARGE:
      return 5;
    default:
      return 10;
  }
};

interface ITabButton {
  tabButtonLayout: TabButtonLayout;
  focused: boolean;
  labelLength: number;
  dotSize: DotSize;
}

const TabButton = Styled.TouchableOpacity<ITabButton>`
  flex: 1;
  flex-direction: ${(p) =>
    p.tabButtonLayout == TabButtonLayout.VERTICAL
      ? "column"
      : p.tabButtonLayout == TabButtonLayout.HORIZONTAL
        ? "row"
        : "row"
  };
  justify-content: center;
  align-items: center;
  border-radius: 100px;
  padding-vertical: 10px;
  flex-grow: ${(p) =>
    p.focused ? p.labelLength / calculateDotSize(p.dotSize) + 1 : 1};
`;

interface ILabelProps {
  whenInactiveShow: TabElementDisplayOptions;
  whenActiveShow: TabElementDisplayOptions;
  tabButtonLayout: TabButtonLayout;
  activeColor: string;
}

const Label = Styled(Animated.Text)<ILabelProps>`
  fontSize: ${(p) =>
    p.whenInactiveShow == TabElementDisplayOptions.BOTH || p.whenActiveShow == TabElementDisplayOptions.BOTH ? "14" : "17"}px;
  color: ${(p) => p.activeColor};
  margin-left: ${(p) =>
    (p.whenActiveShow == TabElementDisplayOptions.BOTH || p.whenInactiveShow == TabElementDisplayOptions.BOTH) &&
      p.tabButtonLayout == TabButtonLayout.HORIZONTAL
      ? 8
      : 0}px;
`;

interface IDotProps {
  topPadding: number;
  width: number;
  height: number;
  dotCornerRadius: number;
  activeTabBackground: string;
}

const Dot = Styled(Animated.View)<IDotProps>`
  position: absolute;
  top: ${(p) => p.topPadding}px;
  width: ${(p) => p.width}px;
  height: ${(p) => p.height}px;
  border-radius: ${(p) => p.dotCornerRadius}px;
  background-color: ${(p) => p.activeTabBackground};
  z-index: -1;
`;

const SHADOW = css`
  shadow-color: #000000;
  shadow-offset: 0px 5px;
  shadow-opacity: 0.05;
  elevation: 1;
  shadow-radius: 20px;
`;

export { BottomTabBarWrapper, TabButton, Label, Dot, SHADOW };