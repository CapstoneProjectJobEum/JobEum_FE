import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import JobCard from '../shared/JobCard';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function SearchOutput() {
  const navigation = useNavigation();
  const route = useRoute();
  const { keyword } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [userType, setUserType] = useState(null);

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
    if (!rawDate || rawDate.length !== 8) return rawDate;
    const year = rawDate.slice(0, 4);
    const month = rawDate.slice(4, 6);
    const day = rawDate.slice(6, 8);
    return `${year}-${month}-${day}`;
  };

  const fetchJobs = async () => {
    if (!keyword || keyword.trim().length < 2) {
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = `${BASE_URL}/api/search?q=${encodeURIComponent(keyword)}`;
      const res = await axios.get(url);

      const jobsWithFormattedDate = res.data.map(job => ({
        ...job,
        deadline: formatDate(job.deadline),
      }));

      setJobs(jobsWithFormattedDate);
    } catch (err) {
      console.error('검색 결과 로딩 실패:', err.message, err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchJobs(); }, [keyword]));
  useEffect(() => { fetchJobs(); }, [keyword]);

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
      <View style={styles.resultWrapper}>
        <Text style={styles.resultText}>
          {`"${keyword}"에 대한 검색 결과입니다.`}
        </Text>
      </View>

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
        contentContainerStyle={{ paddingBottom: hp('2%') }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: wp('5%'), paddingTop: hp('2%') },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultWrapper: { justifyContent: 'center', alignItems: 'center', marginBottom: hp('1.5%'), height: hp('3%') },
  resultText: { fontSize: wp('4.2%'), fontWeight: '600', color: '#333', textAlign: 'center' },
  emptyText: { fontSize: wp('4%'), color: 'gray', marginTop: hp('3%'), textAlign: 'center' },
});
