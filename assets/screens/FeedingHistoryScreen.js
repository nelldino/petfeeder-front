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
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { RefreshCcw, Search } from "lucide-react-native";

const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const FeedingHistoryScreen = ({ navigation }) => {
  const [feedingData, setFeedingData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  
  const mockData = [
    {
      id: '1',
      date: new Date('2023-05-20').toISOString(),
      feedings: [
        { time: '08:30 AM', amount: '150' },
        { time: '05:15 PM', amount: '150' }
      ]
    },
    {
      id: '2',
      date: new Date('2023-05-19').toISOString(),
      feedings: [
        { time: '08:45 AM', amount: '150' },
        { time: '05:30 PM', amount: '150' }
      ]
    },
    {
      id: '3',
      date: new Date('2023-05-18').toISOString(),
      feedings: [
        { time: '09:00 AM', amount: '150' },
        { time: '06:00 PM', amount: '150' }
      ]
    },
  ];

  const fetchFeedingHistory = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFeedingData(mockData);
    } catch (error) {
      console.error("Failed to fetch feeding history", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedingHistory();
  }, []);

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
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Feeding History</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#A0A0A0" size={20} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by date (e.g., May 20 or 2023-05-20)"
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
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
    marginBottom: 20,
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