// src/components/Card.tsx
import React, { PropsWithChildren } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const MAX_WIDTH = 400;

export default function Card({ children }: PropsWithChildren<{}>) {
  const cardWidth = Math.min(SCREEN_W * 0.9, MAX_WIDTH);
  return <View style={[styles.card, { width: cardWidth }]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignSelf: 'center',
    // shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    // elevation for Android
    elevation: 5,
  },
});
