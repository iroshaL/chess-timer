import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const presets = [
  { id: '1', name: 'Blitz', time: '1 min' },
  { id: '2', name: 'Rapid', time: '10 min' },
  { id: '3', name: 'Classical', time: '30 min' },
  { id: '4', name: 'Custom 1', time: '5 min' },
  { id: '5', name: 'Custom 2', time: '15 min' },
];


const TimePresetScreen = ({ navigation, route }) => {
  const { source } = route.params || { source: 'Practice' }; // Default to Practice if not specified

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time Presets</Text>
      
      <FlatList
        data={presets}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.presetItem}
            onPress={() => {
              console.log('Preset selected:', item.name);
              navigation.navigate({
                name: source,
                params: { selectedTime: item.time },
                merge: true,
              });
            }}
          >
            <Text style={styles.presetName}>{item.name}</Text>
            <Text style={styles.presetTime}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
      
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => {
          console.log('Close button pressed');
          navigation.goBack();
        }}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  list: {
    width: '100%',
    marginBottom: 20,
  },
  presetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },
  presetName: {
    fontSize: 18,
    fontWeight: '500',
  },
  presetTime: {
    fontSize: 18,
    color: '#555',
  },
  closeButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    width: '50%',
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TimePresetScreen;