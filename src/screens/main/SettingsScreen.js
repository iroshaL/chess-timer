// src/screens/main/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const SettingsScreen = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sound, setSound] = useState();

  // Load saved sound setting when component mounts
  useEffect(() => {
    loadSoundSettings();
  }, []);

  // Save sound setting whenever it changes
  useEffect(() => {
    saveSoundSettings();
  }, [soundEnabled]);

  // Function to load sound settings from AsyncStorage
  const loadSoundSettings = async () => {
    try {
      const value = await AsyncStorage.getItem('soundEnabled');
      // If value exists, parse it (it's stored as a string)
      if (value !== null) {
        setSoundEnabled(JSON.parse(value));
      }
    } catch (error) {
      console.error('Error loading sound settings:', error);
    }
  };

  // Function to save sound settings to AsyncStorage
  const saveSoundSettings = async () => {
    try {
      // Store as a string
      await AsyncStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    } catch (error) {
      console.error('Error saving sound settings:', error);
    }
  };

  // Play test sound
  const playTestSound = async () => {
    if (!soundEnabled) {
      Alert.alert('Sound is disabled', 'Enable sound to hear the test.');
      return;
    }

    try {
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
      }

      // Load sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/click.mp3') // Make sure this path is correct
      );
      setSound(newSound);

      // Play sound
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Error', 'Could not play test sound.');
    }
  };

  // Unload sound when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Sound</Text>
        <Switch
          value={soundEnabled}
          onValueChange={setSoundEnabled}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={soundEnabled ? "#2196F3" : "#f4f3f4"}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={playTestSound}
      >
        <Text style={styles.testButtonText}>Test Sound</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Sound settings will be applied to button clicks and timer actions.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingLabel: {
    fontSize: 18,
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    marginTop: 15,
    color: '#757575',
    fontSize: 14,
    textAlign: 'center',
  }
});

export default SettingsScreen;