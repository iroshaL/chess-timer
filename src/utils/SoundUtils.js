// src/utils/SoundUtils.js
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache for sounds
const soundObjects = {};

// Sound file mappings
export const SOUNDS = {
  CLICK: 'click',
  TIMER_START: 'timer_start',
  TIMER_END: 'timer_end',
  SWITCH_PLAYER: 'switch_player'
};

// Get the sound enabled setting
export const isSoundEnabled = async () => {
  try {
    const value = await AsyncStorage.getItem('soundEnabled');
    return value !== null ? JSON.parse(value) : true; // Default to true if not set
  } catch (error) {
    console.error('Error checking sound settings:', error);
    return true; // Default to true on error
  }
};

// Play a sound if sounds are enabled
export const playSound = async (soundName) => {
  try {
    // Check if sound is enabled
    const soundEnabled = await isSoundEnabled();
    if (!soundEnabled) return;

    // Map sound names to file paths
    const soundFiles = {
      [SOUNDS.CLICK]: require('../../assets/sounds/click.mp3'),
      [SOUNDS.TIMER_START]: require('../../assets/sounds/timer_start.mp3'),
    };

    // Get the appropriate sound file
    const soundFile = soundFiles[soundName];
    if (!soundFile) return;

    // Create or reuse sound object
    if (!soundObjects[soundName]) {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      soundObjects[soundName] = sound;
    }

    // Play the sound
    const sound = soundObjects[soundName];
    await sound.setPositionAsync(0); // Reset to beginning
    await sound.playAsync();
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

// Clean up sounds (call this when app is closing or when you no longer need sounds)
export const unloadSounds = async () => {
  try {
    for (const key in soundObjects) {
      if (soundObjects[key]) {
        await soundObjects[key].unloadAsync();
      }
    }
    // Clear the cache
    Object.keys(soundObjects).forEach(key => delete soundObjects[key]);
  } catch (error) {
    console.error('Error unloading sounds:', error);
  }
};