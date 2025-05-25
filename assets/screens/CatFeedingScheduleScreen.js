import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';

const CatFeedingSchedule = ({ navigation }) => {
  const [portion, setPortion] = useState(150);
  const [feedingTimesModalVisible, setFeedingTimesModalVisible] = useState(false);
  const [selectedFeedingTimes, setSelectedFeedingTimes] = useState('Times of feeding per day');
  const [firstFeedingTime, setFirstFeedingTime] = useState('07:00');
  const [customFeedingTimes, setCustomFeedingTimes] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const customInputRef = useRef(null);

  const feedingTimesOptions = [
    'Other',
    '1 time per day',
    '3 times per day',
    '5 times per day',
  ];

  const timeOptions = [
    '06:00',
    '06:30',
    '07:00',
    '07:30',
    '08:00',
  ];

  const decreaseFeedingTime = () => {
    const [hours, minutes] = firstFeedingTime.split(':').map(Number);
    if (hours < 8 || (hours === 8 && minutes === 0)) {
      setFirstFeedingTime('08:00');
      return;
    }
    
    let newHours = hours;
    let newMinutes = minutes - 30;
    
    if (newMinutes < 0) {
      newMinutes = 30;
      newHours = newHours - 1;
    }
    
    setFirstFeedingTime(`${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`);
  };

  const increaseFeedingTime = () => {
    const [hours, minutes] = firstFeedingTime.split(':').map(Number);
    

    if (hours < 8 || (hours === 8 && minutes === 0)) {
      setFirstFeedingTime('08:30');
      return;
    }
    
    let newHours = hours;
    let newMinutes = minutes + 30;
    
    if (newMinutes >= 60) {
      newMinutes = 0;
      newHours = newHours + 1;
    }
    
    if (newHours > 12) {
      newHours = 12;
      newMinutes = 0;
    }
    
    setFirstFeedingTime(`${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`);
  };

  const decreasePortion = () => {
    if (portion > 50) {
      setPortion(portion - 10);
    }
  };

  const increasePortion = () => {
    setPortion(portion + 10);
  };

  const selectFeedingTimes = (option) => {
    if (option === 'Other') {
      setSelectedFeedingTimes('Other');
      setShowOtherInput(true);
      setFeedingTimesModalVisible(false);
      setTimeout(() => {
        if (customInputRef.current) {
          customInputRef.current.focus();
        }
      }, 100);
    } else {
      setSelectedFeedingTimes(option);
      setShowOtherInput(false);
      setFeedingTimesModalVisible(false);
    }
  };

  const isTimeAfter8 = () => {
    const [hours, minutes] = firstFeedingTime.split(':').map(Number);
    return hours > 8 || (hours === 8 && minutes > 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Set feeding</Text>
          <Text style={styles.subtitle}>Set your cat's feeding schedule</Text>
        </View>
        
        <View style={styles.sectionFeed}>
          <Text style={styles.sectionLabel}>Recommended portion</Text>
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
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setFeedingTimesModalVisible(true)}
          >
            <Text style={[styles.dropdownText, selectedFeedingTimes === 'Times of feeding per day' && styles.placeholderText]}>
              {selectedFeedingTimes}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
          
          {showOtherInput && (
            <TextInput
              ref={customInputRef}
              style={styles.otherInput}
              value={customFeedingTimes}
              onChangeText={setCustomFeedingTimes}
              placeholder="Enter custom feeding times"
              keyboardType="number-pad"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Time of first feeding</Text>
          <View style={styles.timeOptionsGrid}>
            {timeOptions.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeOption,
                  firstFeedingTime === time && styles.selectedTimeOption
                ]}
                onPress={() => setFirstFeedingTime(time)}
              >
                <Text style={[styles.timeText, firstFeedingTime === time && styles.selectedTimeText]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
            
            {/* Adjustable time control for >08:00 */}
            <View style={[
              styles.timeOptionControl,
              isTimeAfter8() && styles.selectedTimeOption
            ]}>
              <TouchableOpacity style={styles.timeControlButton} onPress={decreaseFeedingTime}>
                <Text style={styles.timeControlButtonText}>-</Text>
              </TouchableOpacity>
              
              <View style={styles.timeControlValue}>
                <Text style={[
                  styles.timeText, 
                  isTimeAfter8() && styles.selectedTimeText
                ]}>
                  {isTimeAfter8() ? firstFeedingTime : '08:00'}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.timeControlButton} onPress={increaseFeedingTime}>
                <Text style={styles.timeControlButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Feeding Times Modal */}
        {feedingTimesModalVisible && (
          <View style={styles.dropdownMenu}>
            {feedingTimesOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownOption}
                onPress={() => selectFeedingTimes(option)}
              >
                <Text style={styles.dropdownOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('SmartPetFeederScreen')}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.navigate('SmartPetFeederScreen')}>
            <Text style={styles.doneButtonText}>Done</Text>
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
  sectionFeed: {
    marginBottom: 30,
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
  dropdown: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#888',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#888',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 140, 
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#666',
  },
  otherInput: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    marginTop: 8,
    fontSize: 16,
  },
  timeOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeOption: {
    width: '30%',
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  timeOptionControl: {
    width: '30%',
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 6,
    backgroundColor: '#fff',
  },
  selectedTimeOption: {
    borderColor: '#FF5722',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  selectedTimeText: {
    color: '#FF5722',
    fontWeight: 'bold',
  },
  timeControlButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeControlButtonText: {
    fontSize: 18,
    color: '#888',
  },
  timeControlValue: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default CatFeedingSchedule;