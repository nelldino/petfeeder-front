import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CatProvider, useCat } from './contexts/CatContext';
import WelcomeScreen from './assets/screens/WelcomeScreen'
import SignUpScreen from './assets/screens/SignUpScreen';
import SignInScreen from './assets/screens/SignInScreen';
import AddCatScreen from './assets/screens/AddCatScreen';
import SmartPetFeederScreen from './assets/screens/SmartPetFeederScreen';
import UploadPicScreen from './assets/screens/UploadPicScreen';
import CatFeedingScheduleScreen from './assets/screens/CatFeedingScheduleScreen';
import ScheduleScreen from './assets/screens/ScheduleScreen';
import FeedingHistoryScreen from './assets/screens/FeedingHistoryScreen';
import PetProfileScreen from './assets/screens/PetProfileScreen';
import CatRecognitionScreen from './assets/screens/CatRecognitionScreen';
import ModelTrainingScreen from './assets/screens/ModelTrainingScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { setUserToken } = useCat();

  useEffect(() => {
    const loadStoredToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setUserToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading stored token:', error);
      }
    };

    loadStoredToken();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen}/>
        <Stack.Screen name="SignInScreen" component={SignInScreen}/>
        <Stack.Screen name="AddCatScreen" component={AddCatScreen}/>
        <Stack.Screen name="SmartPetFeederScreen" component={SmartPetFeederScreen}/>
        <Stack.Screen name="UploadPicScreen" component={UploadPicScreen}/>
        <Stack.Screen name="CatFeedingScheduleScreen" component={CatFeedingScheduleScreen}/>
        <Stack.Screen name="ScheduleScreen" component={ScheduleScreen}/>
        <Stack.Screen name="FeedingHistoryScreen" component={FeedingHistoryScreen}/>
        <Stack.Screen name="PetProfileScreen" component={PetProfileScreen}/>
        <Stack.Screen 
          name="CatRecognitionScreen" 
          component={CatRecognitionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ModelTrainingScreen" 
          component={ModelTrainingScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <CatProvider>
      <AppNavigator />
    </CatProvider>
  );
}

export default App;