import React, { useState } from 'react';
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
  android: 'http://192.168.100.16:3333',
  ios: 'http://localhost:3333',
  default: 'http://localhost:3333'
});

const ModelTrainingScreen = ({ navigation, route }) => {
  const { userToken } = useCat();
  const [isTraining, setIsTraining] = useState(false);
  const deviceId = 'bc:f6:c1:98:4a:3a';

  const startTraining = async () => {
    try {
      setIsTraining(true);
      
      const response = await axios.post(
        `${API_URL}/pet-feeder/bc:f6:c1:98:4a:3a/trainModel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        Alert.alert(
          'Training Complete',
          'The model has been successfully trained!',
          [
            {
              text: 'Done',
              onPress: () => {
                navigation.navigate('PetProfileScreen');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Training error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to train model'
      );
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Train Recognition Model</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="brain-outline" size={80} color="#FF3705" />
        </View>
        
        <Text style={styles.mainText}>
          Ready to Train
        </Text>
        
        <Text style={styles.description}>
          Now that we have captured images of your cats, we can train the model to recognize them. This process may take a few minutes.
        </Text>

        <TouchableOpacity 
          style={[styles.trainButton, isTraining && styles.trainButtonDisabled]}
          onPress={startTraining}
          disabled={isTraining}
        >
          {isTraining ? (
            <View style={styles.trainingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.trainingText}>Training in progress...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Start Training</Text>
          )}
        </TouchableOpacity>
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
  iconContainer: {
    marginBottom: 24,
  },
  mainText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  trainButton: {
    backgroundColor: '#FF3705',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  trainButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default ModelTrainingScreen;