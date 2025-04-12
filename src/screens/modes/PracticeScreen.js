import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const PracticeScreen = ({ navigation, route }) => {
  const [timeInSeconds, setTimeInSeconds] = useState(300); // Default 5 minutes (300 seconds)
  const [isRunning, setIsRunning] = useState(false);
  const [displayTime, setDisplayTime] = useState('05:00');
  const timerRef = useRef(null);

  const convertTimeFormat = (timeString) => {
    // Example: convert "3 min" to 180 seconds
    const minutes = parseInt(timeString.split(' ')[0]);
    return minutes * 60; // Convert minutes to seconds
  };

  const formatTimeDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Update the timer when a new time is selected
  useEffect(() => {
    if (route.params?.selectedTime) {
      const newTimeInSeconds = convertTimeFormat(route.params.selectedTime);
      setTimeInSeconds(newTimeInSeconds);
      setDisplayTime(formatTimeDisplay(newTimeInSeconds));
      // Reset timer if running
      if (isRunning) {
        resetTimer();
      }
    }
  }, [route.params?.selectedTime]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeInSeconds(prevTime => {
          if (prevTime <= 0) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  // Update display time whenever timeInSeconds changes
  useEffect(() => {
    setDisplayTime(formatTimeDisplay(timeInSeconds));
  }, [timeInSeconds]);

  const startTimer = () => {
    if (timeInSeconds > 0) {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    if (route.params?.selectedTime) {
      const resetTime = convertTimeFormat(route.params.selectedTime);
      setTimeInSeconds(resetTime);
    } else {
      setTimeInSeconds(300); // Default to 5 minutes
    }
  };

  return (
    
      <View style={styles.container}>
        <View style={styles.titleContainer}>
        <Text style={styles.title}>Practice Mode</Text>
        
        <TouchableOpacity 
          style={styles.timeButton} 
          onPress={() => {
            console.log('Time button pressed');
            pauseTimer(); // Pause timer before navigating
            navigation.navigate('TimePreset', { source: 'Practice' });
          }}
        >
          <Text style={styles.timeButtonText}>Change Time</Text>
        </TouchableOpacity>
        </View>
        
        <View 
          style={[styles.timerPlaceholder, timeInSeconds === 0 && styles.timerExpired, isRunning && styles.timerRunningBg]}
        >
          <TouchableOpacity
            activeOpacity={0.3}
            onPress={() => {
              if (isRunning) {
                pauseTimer();
              } else {
                startTimer();
              }
            }}
            style={styles.timerTouchable}
          >
            <Text style={[styles.timerText, isRunning && styles.timerRunningText]}>{displayTime}</Text>
            <Text style={[styles.timerStatus, isRunning && styles.timerRunningText]}>
              {timeInSeconds === 0 ? 'Times up!' : isRunning ? 'Tap to pause' : 'Tap to start'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controlButtons}>
        <TouchableOpacity 
            style={styles.resetButton} 
            onPress={resetTimer}
          >
            <Text style={styles.controlButtonText}>End</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => {
            console.log('Close button pressed');
            pauseTimer(); // Ensure timer is stopped before navigating
            navigation.popToTop();
          }}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    height: '20%',
  },
  timeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 150,
    alignItems: 'center',
  },
  timeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerPlaceholder: {
    height: '60%',
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerExpired: {
    backgroundColor: '#ffebee', 
  },
  timerRunningBg: {
    backgroundColor: '#000000', 
  },
  timerRunningText: {
    color: 'white',
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  timerStatus: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '20%',
    marginBottom: 20,
  },
  controlButton: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50', // Green
  },
  pauseButton: {
    backgroundColor: '#FF9800', // Orange
  },
  resetButton: {
    backgroundColor: '#2196F3', // Blue
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PracticeScreen;