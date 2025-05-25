import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:3333',
  ios: 'http://localhost:3333',
  default: 'http://localhost:3333',
});

const UploadPicScreen = ({ route, navigation }) => {
  const { catId } = route.params;
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    };
    loadToken();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          granted['android.permission.CAMERA'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.READ_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert(
            'Permissions required', 
            'Camera and storage permissions are needed to select and upload images.'
          );
        }
      } catch (err) {
        console.warn('Permission error:', err);
        Alert.alert('Error', 'Failed to get required permissions');
      }
    } else {
      try {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
          Alert.alert(
            'Permissions required', 
            'Please enable camera and photo library access in settings'
          );
        }
      } catch (err) {
        console.warn('Permission error:', err);
      }
    }
  };

  const pickImage = async (useCamera = false) => {
    try {
      setIsLoading(true);
      setImageError(false);
      
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      const result = await (useCamera 
        ? ImagePicker.launchCameraAsync(options)
        : ImagePicker.launchImageLibraryAsync(options));

      console.log('ImagePicker result:', result);

      if (!result.canceled && result.assets?.length > 0) {
        let uri = result.assets[0].uri;
        
        if (Platform.OS === 'android') {
          if (uri.startsWith('content://')) {
       
          } 
    
          else if (uri.startsWith('file://')) {
       
            uri = uri.replace(/(file:\/\/)\/+/, '$1/');
          }
         
          else {
            uri = `file://${uri}`;
          }
        }

        console.log('Processed image URI:', uri);
        setSelectedImage(uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Could not select image. Please try again.');
      setImageError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (error) => {
    console.log('Image load error:', {
      uri: selectedImage,
      error: error.nativeEvent.error,
      platform: Platform.OS
    });
    setImageError(true);
  };

  const renderImagePreview = () => {
    if (imageError || !selectedImage) {
      return (
        <View style={styles.placeholderContainer}>
          <Ionicons name="image-outline" size={48} color="#ccc" />
          <Text style={styles.imagePickerText}>
            {imageError ? 'Failed to load image' : 'Tap to select an image'}
          </Text>
        </View>
      );
    }
  };

  const handleSkip = () => {
    navigation.navigate('CatFeedingScheduleScreen');
  };
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Add a picture</Text>
        <Text style={styles.subtitle}>Choose a photo for your cat's profile</Text>

        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={() => pickImage(false)}
          disabled={isLoading || uploadLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#FF4500" />
          ) : (
            renderImagePreview()
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => pickImage(true)}
          disabled={isLoading || uploadLoading}
        >
          <Text style={styles.cameraButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={uploadLoading}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, (!selectedImage || uploadLoading) && { opacity: 0.6 }]}
            onPress={uploadImage}
            disabled={!selectedImage || uploadLoading}
          >
            {uploadLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3C3A3A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#3C3A3A',
    marginBottom: 24,
    textAlign: 'center',
  },
  imagePickerButton: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 20,
  },
  imagePickerText: {
    color: '#7C7B73',
    marginTop: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: '#f5f5f5',
  },
  cameraButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignSelf: 'center',
  },
  cameraButtonText: {
    color: '#3C3A3A',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  skipButton: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '45%',
  },
  skipButtonText: {
    color: '#FF4500',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF4500',
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '45%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UploadPicScreen;
