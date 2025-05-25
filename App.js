// First, make sure your navigation setup is correct in App.js or your navigation file
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

const Stack = createStackNavigator();

function App() {
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
      </Stack.Navigator>
    </NavigationContainer>

  );
}

export default App;