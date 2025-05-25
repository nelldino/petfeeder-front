import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useCat } from './CatContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SwitchCatScreen = ({ navigation }) => {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectCat } = useCat();

  useEffect(() => {
    const fetchCats = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch('http://localhost:3333/cats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCats(data);
      setLoading(false);
    };
    fetchCats();
  }, []);

  const handleSelect = (cat) => {
    selectCat(cat);
    navigation.navigate('CatFeedingScheduleScreen');
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Switch Cat Profile</Text>
      <FlatList
        data={cats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)} style={{ flexDirection: 'row', marginBottom: 16, alignItems: 'center' }}>
            <Image source={{ uri: item.photo }} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 16 }} />
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SwitchCatScreen;
