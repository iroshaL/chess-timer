// src/screens/other/HistoryScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryScreen = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch history data from AsyncStorage
  const loadHistoryData = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem('chessTimerHistory');
      if (data) {
        setHistoryData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading history data:', error);
      Alert.alert('Error', 'Failed to load match history.');
    } finally {
      setLoading(false);
    }
  };

  // Clear all history data
  const clearHistoryData = async () => {
    try {
      await AsyncStorage.removeItem('chessTimerHistory');
      setHistoryData([]);
      Alert.alert('Success', 'Match history cleared successfully.');
    } catch (error) {
      console.error('Error clearing history data:', error);
      Alert.alert('Error', 'Failed to clear match history.');
    }
  };

  // Confirm before clearing history
  const confirmClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all match history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: clearHistoryData, style: 'destructive' }
      ]
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Load history data on component mount
  useEffect(() => {
    loadHistoryData();
  }, []);

  // Render each history item
  const renderHistoryItem = ({ item, index }) => (
    <View style={styles.historyItem}>
      <View style={styles.header}>
        <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
        <Text style={styles.endType}>{item.endType === 'checkmate' ? 'Checkmate' : 'Timeout'}</Text>
      </View>
      
      <View style={styles.playersContainer}>
        <Text style={styles.playerName}>{item.topPlayerName}</Text>
        <Text style={styles.playerTime}>{item.topPlayerTime}</Text>
      </View>
      
      <View style={styles.playersContainer}>
        <Text style={styles.playerName}>{item.bottomPlayerName}</Text>
        <Text style={styles.playerTime}>{item.bottomPlayerTime}</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.totalDuration}>Total: {item.totalDuration}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match History</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" />
      ) : historyData.length > 0 ? (
        <>
          <FlatList
            data={historyData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderHistoryItem}
            style={styles.list}
          />
          
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={confirmClearHistory}
          >
            <Text style={styles.clearButtonText}>Clear History</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No match history available</Text>
        </View>
      )}
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
  list: {
    width: '100%',
  },
  historyItem: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '500',
  },
  endType: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  playersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
  },
  playerTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 5,
    marginTop: 5,
  },
  totalDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  clearButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#757575',
  },
});

export default HistoryScreen;