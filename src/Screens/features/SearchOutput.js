import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import JobCard from '../shared/JobCard';

export default function SearchOutput() {
  const navigation = useNavigation();
  const route = useRoute();
  const { keyword } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [favorites, setFavorites] = useState({ job: {}, company: {} });

  const [userType, setUserType] = useState(null);
  const [myUserId, setMyUserId] = useState(null);

  const [resultCount, setResultCount] = useState(0);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userInfo');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUserType(parsed.userType);
          setMyUserId(parsed.id);
        }
      } catch (e) {
        console.error('유저정보 불러오기 실패:', e);
      }
    };
    fetchUserInfo();
  }, []);



  useEffect(() => {
    const fetchFavorites = async () => {
      if (!myUserId) return;

      const token = await AsyncStorage.getItem('accessToken');
      const favs = { job: {}, company: {} };

      try {
        const jobRes = await axios.get(
          `${BASE_URL}/api/user-activity/${myUserId}/bookmark_job`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        jobRes.data.forEach(item => (favs.job[item.target_id] = true));

        const companyRes = await axios.get(
          `${BASE_URL}/api/user-activity/${myUserId}/bookmark_company`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        companyRes.data.forEach(item => (favs.company[item.target_id] = true));

        setFavorites(favs);
        await AsyncStorage.setItem('favorites', JSON.stringify(favs));
      } catch (err) {
        console.error('[fetchFavorites] 북마크 불러오기 실패', err);
      }
    };
    fetchFavorites();
  }, [myUserId]);

  // 북마크 토글
  const toggleFavorite = async (id, type = 'job') => {
    if (!myUserId) return;

    const updatedFavs = {
      ...favorites,
      [type]: { ...favorites[type], [id]: !favorites[type][id] },
    };
    setFavorites(updatedFavs);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavs));

    const token = await AsyncStorage.getItem('accessToken');
    const activityType = type === 'job' ? 'bookmark_job' : 'bookmark_company';
    const isActive = updatedFavs[type][id];

    try {
      if (isActive) {
        await axios.post(
          `${BASE_URL}/api/user-activity`,
          { user_id: myUserId, activity_type: activityType, target_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const { data } = await axios.get(
          `${BASE_URL}/api/user-activity/${myUserId}/${activityType}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const target = data.find((item) => item.target_id === id);
        if (target) {
          await axios.put(
            `${BASE_URL}/api/user-activity/${target.id}/deactivate`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
    } catch (err) {
      console.error('[toggleFavorite] 북마크 토글 실패', err);
    }
  };


  const formatDate = (rawDate) => {
    if (!rawDate || rawDate.length !== 8) return rawDate;
    const year = rawDate.slice(0, 4);
    const month = rawDate.slice(4, 6);
    const day = rawDate.slice(6, 8);
    return `${year}-${month}-${day}`;
  };

  const handlePress = async (job) => {
    navigation.navigate('JobDetailScreen', { job });

    if (!myUserId) return;

    try {
      const token = await AsyncStorage.getItem('accessToken');
      await axios.post(
        `${BASE_URL}/api/user-activity`,
        {
          user_id: myUserId,
          activity_type: 'recent_view_job',
          target_id: job.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('[handlePress] 최근 본 공고 기록 실패', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!keyword || keyword.trim().length < 2) {
          setJobs([]);
          setResultCount(0);
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('accessToken');

          // 검색 결과 + 북마크 동시 요청
          const [searchRes, bookmarkRes] = await Promise.all([
            axios.get(`${BASE_URL}/api/search?q=${encodeURIComponent(keyword)}`),
            myUserId
              ? axios.get(`${BASE_URL}/api/user-activity/${myUserId}/bookmark_job`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              : Promise.resolve({ data: [] }),
          ]);

          // 북마크 정리
          const favs = { job: {}, company: {} };
          bookmarkRes.data.forEach(item => {
            favs.job[item.target_id] = true;
          });
          setFavorites(favs);

          // 검색 결과 + 날짜 포맷
          const jobsWithFormattedDate = searchRes.data.map(job => ({
            ...job,
            deadline: formatDate(job.deadline),
          }));

          setJobs(jobsWithFormattedDate);
          setResultCount(jobsWithFormattedDate.length);
        } catch (err) {
          console.error('검색 결과 로딩 실패:', err.message, err);
          setJobs([]);
          setResultCount(0);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [keyword, myUserId])
  );



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
          {`검색 결과: ${resultCount}건`}
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
            isFavorite={favorites.job?.[item.id]}
            onToggleFavorite={() => toggleFavorite(item.id, 'job')}
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%')
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  resultWrapper: {
    alignItems: 'flex-start',
    marginBottom: hp('1.5%'),
  },
  resultText: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: wp('4%'),
    color: 'gray',
    marginTop: hp('2%'),
    textAlign: 'center'
  },
});
