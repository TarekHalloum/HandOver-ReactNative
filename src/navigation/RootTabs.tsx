// src/navigation/RootTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens & Stacks
import HomeScreen      from '../screens/HomeScreen';
import ServicesStack   from './ServicesStack';
import MySupplier      from '../screens/MySupplier';
// MoreStack replaces direct MoreScreen to keep footer and tabs
import MoreStack       from './MoreStack';
import MyRequestsScreen from '../screens/MyRequestsScreen';

const Tab = createBottomTabNavigator();

export default function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }): BottomTabNavigationOptions => ({
        headerShown: false,
        tabBarActiveTintColor: '#3E575D',
        tabBarInactiveTintColor: '#868686',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: { backgroundColor: '#FFFFFF', height: 60, paddingBottom: 6 },
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case 'Home':
              return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
            case 'Services':
              return <Ionicons name={focused ? 'build' : 'build-outline'} size={size} color={color} />;
            case 'Requests':
              return <Ionicons name={focused ? 'clipboard' : 'clipboard-outline'} size={size} color={color} />;
            case 'Supplier':
              return <Ionicons name={focused ? 'storefront' : 'storefront-outline'} size={size} color={color} />;
            case 'More':
              return <Ionicons name={focused ? 'menu' : 'menu-outline'} size={size} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     />
<Tab.Screen
  name="Services"
  component={ServicesStack}
  listeners={({ navigation }) => ({
    tabPress: e => {
      // Prevent the default behavior (which would just focus the tab)
      e.preventDefault();
      // Always go to the root “Services” screen inside that stack
      navigation.navigate('Services', { screen: 'Services' });
    },
  })}
/>
      <Tab.Screen name="Requests"     component={MyRequestsScreen}     />
      <Tab.Screen
        name="Supplier"
        component={MySupplier}
        options={{ tabBarLabel: "I'm a Supplier" }}
      />
      {/* More tab uses nested MoreStack */}
      <Tab.Screen name="More" component={MoreStack} />
    </Tab.Navigator>
  );
}