import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import JobCard from '../shared/JobCard';

export default function SearchOutput({ keyword }) {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [userType, setUserType] = useState(null);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userInfo');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUserType(parsed.userType);
        }
      } catch (e) {
        console.error('유저정보 불러오기 실패:', e);
      }
    })();
  }, []);

  const formatDate = (rawDate) => {
    if (!rawDate) return rawDate;
    if (rawDate.length === 8) {
      const year = rawDate.slice(0, 4);
      const month = rawDate.slice(4, 6);
      const day = rawDate.slice(6, 8);
      return `${year}-${month}-${day}`;
    }
    return rawDate;
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const url = keyword ? `${BASE_URL}/api/jobs?search=${encodeURIComponent(keyword)}` : `${BASE_URL}/api/jobs`;
      const res = await axios.get(url);
      const jobsWithFormattedDate = res.data.map(job => ({
        ...job,
        deadline: formatDate(job.deadline),
      }));
      setJobs(jobsWithFormattedDate);
    } catch (err) {
      console.error('채용공고 로딩 실패:', err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchJobs(); }, [keyword]));
  useEffect(() => { fetchJobs(); }, [keyword]);

  const handlePress = (job) => {
    navigation.navigate('JobDetailScreen', { job });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.keyword}>“{keyword}”에 대한 결과입니다.</Text>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={handlePress}
            type="default"
            isFavorite={favorites[item.id]}
            onToggleFavorite={toggleFavorite}
            userType={userType}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>관련된 게시물이 없습니다.</Text>
        }
        contentContainerStyle={{ paddingBottom: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  keyword: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 10,
    marginVertical: 20,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 20,
    textAlign: 'center',
  },
});
