import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useCat } from '../../contexts/CatContext';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:3333',
  ios: 'http://localhost:3333',
  default: 'http://localhost:3333'
});

const ScheduleScreen = ({ navigation }) => {
  const { currentCatId, currentPet, userToken } = useCat();
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const toggleAnim = useRef(new Animated.Value(1)).current;
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [timeInput, setTimeInput] = useState('09:00');
  const [portionInput, setPortionInput] = useState('150');

  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(currentCatId);
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  useEffect(() => {
    fetchCats();
    if (selectedCatId) {
      fetchSchedules();
    }
  }, [selectedCatId]);

  // Fetch schedules
  const fetchSchedules = async () => {
    if (!selectedCatId || !userToken) {
      console.log('No cat selected or no auth token');
      setMeals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching schedules for cat:', selectedCatId);
      
      const response = await axios.get(
        `${API_URL}/pet-feeder/cats/${selectedCatId}/schedules`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        }
      );
      const schedulesData = response.data.schedules || [];
      
      const formattedMeals = schedulesData.map(schedule => ({
        id: schedule.id.toString(),
        time: schedule.time,
        portion: schedule.amount.toString(),
        deviceId: schedule.deviceId,
      }));
      
      setMeals(formattedMeals);
      
    } catch (error) {
      console.error('Error fetching schedules:', error);
      if (error.response?.status === 404) {
        setMeals([]);
      } else {
        Alert.alert('Error', 'Failed to fetch feeding schedules');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCats = async () => {
    if (!userToken) {
      console.log('No auth token available');
      navigation.navigate('Login');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/cats`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Cats fetched successfully:', response.data);
      setCats(response.data);
      
      if (!selectedCatId && response.data.length > 0) {
        setSelectedCatId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching cats:', error);
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, redirecting to login');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Failed to load cats');
      }
    }
  };

  const toggleSwitch = () => {
    const newValue = !scheduleEnabled;
    setScheduleEnabled(newValue);
    
    Animated.timing(toggleAnim, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const openAddModal = () => {
    setEditingMeal(null);
    setTimeInput('09:00');
    setPortionInput('150');
    setModalVisible(true);
  };

  const openEditModal = (meal) => {
    setEditingMeal(meal);
    setTimeInput(meal.time);
    setPortionInput(meal.portion);
    setModalVisible(true);
  };

  // Save meal (add or edit)
  const saveMeal = async () => {
    if (!timeInput || !portionInput) {
      Alert.alert('Error', 'Please enter both time and portion');
      return;
    }
    
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timeInput)) {
      Alert.alert('Error', 'Invalid time format. Use HH:mm (e.g., 08:30)');
      return;
    }

    const portionNum = parseInt(portionInput);
    if (isNaN(portionNum) || portionNum <= 0) {
      Alert.alert('Error', 'Please enter a valid portion amount');
      return;
    }

    try {
      setSaving(true);
      const scheduleRequest = {
        time: timeInput,
        amount: portionNum,
      };

      const config = {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      };

      if (editingMeal) {
        // Update existing schedule
        console.log('Updating schedule:', editingMeal.id);
        await axios.put(
          `${API_URL}/pet-feeder/${editingMeal.deviceId}/cats/${selectedCatId}/schedule/${editingMeal.id}`,
          scheduleRequest,
          config
        );
      } else {
        // Create new schedule
        const deviceId = meals.length > 0 ? meals[0].deviceId : '$bc:f6:c1:98:4a:3a';
        console.log('Creating new schedule with device:', deviceId);
        
        const response = await axios.post(
          `${API_URL}/pet-feeder/${deviceId}/cats/${selectedCatId}/schedule`,
          scheduleRequest,
          config
        );
        console.log('Schedule created:', response.data);
      }

      // Refresh the schedules and wait for it to complete
      console.log('About to refresh schedules...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure backend is updated
      await fetchSchedules();
      console.log('Schedules refreshed, closing modal...');
      
      // Close modal only after successful save and refresh
      setModalVisible(false);
      
      // Reset form
      setTimeInput('09:00');
      setPortionInput('150');
      setEditingMeal(null);
      
      console.log('Modal closed and form reset');
      
    } catch (error) {
      console.error('Error saving schedule:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save feeding schedule');
    } finally {
      setSaving(false);
    }
  };

  const deleteMeal = async () => {
    if (!editingMeal) return;

    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this scheduled meal?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              console.log('Deleting schedule:', editingMeal.id);
              
              await axios.post(
                `${API_URL}/pet-feeder/schedules/${editingMeal.id}/delete`,
                {},
                {
                  headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              // Refresh schedules list after successful deletion
              await fetchSchedules();
              setModalVisible(false);
              setEditingMeal(null);
              
            } catch (error) {
              console.error('Error deleting schedule:', error);
              Alert.alert(
                'Error', 
                error.response?.data?.message || 'Failed to delete feeding schedule'
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={styles.loadingText}>Loading schedules...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Schedule</Text>

        <View style={styles.catSelectorContainer}>
          <TouchableOpacity 
            style={styles.catSelector}
            onPress={() => setShowCatDropdown(!showCatDropdown)}
          >
            <Text style={styles.selectedCatText}>
              {cats.find(cat => cat.id === selectedCatId)?.name || 'Select Cat'}
            </Text>
            <Ionicons 
              name={showCatDropdown ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666"
            />
          </TouchableOpacity>

          {showCatDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView 
                style={styles.dropdownScroll}
                showsVerticalScrollIndicator={true}
                bounces={false}
              >
                {cats.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catItem,
                      selectedCatId === cat.id && styles.selectedCatItem
                    ]}
                    onPress={() => {
                      setSelectedCatId(cat.id);
                      setShowCatDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.catItemText,
                      selectedCatId === cat.id && styles.selectedCatItemText
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Schedule</Text>
          <TouchableOpacity 
            style={styles.switchContainer}
            onPress={toggleSwitch}
            activeOpacity={0.8}
          >
            <Animated.View style={[
              styles.switchTrack,
              {
                backgroundColor: toggleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['#e0e0e0', '#FF3705']
                })
              }
            ]}>
              <Animated.View style={[
                styles.switchThumb,
                {
                  transform: [{
                    translateX: toggleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [2, 22]
                    })
                  }]
                }
              ]} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={styles.mealsSection}>
          <Text style={styles.subHeader}>Meals scheduled ({meals.length})</Text>

          <FlatList
            data={meals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.mealItem} onPress={() => openEditModal(item)}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealTime}>{item.time}</Text>
                  <Text style={styles.mealPortion}>{item.portion}g</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            )
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No scheduled meals yet</Text>
                <Text style={styles.emptySubText}>Tap "Add meal" to create your first schedule</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={20} color="#FF4500" />
          <Text style={styles.addMeal}>Add meal</Text>
        </TouchableOpacity>

        <Modal transparent visible={modalVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingMeal ? 'Edit meal' : 'Add meal'}</Text>
                {editingMeal && (
                  <TouchableOpacity style={styles.trashIcon} onPress={deleteMeal}>
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput
                  value={timeInput}
                  onChangeText={setTimeInput}
                  style={styles.input}
                  placeholder="HH:MM (e.g., 08:30)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Portion (grams)</Text>
                <TextInput
                  value={portionInput}
                  onChangeText={setPortionInput}
                  style={styles.input}
                  placeholder="Amount in grams"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.modalButtons}>
                <Pressable 
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    setEditingMeal(null);
                  }}
                >
                  <Text style={styles.cancel}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                  onPress={saveMeal}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* Navigation Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('SmartPetFeederScreen')}>
          <Ionicons name="home-outline" size={24} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.activeTab]} onPress={() => navigation.navigate('ScheduleScreen')}>
          <Ionicons name="calendar-outline" size={24} color="#FF3705" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('FeedingHistoryScreen')}>
          <Ionicons name="menu-outline" size={24} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('PetProfileScreen')}>
          <Ionicons name="settings-outline" size={24} color="#aaa" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginBottom: 5,
  },
  emptySubText: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: 14,
  },
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 70,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    paddingTop: 50, 
    color: '#333' 
  },
  catSelectorContainer: {
    marginBottom: 20,
    zIndex: 1000,
    backgroundColor: '#ffffff',
  },
  catSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fafafa',
  },
  selectedCatText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginTop: 8,
    zIndex: 1000,
    maxHeight: 200,
    overflow: 'hidden', // Prevent content from showing outside borders
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        backgroundColor: '#ffffff',
      },
      android: {
        elevation: 8,
        backgroundColor: '#ffffff',
      },
    }),
  },
  dropdownScroll: {
    // Added style for the ScrollView inside the dropdown
    paddingVertical: 10,
  },
  catItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  selectedCatItem: {
    backgroundColor: '#fff5f0',
  },
  catItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCatItemText: {
    fontWeight: 'bold',
    color: '#FF3705',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  label: { 
    fontSize: 16, 
    color: '#333' 
  },
  mealsSection: {
    flex: 1,
  },
  subHeader: { 
    fontSize: 16, 
    fontWeight: '500', 
    marginBottom: 15, 
    color: '#555' 
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 8,
  },
  mealInfo: {
    flex: 1,
  },
  mealTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mealPortion: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 20,
  },
  addMeal: {
    color: '#FF4500',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333',
  },
  trashIcon: { 
    padding: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancel: { 
    fontSize: 16, 
    color: '#FF3B30',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#FF4500',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
  // Custom switch styles
  switchContainer: {
    padding: 5,
  },
  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectCatButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FF3705',
    borderRadius: 8,
  },
  selectCatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  }
});

export default ScheduleScreen;