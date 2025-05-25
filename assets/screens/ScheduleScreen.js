import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ScheduleScreen = ({ navigation }) =>  {
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const toggleAnim = useRef(new Animated.Value(scheduleEnabled ? 1 : 0)).current;
  const [meals, setMeals] = useState([
    { id: '1', time: '10:00', portion: '150' },
    { id: '2', time: '17:00', portion: '150' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [timeInput, setTimeInput] = useState('');
  const [portionInput, setPortionInput] = useState('');

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

  const saveMeal = () => {
    if (editingMeal) {
      setMeals(meals.map(m =>
        m.id === editingMeal.id ? { ...m, time: timeInput, portion: portionInput } : m
      ));
    } else {
      const newMeal = {
        id: Date.now().toString(),
        time: timeInput,
        portion: portionInput,
      };
      setMeals([...meals, newMeal]);
    }
    setModalVisible(false);
  };

  const deleteMeal = () => {
    if (editingMeal) {
      setMeals(meals.filter(m => m.id !== editingMeal.id));
      setModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Schedule</Text>

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

        <Text style={styles.subHeader}>Meals scheduled</Text>

        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.mealItem} onPress={() => openEditModal(item)}>
              <Text style={styles.mealText}>{item.time} - {item.portion} g</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity onPress={openAddModal}>
          <Text style={styles.addMeal}>+ Add meal</Text>
        </TouchableOpacity>

        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingMeal ? 'Edit meal' : 'Add meal'}</Text>

              {editingMeal && (
                <TouchableOpacity style={styles.trashIcon} onPress={deleteMeal}>
                  <Ionicons name="trash-outline" size={24} color="#aaa" />
                </TouchableOpacity>
              )}

              <Text>Time</Text>
              <TextInput
                value={timeInput}
                onChangeText={setTimeInput}
                style={styles.input}
                placeholder="HH:MM"
              />

              <Text>Portion</Text>
              <TextInput
                value={portionInput}
                onChangeText={setPortionInput}
                style={styles.input}
                placeholder="grams"
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancel}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveButton} onPress={saveMeal}>
                  <Text style={styles.saveText}>Save</Text>
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
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    alignSelf: 'center', 
    color: '#333' 
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: { 
    fontSize: 16, 
    color: '#333' 
  },
  subHeader: { 
    fontSize: 16, 
    fontWeight: '500', 
    marginBottom: 10, 
    color: '#555' 
  },
  mealItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  mealText: {
    fontSize: 16,
    color: '#333',
  },
  addMeal: {
    color: '#FF4500',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 10 
  },
  trashIcon: { 
    position: 'absolute', 
    top: 20, 
    right: 20 
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginTop: 5,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancel: { 
    fontSize: 16, 
    color: '#FF3B30' 
  },
  saveButton: {
    backgroundColor: '#FF4500',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
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
});

export default ScheduleScreen;