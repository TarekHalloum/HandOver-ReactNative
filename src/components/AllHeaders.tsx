import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const AllHeaders = () => {
  return (
    <View style={styles.header}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Wayz</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#0059AA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default AllHeaders;
