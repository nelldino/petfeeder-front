import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  ScrollView
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { RefreshCcw, Search } from "lucide-react-native";
import { useCat } from '../../contexts/CatContext';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = Platform.select({
  android: 'http://192.168.100.16:3333',
  ios: 'http://localhost:3333',
  default: 'http://localhost:3333'
});

const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const FeedingHistoryScreen = ({ navigation }) => {
  const { userToken } = useCat();
  const [feedingData, setFeedingData] = useState([]);
  const [cats, setCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");


  const fetchFeedingHistory = async () => {
    if (!selectedCatId) return;
    
    setLoading(true);
    setRefreshing(true);
    
    try {
      const response = await axios.get(
        `${API_URL}/pet-feeder/cats/${selectedCatId}/feeding-history`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Group feedings by date
      const groupedFeedings = response.data.history.reduce((acc, feeding) => {
        const date = new Date(feeding.timestamp).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            id: date,
            date: feeding.timestamp,
            feedings: []
          };
        }
        acc[date].feedings.push({
          time: new Date(feeding.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          amount: feeding.amount.toString()
        });
        return acc;
      }, {});

      setFeedingData(Object.values(groupedFeedings));
    } catch (error) {
      console.error("Failed to fetch feeding history", error);
      Alert.alert('Error', 'Failed to load feeding history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCats = async () => {
    try {
      const response = await axios.get(`${API_URL}/cats`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      setCats(response.data);
      if (!selectedCatId && response.data.length > 0) {
        setSelectedCatId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching cats:', error);
      Alert.alert('Error', 'Failed to load cats');
    }
  };

  useEffect(() => {
    fetchFeedingHistory();
    fetchCats();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedCatId) {
        fetchFeedingHistory();
      }
    }, [selectedCatId])
  );

  const filteredData = feedingData.filter(entry => {
    if (!search) return true;
    
    const formattedDate = formatDate(entry.date).toLowerCase();
    const searchQuery = search.toLowerCase();
    
    return (
      formattedDate.includes(searchQuery) || 
      entry.date.includes(searchQuery) ||    
      formattedDate.split(',')[0].toLowerCase().includes(searchQuery) || 
      formattedDate.split(' ')[1].toLowerCase().includes(searchQuery) || 
      formattedDate.split(' ')[2].toLowerCase().includes(searchQuery)   
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Feeding History</Text>
        
        {/* Cat Selector */}
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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#A0A0A0" size={20} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by date"
            placeholderTextColor="#A0A0A0"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Header with Refresh */}
        <View style={styles.headerRow}>
          <Text style={styles.subtitle}>Last feeding times</Text>
          <TouchableOpacity 
            onPress={fetchFeedingHistory}
            style={styles.refreshButton}
          >
            <RefreshCcw color="#FF3705" size={20} />
          </TouchableOpacity>
        </View>

        {/* Feeding List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3705" />
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
                {item.feedings.map((feeding, idx) => (
                  <View key={idx} style={styles.feedingRow}>
                    <Text style={styles.feedingTime}>{feeding.time}</Text>
                    <Text style={styles.feedingAmount}>{feeding.amount} g</Text>
                  </View>
                ))}
              </View>
            )}
            refreshing={refreshing}
            onRefresh={fetchFeedingHistory}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No feeding records found</Text>
                {search && (
                  <Text style={styles.emptySubtext}>for "{search}"</Text>
                )}
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('SmartPetFeederScreen')}>
          <Ionicons name="home-outline" size={24} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ScheduleScreen')}>
          <Ionicons name="calendar-outline" size={24} color="#aaa"/>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.activeTab]} onPress={() => navigation.navigate('FeedingHistoryScreen')}>
          <Ionicons name="menu-outline" size={24} color="#FF3705" />
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
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    marginTop:50,
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
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dropdownScroll: {
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,

    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  refreshButton: {
    padding: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  date: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  feedingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  feedingTime: {
    fontSize: 15,
    color: "#555",
  },
  feedingAmount: {
    fontSize: 15,
    fontWeight: "500",
    color: "#FF3705",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
  },
  emptySubtext: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginTop: 5,
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: 20,
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

export default FeedingHistoryScreen;