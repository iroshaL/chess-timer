import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import HomeScreen from '../screens/main/HomeScreen';
import PracticeScreen from '../screens/modes/PracticeScreen';
import GameScreen from '../screens/modes/GameScreen';
import TimePresetScreen from '../screens/other/TimePresetScreen';
import HistoryScreen from '../screens/other/HistoryScreen';

const Stack = createNativeStackNavigator();

const GameStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="HomeScreen">
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ 
          title: 'Chess Timer',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="Practice" 
        component={PracticeScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="Game" 
        component={GameScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="TimePreset" 
        component={TimePresetScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
};

export default GameStackNavigator;