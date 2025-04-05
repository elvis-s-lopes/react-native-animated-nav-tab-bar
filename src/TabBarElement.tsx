// UI Components imports
import {
  CommonActions,
  Descriptor,
  NavigationState,
  PartialState,
  Route,
  TabNavigationState,
} from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  I18nManager,
  StyleSheet,
  View,
} from "react-native";
import { ScreenContainer as RNScreenContainer } from "react-native-screens";
import ResourceSavingScene from "./ResourceSavingScene";
import { IAppearanceOptions, TabElementDisplayOptions } from "./types";
import { BottomTabBarWrapper, Dot, Label, TabButton } from "./UIComponents";

interface TabBarElementProps {
  state: TabNavigationState<Record<string, object | undefined>>;
  navigation: any;
  descriptors: Record<string, Descriptor<any, any, any>>;
  appearance: IAppearanceOptions;
  tabBarOptions?: any;
  lazy?: boolean;
}

/**
 * @name TabBarElement
 * React Navigation v5 custom navigation (bottom tab bar) builder with an
 * an interactive animation, and easily customizable.
 *
 * @param state Navigation state
 * @param navigation Navigation object
 * @param descriptors
 * @param appearance Object with appearance configurations (see readme)
 * @param rest
 *
 * @return function that creates the custom tab bar
 */
export default ({
  state,
  navigation,
  descriptors,
  appearance,
  tabBarOptions,
  lazy,
}: TabBarElementProps): JSX.Element => {
  // Appearance options destruction
  const {
    topPadding,
    bottomPadding,
    horizontalPadding,
    tabBarBackground,
    activeTabBackgrounds,
    activeColors,
    floating,
    dotCornerRadius,
    whenActiveShow,
    whenInactiveShow,
    dotSize,
    shadow,
    tabButtonLayout,
  } = appearance;

  const {
    activeTintColor,
    inactiveTintColor,
    activeBackgroundColor,
    tabStyle,
    labelStyle,
  } = tabBarOptions;

  // State
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [loaded, setLoaded] = useState([state.index]);
  const [positions, setPositions] = useState<{[key: string]: number}>({});
  const [widths, setWidths] = useState<{[key: string]: number}>({});
  const [heights, setHeights] = useState<{[key: string]: number}>({});
  
  // Animated value
  const [animatedLeftPosition] = useState(new Animated.Value(0));

  useEffect(() => {
    const { index } = state;
    setLoaded(loaded.includes(index) ? loaded : [...loaded, index]);
  }, [state]);

  // false = Portrait
  // true = Landscape
  const [isPortrait, setIsPortrait] = useState(true);

  // Reset animation when changing screen orientation
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", () => {
      if (
        (isPortrait && !didChangeToPortrait()) ||
        (!isPortrait && didChangeToPortrait())
      ) {
        setIsPortrait(!isPortrait);
        
        // Get current tab position and dimensions
        const currentKey = state.routes[state.index].key;
        if (positions[currentKey] !== undefined) {
          const currentPos = positions[currentKey];
          const currentWidth = widths[currentKey] || width;
          const currentHeight = heights[currentKey] || height;
          
          // Re-animate to current position
          animateTo(currentPos, currentWidth, currentHeight);
        }
      }
    });
    
    return () => subscription.remove();
  }, [isPortrait, positions, widths, heights]);

  /**
   * @returns true if current orientation is Portrait, false otherwise
   */
  const didChangeToPortrait = () => {
    const dim = Dimensions.get("screen");
    return dim.height >= dim.width;
  };

  /**
   * Dot animation
   * @param {*} val animation value
   * @returns Animated.CompositeAnimation
   * Use .start() to start the animation
   */
  /**
   * Animate to a specific position
   * @param position Position to animate to
   */
  const animateTo = (position: number, tabWidth: number, tabHeight: number) => {
    // Update the dimensions
    setWidth(tabWidth);
    setHeight(tabHeight);
    
    // Animate to the new position
    Animated.spring(animatedLeftPosition, {
      toValue: position,
      useNativeDriver: false,
      friction: 8,    // Lower friction = faster, but more bouncy
      tension: 80,    // Higher tension = faster, more forceful movement
      velocity: 10    // Initial velocity for quicker start
    }).start();
  };

  // The updatePrevPos function has been completely removed as it's no longer needed

  /**
   * Update tab positions when they are laid out
   */
  useEffect(() => {
    // Set initial position for the first render
    if (state.routes.length > 0 && state.index >= 0) {
      const currentKey = state.routes[state.index].key;
      if (positions[currentKey] !== undefined) {
        animatedLeftPosition.setValue(positions[currentKey]);
      }
    }
  }, []);

  /**
   * Animate whenever the navigation state changes
   */
  useEffect(() => {
    const currentIndex = state.index;
    const currentRoute = state.routes[currentIndex];
    
    if (positions[currentRoute.key] !== undefined) {
      // Get the position and dimensions of the new tab
      const newPosition = positions[currentRoute.key];
      const newWidth = widths[currentRoute.key] || width;
      const newHeight = heights[currentRoute.key] || height;
      
      // Animate to the new position with the new dimensions
      animateTo(newPosition, newWidth, newHeight);
    }
  }, [state.index, positions]);

  // Compute activeBackgroundColor, if array provided, use array otherwise fallback to
  // default tabBarOptions property activeBackgroundColor (fallbacks for all unspecified tabs)
  const activeTabBackground = activeTabBackgrounds
    ? Array.isArray(activeTabBackgrounds)
      ? activeTabBackgrounds[state.index] || activeBackgroundColor
      : activeTabBackgrounds
    : activeBackgroundColor;

  // Compute activeBackgroundColor, if array provided, use array otherwise fallback to
  // default tabBarOptions property activeTintColor (fallbacks for all unspecified tabs)
  const activeColor = activeColors
    ? Array.isArray(activeColors)
      ? activeColors[state.index] || activeTintColor
      : activeColors
    : activeTintColor;

  /**
   * Create a tab button given a route and route index
   * @param {*} route
   * @param {*} routeIndex
   * @returns React.Node with the button component
   */
  const createTab = (
    route: Route<string> & {
      state?: NavigationState | PartialState<NavigationState> | undefined;
    },
    routeIndex: number
  ) => {
    const focused = routeIndex == state.index;
    const { options } = descriptors[route.key];
    const tintColor = focused ? activeColor : inactiveTintColor;

    const icon = options.tabBarIcon;

    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
        ? options.title
        : route.name;

    const accessibilityLabel =
      options.tabBarAccessibilityLabel !== undefined
        ? options.tabBarAccessibilityLabel
        : typeof label === "string"
        ? `${label}, tab, ${routeIndex + 1} of ${state.routes.length}`
        : undefined;

    // Render the label next to the icon
    // only if showLabel is true
    const renderLabel = () => {
      if (typeof label === "string") {
        return (
          <Label
            tabButtonLayout={tabButtonLayout}
            whenActiveShow={whenActiveShow}
            whenInactiveShow={whenInactiveShow}
            style={labelStyle}
            activeColor={tintColor}
          >
            {label}
          </Label>
        );
      } else {
        return label({ focused, color: activeColor });
      }
    };

    /**
     * Helper function to render the icon
     */
    const renderIcon = () => {
      if (icon === undefined) {
        return null;
      }

      let defaultIconSize = 20;
      return icon({ focused, color: tintColor, size: defaultIconSize });
    };

    /**
     * On Press Handler
     * Emits an event to the navigation
     */
    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!focused && !event.defaultPrevented) {
        navigation.dispatch({
          ...CommonActions.navigate(route.name),
          target: state.key,
        });
      }
    };

    /**
     * On Long Press Handler
     * Emits an event to the navigation
     */
    const onLongPress = () => {
      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    };

    /**
     * Read the position and dimension of a tab.
     * and update animation state
     * @param {*} e
     */
    const onLayout = (e: any) => {
      const newPos = e.nativeEvent.layout.x;
      const newWidth = e.nativeEvent.layout.width;
      const newHeight = e.nativeEvent.layout.height;
      
      // Store position and dimensions of this tab
      setPositions(prev => ({
        ...prev,
        [route.key]: newPos
      }));
      
      setWidths(prev => ({
        ...prev,
        [route.key]: newWidth
      }));
      
      setHeights(prev => ({
        ...prev,
        [route.key]: newHeight
      }));
      
      // If this is the focused tab, update the initial position
      if (focused && Object.keys(positions).length === 0) {
        animatedLeftPosition.setValue(newPos);
        setWidth(newWidth);
        setHeight(newHeight);
      }
    };

    const labelAndIcon = () => {
      if (focused) {
        switch (whenActiveShow) {
          case TabElementDisplayOptions.BOTH:
            return (
              <React.Fragment>
                <View>{renderIcon()}</View>
                {renderLabel()}
              </React.Fragment>
            );
          case TabElementDisplayOptions.LABEL_ONLY:
            return renderLabel();
          case TabElementDisplayOptions.ICON_ONLY:
            return renderIcon();
          default:
            return (
              <React.Fragment>
                <View>{renderIcon()}</View>
                {renderLabel()}
              </React.Fragment>
            );
        }
      } else {
        switch (whenInactiveShow) {
          case TabElementDisplayOptions.BOTH:
            return (
              <React.Fragment>
                <View>{renderIcon()}</View>
                {renderLabel()}
              </React.Fragment>
            );
          case TabElementDisplayOptions.LABEL_ONLY:
            return renderLabel();
          case TabElementDisplayOptions.ICON_ONLY:
            return renderIcon();
          default:
            return (
              <React.Fragment>
                <View>{renderIcon()}</View>
                {renderLabel()}
              </React.Fragment>
            );
        }
      }
    };

    return (
      <TabButton
        key={route.key}
        focused={focused}
        labelLength={label.length}
        accessibilityLabel={accessibilityLabel}
        onLayout={onLayout}
        onPress={onPress}
        onLongPress={onLongPress}
        dotSize={dotSize}
        tabButtonLayout={tabButtonLayout}
      >
        {labelAndIcon()}
      </TabButton>
    );
  };

  const { overlayStyle } = StyleSheet.create({
    overlayStyle: {
      top: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      position: "absolute",
    },
  });

  // Cast the ScreenContainer component to any to bypass type checking
  const ScreenContainerComponent = RNScreenContainer as any;

  const { options } = descriptors[state.routes[state.index].key];
  const tabBarVisible =
    options.tabBarVisible == undefined ? true : options.tabBarVisible;
  return (
    <React.Fragment>
      {/* Current Screen */}
      <View
        style={{
          flex: 1,
          overflow: "hidden",
        }}
      >
        <ScreenContainerComponent style={{ flex: 1 }}>
          {state.routes.map((route, index) => {
            const descriptor = descriptors[route.key];
            const { unmountOnBlur } = descriptor.options;
            const isFocused = state.index === index;

            if (unmountOnBlur && !isFocused) {
              return null;
            }

            if (lazy && !loaded.includes(index) && !isFocused) {
              // Don't render a screen if we've never navigated to it
              return null;
            }

            return (
              <ResourceSavingScene
                key={route.key}
                isVisible={isFocused}
                style={StyleSheet.absoluteFill}
              >
                <View
                  accessibilityElementsHidden={!isFocused}
                  importantForAccessibility={
                    isFocused ? "auto" : "no-hide-descendants"
                  }
                  style={{ flex: 1 }}
                >
                  {descriptor.render()}
                </View>
              </ResourceSavingScene>
            );
          })}
        </ScreenContainerComponent>
      </View>
      {/* Tab Bar */}
      {tabBarVisible && (
        <View pointerEvents={"box-none"} style={floating && overlayStyle}>
          <BottomTabBarWrapper
            style={tabStyle}
            floating={floating}
            topPadding={topPadding}
            bottomPadding={bottomPadding}
            horizontalPadding={horizontalPadding}
            tabBarBackground={tabBarBackground}
            shadow={shadow}
          >
            {state.routes.map(createTab)}
            {/* Animated Dot / Background */}
            <Dot
              dotCornerRadius={dotCornerRadius}
              topPadding={topPadding}
              activeTabBackground={activeTabBackground}
              style={
                I18nManager.isRTL
                  ? {
                      right: animatedLeftPosition,
                      width,
                      height,
                    }
                  : {
                      left: animatedLeftPosition,
                      width,
                      height,
                    }
              }
              width={width}
              height={height}
            />
          </BottomTabBarWrapper>
        </View>
      )}
    </React.Fragment>
  );
};