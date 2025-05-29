import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Platform,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useCat } from '../../contexts/CatContext';

const API_URL = Platform.select({
  android: 'http://192.168.100.16:3333/cats',
  ios: 'http://localhost:3333/cats',
  default: 'http://localhost:3333/cats'
});

const DEFAULT_CAT_IMAGE = 'https://www.dreamiestreats.co.uk/sites/g/files/fnmzdf5196/files/2024-07/Cat-paws-1.jpg';

const catBreeds = [
  "Just a cute cat",
  "Siamese",
  "British Shorthair",
  "Scottish Fold",
  "Sphynx",
  "Persian",
  "Other"
];

const PetProfileScreen = ({navigation}) => {
  const { setCurrentCatId, setCurrentPet } = useCat();
  
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '',
    breed: '',
    weight: '',
    imageUrl: null,
    imageFile: null
  });
  const [userToken, setUserToken] = useState(null);
  const [showRecognitionPopup, setShowRecognitionPopup] = useState(false);
  const [recognitionCompleted, setRecognitionCompleted] = useState(false);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [isOtherBreed, setIsOtherBreed] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);
          await fetchPets(token);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load pets');
      }
    };

    loadInitialData();
  }, []); // Empty dependency array to run once on mount

  const fetchPets = useCallback(async (token) => {
    console.log('[Pets Debug] Fetching pets...');
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[Pets Debug] Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch pets: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Pets Debug] Fetched pets:', data);
      
      setPets(data);
      if (data.length > 0) {
        setCurrentPetIndex(0);
        setCurrentCatId(data[0].id);
        setCurrentPet(data[0]);
      }
      setError(null);
    } catch (err) {
      console.error('[Pets Debug] Error:', err);
      setError('Failed to load pet information');
    } finally {
      setLoading(false);
    }
  }, []);

const checkRecognitionStatus = async () => {
  try {
    const status = await AsyncStorage.getItem('recognitionCompleted');
    console.log('[Recognition Debug] Current status from storage:', status);

    if (status === 'true') {
      setRecognitionCompleted(true);
      return;
    }

    // Only show popup if multiple cats and recognition not done
    if (pets.length > 1) {
      console.log('[Recognition Debug] Multiple cats detected, showing popup');
      setShowRecognitionPopup(true);
    }
  } catch (error) {
    console.error('Error checking recognition status:', error);
  }
};


// Also add this useEffect to monitor pets changes:
useEffect(() => {
  // Only check recognition status when pets array changes and has more than 1 pet
  if (pets.length > 1 && !loading) {
    const checkAndShowPopup = async () => {
      try {
        const status = await AsyncStorage.getItem('recognitionCompleted');
        console.log('[Recognition Debug] Pets changed, status:', status, 'pets count:', pets.length);
        
        if (status !== 'true') {
          // Small delay to ensure component is fully rendered
          setTimeout(() => {
            setShowRecognitionPopup(true);
          }, 500);
        }
      } catch (error) {
        console.error('Error in pets change effect:', error);
      }
    };
    
    checkAndShowPopup();
  }
}, [pets.length, loading]);
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need permission to access your photo library to add a pet image.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      
      setNewPet({
        ...newPet,
        imageUrl: selectedAsset.uri,
        imageFile: {
          uri: selectedAsset.uri,
          type: 'image/jpeg',
          name: 'pet-image.jpg'
        }
      });
    }
  };

  const handleAddAnotherCat = () => {
    setNewPet({
      name: '',
      breed: '',
      weight: '',
      imageUrl: DEFAULT_CAT_IMAGE,
      imageFile: null
    });
    setModalVisible(true);
  };

  const handleEditPet = () => {
    navigation.navigate('EditPetScreen', { 
      pet: pets[currentPetIndex],
      onSave: async (updatedPet) => {
        try {
          const response = await fetch(`${API_URL}/${updatedPet.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify(updatedPet),
          });

          if (!response.ok) {
            throw new Error('Failed to update pet');
          }

          const updatedPets = [...pets];
          updatedPets[currentPetIndex] = updatedPet;
          setPets(updatedPets);
        } catch (err) {
          console.error('Error updating pet:', err);
          Alert.alert('Error', 'Failed to update pet information');
        }
      }
    });
  };

const handleSaveNewPet = async () => {
  if (!newPet.name.trim()) {
    Alert.alert('Error', 'Please enter a name for your pet');
    return;
  }
  
  if (!newPet.breed.trim()) {
    Alert.alert('Error', 'Please enter a breed for your pet');
    return;
  }
  
  if (!newPet.weight.trim()) {
    Alert.alert('Error', 'Please enter a weight for your pet');
    return;
  }
  

  const weight = parseFloat(newPet.weight);
  if (isNaN(weight) || weight <= 0) {
    Alert.alert('Error', 'Please enter a valid weight for your pet');
    return;
  }

  try {
    setSaveLoading(true);
    

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: newPet.name.trim(),
        breed: newPet.breed.trim(),
        weight: weight,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create pet: ${errorText}`);
    }

    const createdPet = await response.json();
    
   
    if (newPet.imageFile && newPet.imageUrl !== DEFAULT_CAT_IMAGE) {
      try {
        const formData = new FormData();
        
       
        if (Platform.OS === 'web') {
          
          const response = await fetch(newPet.imageFile.uri);
          const blob = await response.blob();
          
          
          let filename = `cat_${createdPet.id}.jpg`;
          if (newPet.imageFile.uri.includes('/')) {
            const pathParts = newPet.imageFile.uri.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart.includes('.')) {
              filename = lastPart;
            }
          }
          
          formData.append('image', blob, filename);
        } else {
          
          let fileType = 'jpg';
          if (newPet.imageFile.uri.includes('.')) {
            const uriParts = newPet.imageFile.uri.split('.');
            fileType = uriParts[uriParts.length - 1].toLowerCase();
          }
          
          if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) {
            fileType = 'jpg';
          }
          
          formData.append('image', {
            uri: newPet.imageFile.uri,
            name: `cat_${createdPet.id}.${fileType}`,
            type: `image/${fileType}`,
          });
        }

        const imageResponse = await fetch(`${API_URL}/${createdPet.id}/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            
          },
          body: formData,
        });

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.warn('Image upload failed:', errorText);
         
        } else {
          const imageData = await imageResponse.json();
          
          createdPet.imageUrl = imageData.imageUrl || imageData.url || imageData.secure_url;
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        
      }
    }
    

    const updatedPets = [...pets, createdPet];
    setPets(updatedPets);
    setCurrentPetIndex(updatedPets.length - 1);
    setModalVisible(false);
    
    // Show success alert
    Alert.alert('Success', `${createdPet.name} has been added successfully!`, [
      {
        text: 'OK',
        onPress: async () => {
          // Check if we should show recognition popup after adding new cat
          if (updatedPets.length > 1) {
            const status = await AsyncStorage.getItem('recognitionCompleted');
            if (status !== 'true') {
              setShowRecognitionPopup(true);
            }
          }
        }
      }
    ]);
    
  } catch (err) {
    console.error('Error creating pet:', err);
    Alert.alert('Error', err.message || 'Failed to create new pet. Please try again.');
  } finally {
    setSaveLoading(false);
  }
};
  const handleDeletePet = async (petId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete pet');
      }

      const updatedPets = pets.filter(pet => pet.id !== petId);
      setPets(updatedPets);
      setCurrentPetIndex(Math.min(currentPetIndex, updatedPets.length - 1));
      setLoading(false);
    } catch (err) {
      console.error('Error deleting pet:', err);
      Alert.alert('Error', 'Failed to delete pet');
      setLoading(false);
    }
  };

  const switchPet = (index) => {
    setCurrentPetIndex(index);
    setCurrentCatId(pets[index].id);
    setCurrentPet(pets[index]);
  };

  const currentPet = pets[currentPetIndex];

  // Update the handleStartRecognition function
  const handleStartRecognition = () => {
    setShowRecognitionPopup(false);
    const deviceId = 'bc:f6:c1:98:4a:3a';
    
    navigation.navigate('CatRecognitionScreen', { 
      cats: pets,
      deviceId: deviceId,
      onComplete: async () => {
        try {
          // Save recognition completion status
          await AsyncStorage.setItem('recognitionCompleted', 'true');
          setRecognitionCompleted(true);
        } catch (error) {
          console.error('Error saving recognition status:', error);
        }
      }
    });
  };

  useEffect(() => {
    console.log('Recognition Debug:', {
      petsLength: pets.length,
      recognitionCompleted,
      showRecognitionPopup,
      recognitionStatus: AsyncStorage.getItem('recognitionCompleted')
    });
  }, [pets.length, recognitionCompleted, showRecognitionPopup]);

  const handleLogout = async () => {
    try {
      // Only remove userToken, keep recognitionCompleted status
      await AsyncStorage.removeItem('userToken');
      
      // Navigate to SignIn screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignUpScreen' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pet Profile</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3705" />
          <Text style={styles.loadingText}>Loading pet information...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => userToken ? fetchPets(userToken) : null}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : pets.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="paw-outline" size={80} color="#DDDDDD" />
          <Text style={styles.emptyStateText}>No pets added yet</Text>
          <Text style={styles.emptyStateSubtext}>Add your first cat to get started</Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={handleAddAnotherCat}
          >
            <Text style={styles.addFirstButtonText}>+ Add your first cat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={{paddingBottom: 20}}>
          {/* Pet Card */}

          <View style={styles.petCard}>
            <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditPet}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            <View style={styles.petImageContainer}>
              <View style={styles.petImageWrapper}>
                <Image
                  source={{ uri: currentPet.imageUrl || DEFAULT_CAT_IMAGE }}
                  style={styles.petImage}
                  onError={(e) => {
                    console.log("Failed to load pet image");
                
                    const updatedPets = [...pets];
                    updatedPets[currentPetIndex] = {
                      ...currentPet,
                      imageUrl: DEFAULT_CAT_IMAGE
                    };
                    setPets(updatedPets);
                  }}
                  resizeMode="cover"
                />
              </View>
            </View>
            
            {/* Pet Name */}
            <Text style={styles.petName}>{currentPet.name}</Text>
            
            {/* Pet Switcher */}
            {pets.length > 1 && (
              <View style={styles.petSwitcher}>
                {pets.map((pet, index) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={[
                      styles.petSwitchDot,
                      index === currentPetIndex && styles.activePetSwitchDot
                    ]}
                    onPress={() => switchPet(index)}
                  />
                ))}
              </View>
            )}
            
            <View style={styles.divider} />
            
            {/* Pet Details */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Breed</Text>
              <Text style={styles.detailValue}>{currentPet.breed}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>{currentPet.weight}</Text>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePet(currentPet.id)}
            >
              <Text style={styles.deleteButtonText}>Delete Pet</Text>
            </TouchableOpacity>
          </View>
          
          {/* Add Another Cat Button */}
          <TouchableOpacity
            style={styles.addAnotherButton}
            onPress={handleAddAnotherCat}
          >
            <Text style={styles.addAnotherButtonText}>+ Add another cat</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Add New Cat Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Cat</Text>
            
            {/* Pet Image Picker */}
            <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
              <Image 
                source={{ uri: newPet.imageUrl }} 
                style={styles.pickerImage} 
                resizeMode="cover"
              />
              <View style={styles.pickerOverlay}>
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.pickerText}>Choose photo</Text>
              </View>
            </TouchableOpacity>
            
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Cat name"
              value={newPet.name}
              onChangeText={(text) => setNewPet({...newPet, name: text})}
              maxLength={50}
            />
            
            <Text style={styles.modalLabel}>Breed</Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowBreedDropdown(!showBreedDropdown)}
                activeOpacity={0.8}
              >
                <Text style={newPet.breed ? styles.dropdownSelectedText : styles.dropdownPlaceholderText}>
                  {newPet.breed || "Select breed"}
                </Text>
                <Ionicons 
                  name={showBreedDropdown ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#7C7B73" 
                />
              </TouchableOpacity>
              
              {showBreedDropdown && (
                <View style={styles.dropdown}>
                  <ScrollView>
                    {catBreeds.map((breed) => (
                      <TouchableOpacity
                        key={breed}
                        style={[
                          styles.dropdownItem,
                          newPet.breed === breed && styles.selectedDropdownItem
                        ]}
                        onPress={() => {
                          if (breed === "Other") {
                            setIsOtherBreed(true);
                            setNewPet({...newPet, breed: ""});
                          } else {
                            setIsOtherBreed(false);
                            setNewPet({...newPet, breed: breed});
                          }
                          setShowBreedDropdown(false);
                        }}
                      >
                        {newPet.breed === breed && (
                          <Ionicons name="checkmark" size={20} color="#7C7B73" style={styles.checkIcon} />
                        )}
                        <Text style={styles.dropdownItemText}>{breed}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            
            {isOtherBreed && (
              <TextInput
                style={styles.modalInput}
                placeholder="Enter breed"
                value={newPet.breed}
                onChangeText={(text) => setNewPet({...newPet, breed: text})}
                maxLength={50}
              />
            )}
            
            <Text style={styles.modalLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Weight in kg"
              value={newPet.weight}
              onChangeText={(text) => setNewPet({...newPet, weight: text})}
              keyboardType="decimal-pad"
              maxLength={5}
            />
            
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.saveButton,
                  (!newPet.name || !newPet.breed || !newPet.weight || saveLoading) && styles.saveButtonDisabled
                ]}
                onPress={handleSaveNewPet}
                disabled={!newPet.name || !newPet.breed || !newPet.weight || saveLoading}
              >
                {saveLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Recognition Popup */}
      <Modal
        transparent
        visible={showRecognitionPopup}
        animationType="fade"
        onRequestClose={() => setShowRecognitionPopup(false)}
      >
        <View style={styles.popupContainer}>
          <View style={styles.popupContent}>
            <Text style={styles.popupTitle}>Multiple Cats Detected</Text>
            <Text style={styles.popupText}>
              Would you like to start cat recognition training to help your feeder distinguish between your cats?
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity style={styles.popupButton} onPress={() => setShowRecognitionPopup(false)}>
                <Text style={styles.popupButtonText}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.popupButton, styles.popupButtonPrimary]}
                onPress={handleStartRecognition}
              >
                <Text style={styles.popupButtonTextPrimary}>Start Recognition</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('SmartPetFeederScreen')}>
          <Ionicons name="home-outline" size={24} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ScheduleScreen', { catId: currentPet ? currentPet.id : null })}>
          <Ionicons name="calendar-outline" size={24} color="#aaa"/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('FeedingHistoryScreen')}>
          <Ionicons name="menu-outline" size={24} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.activeTab]} onPress={() => navigation.navigate('PetProfileScreen')}>
          <Ionicons name="settings-outline" size={24} color="#FF3705" />
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
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingTop: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#777',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FF3705',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#777',
    marginBottom: 24,
    textAlign: 'center',
  },
  addFirstButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FF3705',
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  petCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  petImageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  petImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  petImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-end'

  },
  editButtonText: {
    color: '#FF3705',
    fontSize: 16,
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 16,
  },
  petSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  petSwitchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  activePetSwitchDot: {
    backgroundColor: '#FF3705',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#777',
  },
  detailValue: {
    fontSize: 16,
    color: '#444',
  },
  addAnotherButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  addAnotherButtonText: {
    color: '#FF3705',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  pickerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  modalLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FF3705',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  saveButtonDisabled: {
    backgroundColor: '#ffaa99',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FF3705',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  popupContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 340,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  popupText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  popupButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  popupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  popupButtonPrimary: {
    backgroundColor: '#FF3705',
    borderRadius: 6,
  },
  popupButtonText: {
    color: '#666',
    fontSize: 16,
  },
  popupButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 20,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3705',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FF3705',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownPlaceholderText: {
    fontSize: 16,
    color: '#999',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDropdownItem: {
    backgroundColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  checkIcon: {
    marginRight: 8,
  },
});

export default PetProfileScreen;