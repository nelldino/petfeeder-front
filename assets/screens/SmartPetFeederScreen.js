import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCat } from '../../contexts/CatContext';
import axios from 'axios';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:3333',
  ios: 'http://localhost:3333',
  default: 'http://localhost:3333'
});

const getNextMeal = (schedules) => {
  if (!schedules || schedules.length === 0) return null;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); 

  
  const nextSchedule = schedules.reduce((closest, schedule) => {
    const [hours, minutes] = schedule.time.split(':').map(Number);
    const scheduleMinutes = hours * 60 + minutes;
    

    const adjustedScheduleMinutes = 
      scheduleMinutes <= currentTime 
        ? scheduleMinutes + 24 * 60 
        : scheduleMinutes;

    if (!closest || adjustedScheduleMinutes < closest.adjustedMinutes) {
      return {
        schedule,
        adjustedMinutes: adjustedScheduleMinutes
      };
    }
    return closest;
  }, null);

  return nextSchedule?.schedule;
};

const SmartPetFeederScreen = ({ navigation }) => {
  const { userToken, currentCatId } = useCat();
  const [isFeeding, setIsFeeding] = useState(false);
  const [cats, setCats] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextMeals, setNextMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [containerWeight, setContainerWeight] = useState(null);

  const handleFeedNow = async () => {
    const selectedCat = cats[currentIndex];
    if (!selectedCat) {
      Alert.alert('Error', 'Please select a cat first');
      return;
    }

    try {
      setIsFeeding(true);
      const deviceId = '$bc:f6:c1:98:4a:3a';
      
      const response = await axios.post(
        `${API_URL}/pet-feeder/${deviceId}/cats/${selectedCat.id}/feed`,
        { 
          amount: 100
        },
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        Alert.alert('Success', `Food dispensed for ${selectedCat.name}!`);
        fetchCatsAndMeals();
      }
    } catch (error) {
      console.error('Error feeding:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to dispense food'
      );
    } finally {
      setIsFeeding(false);
    }
  };

  const fetchCatsAndMeals = async () => {
    try {
      const response = await axios.get(`${API_URL}/cats`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setCats(response.data);
      
      const mealsData = {};
      for (const cat of response.data) {
        try {
          const scheduleResponse = await axios.get(
            `${API_URL}/pet-feeder/cats/${cat.id}/schedules`,
            {
              headers: {
                'Authorization': `Bearer ${userToken}`
              }
            }
          );

          const nextMeal = getNextMeal(scheduleResponse.data.schedules);
          
          if (nextMeal) {
            mealsData[cat.id] = {
              time: nextMeal.time,
              amount: `${nextMeal.amount}`
            };
          } else {
            mealsData[cat.id] = { time: "No schedule", amount: "---" };
          }
        } catch (error) {
          console.error(`Error fetching schedules for cat ${cat.id}:`, error);
          mealsData[cat.id] = { time: "Error", amount: "---" };
        }
      }
      setNextMeals(mealsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cats:', error);
      setLoading(false);
    }
  };

  const fetchContainerWeight = async () => {
    try {
      const deviceId = '$bc:f6:c1:98:4a:3a';
      const response = await axios.get(
        `${API_URL}/pet-feeder/${deviceId}/weight`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setContainerWeight(response.data.weight);
    } catch (error) {
      console.error('Error fetching container weight:', error);
      setContainerWeight(null);
    }
  };

  useEffect(() => {
    fetchCatsAndMeals();
    fetchContainerWeight();
    
    const weightInterval = setInterval(fetchContainerWeight, 30000);
    
    return () => clearInterval(weightInterval);
  }, [currentCatId]);

  const navigateToScreen = (screenName) => {
    const selectedCatId = cats[currentIndex]?.id;
    navigation.navigate(screenName, { catId: selectedCatId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF5722" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tap the button to feed your kitty!</Text>
      </View>
      
      <View style={styles.feedButtonContainer}>
        <TouchableOpacity 
          style={[styles.feedButton, isFeeding && styles.feedButtonDisabled]}
          onPress={handleFeedNow}
          disabled={isFeeding}
        >
          <View style={styles.feedButtonInner}>
            {isFeeding ? (
              <ActivityIndicator size="large" color="#FF3705" />
            ) : (
              <Ionicons name="restaurant-outline" size={50} color="#FF3705" />
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.weightContainer}>
        <Text style={styles.weightLabel}>
          The current weight of the container is:
        </Text>
        <Text style={styles.weightValue}>
          {containerWeight ? `${containerWeight}g` : '--'}
        </Text>
      </View>
      <View style={styles.nextMealContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
            setCurrentIndex(newIndex);
          }}
        >
          {cats.map((cat, index) => (
            <View key={cat.id} style={styles.nextMealCard}>
              <View style={styles.catInfoSection}>
                <Text style={styles.catName}>{cat.name}</Text>
              </View>
              <View style={styles.mealInfoSection}>
                <Ionicons name="time-outline" size={35} color="#FF3705" />
                <View style={styles.nextMealInfo}>
                  <Text style={styles.nextMealTitle}>Next meal</Text>
                  <Text style={styles.nextMealTime}>
                    {nextMeals[cat.id]?.time || "--:--"} - {nextMeals[cat.id]?.amount || "---"}g
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        
        {/* Dots indicator */}
        <View style={styles.dotsContainer}>
          {cats.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot
              ]}
            />
          ))}
        </View>
      </View>
      
      
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, styles.activeTab]} 
          onPress={() => navigation.navigate('SmartPetFeederScreen')}
        >
          <Ionicons name="home-outline" size={24} color="#FF3705" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigateToScreen('ScheduleScreen')}
        >
          <Ionicons name="calendar-outline" size={24} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigateToScreen('FeedingHistoryScreen')}
        >
          <Ionicons name="menu-outline" size={24} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigateToScreen('PetProfileScreen')}
        >
          <Ionicons name="settings-outline" size={24} color="#aaa" />
        </TouchableOpacity>
      </View>

      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF3705',
  },
  header: {
    paddingTop:50,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    padding: 12
  },
  feedButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  feedButtonInner: {
    alignItems: 'center',
  },
  feedButtonText: {
    fontSize: 18,
    color: '#FF5722',
    fontWeight: 'bold',
  },
  nextMealContainer: {
    paddingVertical: 16,
  },
  nextMealCard: {
    width: Dimensions.get('window').width - 32,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  catInfoSection: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  catName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  mealInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextMealInfo: {
    marginLeft: 15,
    flex: 1,
  },
  nextMealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nextMealTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF3705',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#FF3705',
  },
  feedButtonDisabled: {
    opacity: 0.7,
  },
  weightContainer: {
    padding: 16,
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  weightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default SmartPetFeederScreen;