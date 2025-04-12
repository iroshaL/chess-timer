// src/screens/main/AboutScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About Chess Timer</Text>
        <Text style={styles.paragraph}>
          This is a chess timer application that provides timing functionality for chess games. 
          The app includes both practice mode for single player training and game mode for competitive play.
        </Text>
        <Text style={styles.paragraph}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default AboutScreen;