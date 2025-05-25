import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: screenHeight } = Dimensions.get('window');

const catBreeds = [
  "Just a cute cat",
  "Siamese",
  "British Shorthair",
  "Scottish Fold",
  "Sphynx",
  "Persian",
  "Other"
];

const API_URL = Platform.select({
  android: 'http://10.0.2.2:3333/cats',
  ios: 'http://localhost:3333/cats',
  default: 'http://localhost:3333/cats'
});

const AddCatScreen = ({ navigation }) => {
  const [catName, setCatName] = useState('');
  const [weight, setWeight] = useState('');
  const [breed, setBreed] = useState('');
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [otherBreed, setOtherBreed] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    };
    loadToken();
  }, []);

  const handleBreedSelect = (selectedBreed) => {
    if (selectedBreed === "Other") {
      setBreed("Other");
      setIsOtherSelected(true);
    } else {
      setBreed(selectedBreed);
      setIsOtherSelected(false);
    }
    setShowBreedDropdown(false);
  };

  const handleOutsidePress = () => {
    if (showBreedDropdown) {
      setShowBreedDropdown(false);
    }
  };

  const handleSave = async () => {
    if (!catName || !weight || (!breed && !otherBreed)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!userToken) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    setIsLoading(true);
    
    try {
      const finalBreed = isOtherSelected ? otherBreed : breed;
      const catData = {
        name: catName,
        weight: parseFloat(weight),
        breed: finalBreed
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(catData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save cat');
      }

      navigation.navigate('UploadPicScreen', { catId: data.id });
      
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(
        'Error', 
        error.message || 'Could not save cat. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderBreedItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        breed === item && styles.selectedDropdownItem
      ]}
      onPress={() => handleBreedSelect(item)}
      activeOpacity={0.6}
    >
      {breed === item && (
        <Ionicons name="checkmark" size={20} color="#7C7B73" style={styles.checkIcon} />
      )}
      <Text style={styles.dropdownItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Add your cat</Text>
              <Text style={styles.subtitle}>
                Enter your cat's details below
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#7C7B73"
                  value={catName}
                  onChangeText={setCatName}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.weightInput}
                  placeholder="Weight"
                  placeholderTextColor="#7C7B73"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
                <Text style={styles.weightUnit}>kg</Text>
              </View>
              
              <View style={styles.dropdownContainer} ref={dropdownRef}>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowBreedDropdown(!showBreedDropdown)}
                  activeOpacity={0.8}
                >
                  <Text style={breed ? styles.dropdownSelectedText : styles.dropdownPlaceholderText}>
                    {breed || "Breed"}
                  </Text>
                  <Ionicons 
                    name={showBreedDropdown ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color="#7C7B73" 
                  />
                </TouchableOpacity>
                
                {showBreedDropdown && (
                  <FlatList
                    data={catBreeds}
                    renderItem={renderBreedItem}
                    keyExtractor={(item, index) => index.toString()}
                    style={[
                      styles.dropdown,
                      { maxHeight: screenHeight * 0.4 }
                    ]}
                  />
                )}
              </View>
              
              {isOtherSelected && (
                <TextInput
                  style={[styles.input]}
                  placeholder="Enter breed"
                  placeholderTextColor="#7C7B73"
                  value={otherBreed}
                  onChangeText={setOtherBreed}
                />
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  formContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3C3A3A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#3C3A3A',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#3C3A3A'
  },
  weightInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#3C3A3A'
  },
  weightUnit: {
    position: 'absolute',
    right: 16,
    fontSize: 16,
    color: '#7C7B73',
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 16,
    zIndex: 1000,
  },
  dropdownButton: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  dropdownPlaceholderText: {
    fontSize: 16,
    color: '#7C7B73',
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: '#3C3A3A',
  },
  dropdown: {
    width: '100%',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedDropdownItem: {
    backgroundColor: '#F5F5F5',
  },
  checkIcon: {
    marginRight: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#3C3A3A',
  },
  saveButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FF4500',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddCatScreen;