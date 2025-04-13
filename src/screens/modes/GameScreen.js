import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  TouchableOpacity
} from 'react-native';
// Remove this import since we're using the React Native core TouchableOpacity
// import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playSound, SOUNDS, unloadSounds } from '../../utils/SoundUtils';

const GameScreen = ({ navigation, route }) => {
  // Timer states
  const [initialTimeInSeconds, setInitialTimeInSeconds] = useState(300); // Default 5 minutes
  const [topTimeInSeconds, setTopTimeInSeconds] = useState(300);
  const [bottomTimeInSeconds, setBottomTimeInSeconds] = useState(300);
  const [activePlayer, setActivePlayer] = useState(null); // null, 'top', or 'bottom'
  const [topDisplay, setTopDisplay] = useState('05:00');
  const [bottomDisplay, setBottomDisplay] = useState('05:00');
  const [gameOver, setGameOver] = useState(false);
  
  // Player name states
  const [topPlayerName, setTopPlayerName] = useState('Player A');
  const [bottomPlayerName, setBottomPlayerName] = useState('Player B');
  const [showNameModal, setShowNameModal] = useState(true);
  const [tempTopName, setTempTopName] = useState('Player A');
  const [tempBottomName, setTempBottomName] = useState('Player B');
  
  // Game duration tracking
  const [gameStartTime, setGameStartTime] = useState(null);
  const [topPlayerTotalTime, setTopPlayerTotalTime] = useState(0);
  const [bottomPlayerTotalTime, setBottomPlayerTotalTime] = useState(0);
  
  // Timer interval ref
  const timerRef = useRef(null);

  const convertTimeFormat = (timeString) => {
    // Convert "3 min" to seconds
    const minutes = parseInt(timeString.split(' ')[0]);
    return minutes * 60;
  };

  const formatTimeDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle time preset changes
  useEffect(() => {
    if (route.params?.selectedTime) {
      const newTimeInSeconds = convertTimeFormat(route.params.selectedTime);
      setInitialTimeInSeconds(newTimeInSeconds);
      
      // Reset both timers
      setTopTimeInSeconds(newTimeInSeconds);
      setBottomTimeInSeconds(newTimeInSeconds);
      setTopDisplay(formatTimeDisplay(newTimeInSeconds));
      setBottomDisplay(formatTimeDisplay(newTimeInSeconds));
      
      // Reset game state
      setActivePlayer(null);
      setGameOver(false);
      
      // Clear any running timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [route.params?.selectedTime]);

  // Timer logic
  useEffect(() => {
    if (activePlayer) {
      timerRef.current = setInterval(() => {
        if (activePlayer === 'top') {
          setTopTimeInSeconds(prevTime => {
            if (prevTime <= 1) {
              clearInterval(timerRef.current);
              setGameOver(true);
              setActivePlayer(null);
              // Save game data on timeout
              saveGameData('timeout');
              return 0;
            }
            return prevTime - 1;
          });
        } else {
          setBottomTimeInSeconds(prevTime => {
            if (prevTime <= 1) {
              clearInterval(timerRef.current);
              setGameOver(true);
              setActivePlayer(null);
              // Save game data on timeout
              saveGameData('timeout');
              return 0;
            }
            return prevTime - 1;
          });
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activePlayer]);

  // Update display times
  useEffect(() => {
    setTopDisplay(formatTimeDisplay(topTimeInSeconds));
  }, [topTimeInSeconds]);

  useEffect(() => {
    setBottomDisplay(formatTimeDisplay(bottomTimeInSeconds));
  }, [bottomTimeInSeconds]);

  // Handle timer press
  const handleTimerPress = (player) => {
    if (gameOver) return;
    
    // First press starts the game
    if (activePlayer === null) {
      // Record game start time on first move
      if (gameStartTime === null) {
        setGameStartTime(Date.now());
      }
      playSound(SOUNDS.TIMER_START);
      setActivePlayer(player === 'top' ? 'bottom' : 'top');
      return;
    }
    
    // If the pressed timer is active, do nothing
    if (activePlayer !== player) return;
    
    // Switch active player
    playSound(SOUNDS.CLICK);
    setActivePlayer(player === 'top' ? 'bottom' : 'top');
  };

  // Save game data to AsyncStorage
  const saveGameData = async (endType) => {
    try {
      if (!gameStartTime) return; // Don't save if game didn't start

      const now = Date.now();
      // Calculate total game duration in seconds (time elapsed since start)
      const gameDurationInSeconds = Math.floor((now - gameStartTime) / 1000);
      
      // Calculate time used by each player
      const topTimeUsed = initialTimeInSeconds - topTimeInSeconds;
      const bottomTimeUsed = initialTimeInSeconds - bottomTimeInSeconds;
      const totalTimeUsed = topTimeUsed + bottomTimeUsed;

      const gameData = {
        topPlayerName,
        bottomPlayerName,
        topPlayerTime: formatTimeDisplay(topTimeUsed),
        bottomPlayerTime: formatTimeDisplay(bottomTimeUsed),
        totalDuration: formatTimeDisplay(totalTimeUsed),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        timestamp: now,
        endType // 'checkmate' or 'timeout'
      };

      // Get existing history
      const existingDataString = await AsyncStorage.getItem('chessTimerHistory');
      let existingData = [];
      
      if (existingDataString) {
        existingData = JSON.parse(existingDataString);
      }
      
      // Add new game data
      const updatedData = [gameData, ...existingData];
      
      // Save updated history
      await AsyncStorage.setItem('chessTimerHistory', JSON.stringify(updatedData));
      
      // Notify user
      Alert.alert('Game Saved', 'Game data has been saved to history.');
    } catch (error) {
      console.error('Error saving game data:', error);
      Alert.alert('Save Error', 'Failed to save game data.');
    }
  };

  // End game (formerly Reset)
  const endGame = () => {
    if (gameStartTime && !gameOver) {
      // Save as checkmate if game was in progress and not already over by timeout
      saveGameData('checkmate');
    }
    
    // Stop any running timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset timer values
    setTopTimeInSeconds(initialTimeInSeconds);
    setBottomTimeInSeconds(initialTimeInSeconds);
    setTopDisplay(formatTimeDisplay(initialTimeInSeconds));
    setBottomDisplay(formatTimeDisplay(initialTimeInSeconds));
    
    // Reset game state
    setActivePlayer(null);
    setGameOver(false);
    setGameStartTime(null);
  };

  // Pause game
  const pauseGame = () => {
    if (activePlayer) {
      setActivePlayer(null);
    }
  };

  // Save player names
  const savePlayerNames = () => {
    setTopPlayerName(tempTopName || 'Player A');
    setBottomPlayerName(tempBottomName || 'Player B');
    setShowNameModal(false);
  };

  // Change player names
  const openNameModal = () => {
    pauseGame();
    setTempTopName(topPlayerName);
    setTempBottomName(bottomPlayerName);
    setShowNameModal(true);
  };
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Player Name Modal */}
        <Modal
          transparent={true}
          visible={showNameModal}
          animationType="fade"
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Enter Player Names</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Top Player:</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempTopName}
                  onChangeText={setTempTopName}
                  placeholder="Player A"
                  maxLength={20}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bottom Player:</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempBottomName}
                  onChangeText={setTempBottomName}
                  placeholder="Player B"
                  maxLength={20}
                />
              </View>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={savePlayerNames}
              >
                <Text style={styles.saveButtonText}>Save Names</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Top Player Timer */}
        <View style={[
          styles.topContainer, 
          activePlayer === 'top' && styles.activeTimer, 
          topTimeInSeconds === 0 && styles.expiredTimer
        ]}>
          <TouchableOpacity 
            style={styles.timerPlaceholder}
            onPress={() => handleTimerPress('top')}
            activeOpacity={0.8}
          >
            
            <Text style={[
              styles.timerText, 
              styles.upsideDown, 
              activePlayer === 'top' && styles.activeText
            ]}>
              {topDisplay}
            </Text>
            {topTimeInSeconds === 0 && (
              <Text style={[styles.timeUpText, styles.upsideDown]}>Time's up!</Text>
            )}
            <Text style={[
              styles.playerName, 
              styles.upsideDown, 
              activePlayer === 'top' && styles.activeText
            ]}>
              {topPlayerName}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={endGame}
          >
            <Text style={styles.buttonText}>End</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={pauseGame}
            disabled={activePlayer === null}
          >
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={openNameModal}
          >
            <Text style={styles.buttonText}>Names</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={() => {
              pauseGame();
              navigation.navigate('TimePreset', { source: 'Game' });
            }}
          >
            <Text style={styles.buttonText}>Time</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={() => {
              pauseGame();
              unloadSounds();
              navigation.popToTop();
            }}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom Player Timer */}
        <View style={[
          styles.bottomContainer, 
          activePlayer === 'bottom' && styles.activeTimer, 
          bottomTimeInSeconds === 0 && styles.expiredTimer
        ]}>
          <TouchableOpacity 
            style={styles.timerPlaceholder}
            onPress={() => handleTimerPress('bottom')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.playerName, 
              activePlayer === 'bottom' && styles.activeText
            ]}>
              {bottomPlayerName}
            </Text>
            <Text style={[
              styles.timerText, 
              activePlayer === 'bottom' && styles.activeText
            ]}>
              {bottomDisplay}
            </Text>
            {bottomTimeInSeconds === 0 && (
              <Text style={styles.timeUpText}>Time's up!</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  topContainer: {
    width: '100%',
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    width: '100%',
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTimer: {
    backgroundColor: '#000000',
  },
  activeText: {
    color: 'white',
  },
  expiredTimer: {
    backgroundColor: '#ffcdd2', // Light red when time's up
  },
  playerName: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 10,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  timeUpText: {
    fontSize: 20,
    color: 'red',
    fontWeight: 'bold',
    marginTop: 10,
  },
  upsideDown: {
    transform: [{ rotate: '180deg' }],
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: '20%',
    padding: 10,
  },
  controlButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    minWidth: 65,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Modal styles
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GameScreen;