import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SmartPetFeederScreen = ({ navigation, route }) => {

  const nextMealTime = "17:00";
  const nextMealPortion = "150 g";


  const handleFeedNow = () => {

    console.log("Feed button pressed!");
  };

  const navigateToSchedule = () => {
    console.log("Navigating to schedule screen");
  };


  const navigateToSettings = () => {
    console.log("Navigating to settings screen");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF5722" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tap the button to feed your kitty!</Text>
      </View>
      
      <View style={styles.feedButtonContainer}>
        <TouchableOpacity style={styles.feedButton} onPress={handleFeedNow}>
          <View style={styles.feedButtonInner}>
            {/* <svg width="101" height="55" viewBox="0 0 101 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M74.2835 4.77455C71.1936 3.34713 60.9709 3.82254 57.644 2.15979C54.3137 0.495453 49.3225 0.256959 44.8065 0.0202399C39.0704 -0.280788 34.1088 2.87192 31.4938 3.11041C28.8788 3.34713 23.8878 4.77454 21.5096 7.62622C19.37 9.05206 17.469 11.6686 17.469 11.6686H82.6036C82.6036 11.6686 77.3739 6.20038 74.2835 4.77455Z" fill="#FF3705"/>
<path d="M100.814 48.8618L92.8474 23.58C91.6534 19.7927 88.1423 17.2172 84.1707 17.2172H16.8277C12.8575 17.2172 9.34479 19.7927 8.15252 23.58L0.186331 48.8618C-0.200112 50.0903 0.0220089 51.429 0.783258 52.4684C1.5447 53.506 2.75513 54.1195 4.04288 54.1195H96.9573C98.245 54.1195 99.4555 53.506 100.217 52.4684C100.978 51.429 101.2 50.0903 100.814 48.8618Z" fill="#FF3705"/>
<path d="M47.1333 33.7933L49.6583 36.3183L50.4999 35.4767L52.1833 34.635L53.8666 33.7933L56.3916 34.635L58.0749 37.16V40.5267L52.1833 46.4184L49.6583 48.1017L47.1333 46.4184L43.7666 42.21L42.0833 38.8433L42.9249 36.3183L44.6083 33.7933H47.1333Z" fill="white"/>
<path d="M53.903 32.5729C52.5481 32.5729 51.2742 33.1481 50.2578 34.1887C49.2441 33.1374 47.985 32.5729 46.6057 32.5729C44.1974 32.5729 42.0699 34.3198 41.4322 36.821C41.098 38.1312 41.0282 40.2166 42.5918 42.7102C43.9885 44.9373 46.3873 46.9889 49.7216 48.8078C49.8875 48.8982 50.0703 48.9434 50.2535 48.9434C50.4363 48.9434 50.6195 48.8982 50.7851 48.8079C54.1205 46.989 56.5201 44.9375 57.9173 42.7104C59.4817 40.2168 59.412 38.1315 59.078 36.8213C58.44 34.3198 56.3121 32.5729 53.903 32.5729ZM50.2533 46.5613C42.9648 42.3965 43.2988 38.4883 43.5841 37.3697C43.9646 35.8771 45.2354 34.7938 46.6056 34.7938C47.6479 34.7938 48.6061 35.4281 49.3034 36.5798C49.5044 36.9121 49.8647 37.115 50.2532 37.1152C50.6415 37.1152 51.0019 36.9124 51.203 36.5803C51.9011 35.4282 52.8598 34.7938 53.9028 34.7938C55.2739 34.7938 56.5451 35.8771 56.9256 37.3697C57.2109 38.4882 57.5444 42.3962 50.2533 46.5613Z" fill="white"/>
<path d="M45.4634 30.669C47.8507 30.669 49.793 28.7269 49.793 26.3397C49.793 23.9523 47.8507 22.01 45.4634 22.01C43.0759 22.01 41.1335 23.9524 41.1335 26.3397C41.1335 28.7269 43.0759 30.669 45.4634 30.669ZM45.4634 24.2309C46.6263 24.2309 47.5721 25.177 47.5721 26.3397C47.5721 27.5023 46.6261 28.4481 45.4634 28.4481C44.3005 28.4481 43.3544 27.5023 43.3544 26.3397C43.3544 25.1769 44.3004 24.2309 45.4634 24.2309Z" fill="white"/>
<path d="M55.0459 30.669C57.4332 30.669 59.3754 28.7269 59.3754 26.3397C59.3754 23.9523 57.4332 22.01 55.0459 22.01C52.6586 22.01 50.7163 23.9524 50.7163 26.3397C50.7162 28.7269 52.6584 30.669 55.0459 30.669ZM55.0459 24.2309C56.2086 24.2309 57.1545 25.177 57.1545 26.3397C57.1545 27.5023 56.2086 28.4481 55.0459 28.4481C53.883 28.4481 52.9372 27.5023 52.9372 26.3397C52.9371 25.1769 53.883 24.2309 55.0459 24.2309Z" fill="white"/>
<path d="M37.6741 28.5747C35.4645 28.5747 33.6667 30.3726 33.6667 32.5825C33.6667 34.7922 35.4645 36.5898 37.6741 36.5898C39.8841 36.5898 41.6818 34.792 41.6818 32.5825C41.682 30.3726 39.8841 28.5747 37.6741 28.5747ZM37.6741 34.3689C36.6891 34.3689 35.8876 33.5676 35.8876 32.5825C35.8876 31.5973 36.6891 30.7957 37.6741 30.7957C38.6593 30.7957 39.4609 31.5973 39.4609 32.5825C39.4611 33.5676 38.6595 34.3689 37.6741 34.3689Z" fill="white"/>
<path d="M62.834 28.5747C60.6243 28.5747 58.8267 30.3726 58.8267 32.5824C58.8267 34.792 60.6244 36.5896 62.834 36.5896C65.044 36.5896 66.8417 34.7919 66.8417 32.5824C66.8417 30.3726 65.044 28.5747 62.834 28.5747ZM62.834 34.3689C61.849 34.3689 61.0476 33.5674 61.0476 32.5825C61.0476 31.5973 61.849 30.7957 62.834 30.7957C63.8192 30.7957 64.6208 31.5973 64.6208 32.5825C64.6208 33.5676 63.8192 34.3689 62.834 34.3689Z" fill="white"/>
<ellipse cx="45.4499" cy="26.2184" rx="3.36667" ry="2.525" fill="white"/>
<circle cx="37.8749" cy="32.9516" r="2.525" fill="white"/>
<circle cx="63.1251" cy="32.9516" r="2.525" fill="white"/>
<circle cx="54.7084" cy="26.2184" r="2.525" fill="white"/>
</svg> */}

          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.nextMealContainer}>
        <View style={styles.nextMealCard}>
          <Ionicons name="time-outline" size={35} color="#FF3705" />
          <View style={styles.nextMealInfo}>
            <Text style={styles.nextMealTitle}>Next meal</Text>
            <Text style={styles.nextMealTime}>{nextMealTime} - {nextMealPortion}</Text>
          </View>
        </View>
      </View>
      
<View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabItem, styles.activeTab]} onPress={() => navigation.navigate('SmartPetFeederScreen')}>
          <Ionicons name="home-outline" size={24} color="#FF3705" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ScheduleScreen')}>
          <Ionicons name="calendar-outline" size={24} color="#aaa" />
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
    paddingHorizontal: 16,
    marginBottom:20,
  },
  nextMealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
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
});

export default SmartPetFeederScreen;