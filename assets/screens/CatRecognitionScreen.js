import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCat } from '../../contexts/CatContext';
import axios from 'axios';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:3333',
  ios: 'http://localhost:3333',
  default: 'http://localhost:3333'
});

const CatRecognitionScreen = ({ navigation, route }) => {
  const { userToken } = useCat();
  const { cats } = route.params;
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const deviceId = '$bc:f6:c1:98:4a:3a';

  const startRecognition = async () => {
    const currentCat = cats[currentCatIndex];
    
    try {
      setIsRecognizing(true);
      setTimeLeft(5); 
      
      // Start countdown
      const countdownInterval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      const response = await axios.post(
        `${API_URL}/pet-feeder/${deviceId}/cats/${currentCat.id}/sendImage`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      clearInterval(countdownInterval);

      if (response.data.success) {
        setTimeLeft(10); 
        const loadingInterval = setInterval(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        // Wait for 10 seconds
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        clearInterval(loadingInterval);

        if (currentCatIndex < cats.length - 1) {
          setCurrentCatIndex(prev => prev + 1);
        } else {
          if (route.params?.onComplete) {
            await route.params.onComplete();
          }
          navigation.replace('ModelTraining');
        }
      }
    } catch (error) {
      console.error('Recognition error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to recognize cat'
      );
    } finally {
      setIsRecognizing(false);
      setTimeLeft(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Cat Recognition</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.catName}>{cats[currentCatIndex].name}</Text>
        
        <View style={styles.instructionContainer}>
          <Text style={styles.instruction}>
            Place {cats[currentCatIndex].name} in front of the pet feeder and click the 'Start taking pictures' button.
          </Text>
          <Text style={styles.subInstruction}>
            The built-in camera will take pictures of your cat for 5 seconds to train the cat recognition model.
          </Text>
          <Text style={styles.highlightInstruction}>
            Don't make the cat stand still, encourage movement!
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.recognizeButton, isRecognizing && styles.recognizeButtonDisabled]}
          onPress={startRecognition}
          disabled={isRecognizing}
        >
          {isRecognizing ? (
            <View style={styles.recognizingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.timeText}>
                {timeLeft > 5 ? 'Processing...' : `Taking pictures: ${timeLeft}s`}
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Start taking pictures</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.progress}>
          Cat {currentCatIndex + 1} of {cats.length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  catName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  subInstruction: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  highlightInstruction: {
    fontSize: 16,
    color: '#FF3705',
    fontWeight: '500',
    textAlign: 'center',
  },
  recognizeButton: {
    backgroundColor: '#FF3705',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 24,
  },
  recognizeButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recognizingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  progress: {
    fontSize: 14,
    color: '#999',
  }
});

export default CatRecognitionScreen;