import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useCat } from '../../contexts/CatContext';
import axios from 'axios';

const API_URL = Platform.select({
  android: 'http://192.168.100.16:3333',
  ios: 'http://localhost:3333',
  default: 'http://localhost:3333'
});

const CatFeedingSchedule = ({ navigation, route }) => {
  const { userToken } = useCat();
  const [portion, setPortion] = useState(150);
  const [selectedTime, setSelectedTime] = useState('07:00');
  const [loading, setLoading] = useState(false);
  const deviceId = 'bc:f6:c1:98:4a:3a';
  const selectedCat = route.params?.cat;

  const decreasePortion = () => {
    if (portion > 50) {
      setPortion(portion - 10);
    }
  };

  const increasePortion = () => {
    setPortion(portion + 10);
  };

  const handleSaveSchedule = async () => {
    if (!selectedCat) {
      Alert.alert('Error', 'No cat selected');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/pet-feeder/${deviceId}/cats/${selectedCat.id}/schedule`,
        {
          time: selectedTime,
          amount: portion
        },
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Feeding schedule saved successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ScheduleScreen', { 
                catId: selectedCat.id 
              })
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save feeding schedule'
      );
    } finally {
      setLoading(false);
    }
  };

  const decreaseTime = () => {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes > 360) { // Don't go below 06:00
      const newTotalMinutes = totalMinutes - 30;
      const newHours = Math.floor(newTotalMinutes / 60);
      const newMinutes = newTotalMinutes % 60;
      setSelectedTime(
        `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
      );
    }
  };

  const increaseTime = () => {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes < 1380) { // Don't go above 23:00
      const newTotalMinutes = totalMinutes + 30;
      const newHours = Math.floor(newTotalMinutes / 60);
      const newMinutes = newTotalMinutes % 60;
      setSelectedTime(
        `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Set feeding schedule</Text>
          <Text style={styles.subtitle}>
            Schedule daily feeding for {selectedCat?.name || 'your cat'}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Portion size</Text>
          <View style={styles.portionControlContainer}>
            <TouchableOpacity 
              style={styles.portionButton} 
              onPress={decreasePortion}
            >
              <Text style={styles.portionButtonText}>-</Text>
            </TouchableOpacity>
            
            <View style={styles.portionValue}>
              <Text style={styles.portionValueText}>{portion}g</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.portionButton} 
              onPress={increasePortion}
            >
              <Text style={styles.portionButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Feeding time</Text>
          <View style={styles.portionControlContainer}>
            <TouchableOpacity 
              style={styles.portionButton} 
              onPress={decreaseTime}
            >
              <Text style={styles.portionButtonText}>-</Text>
            </TouchableOpacity>
            
            <View style={styles.portionValue}>
              <Text style={styles.portionValueText}>{selectedTime}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.portionButton} 
              onPress={increaseTime}
            >
              <Text style={styles.portionButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={() => navigation.navigate('ScheduleScreen')}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.doneButton, loading && styles.doneButtonDisabled]} 
            onPress={handleSaveSchedule}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.doneButtonText}>Save Schedule</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  section: {
    marginBottom: 24,
    position: 'relative', 
  },
  sectionLabel: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
  portionControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
  },
  portionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portionButtonText: {
    fontSize: 24,
    color: '#888',
  },
  portionValue: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portionValueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  timeControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
  },
  timeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonText: {
    fontSize: 24,
    color: '#888',
  },
  timeValueContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  skipButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.3,
  },
  skipButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  doneButton: {
    height: 56,
    backgroundColor: '#FF5722',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.7,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  doneButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default CatFeedingSchedule;