import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    TextInput,
    Keyboard,
    ScrollView,
    Alert
} from "react-native";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const STORAGE_KEY = 'recent_searches';

export default function SearchingPage({ navigation }) {
    const [recentSearches, setRecentSearches] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // 1) 컴포넌트 마운트 시 AsyncStorage에서 최근 검색어 불러오기
    useEffect(() => {
        const loadRecentSearches = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    setRecentSearches(JSON.parse(saved));
                }
            } catch (e) {
                console.error('[AsyncStorage] 불러오기 실패:', e);
            }
        };
        loadRecentSearches();
    }, []);

    // 2) AsyncStorage에 최근 검색어 저장
    const saveRecentSearches = async (searches) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
        } catch (e) {
            console.error('[AsyncStorage] 저장 실패:', e);
        }
    };

    // 3) 검색어 추가
    const addSearchTerm = (term) => {
        if (!term.trim()) return;
        if (term.trim().length < 2) {
            Alert.alert('알림', '검색어는 2글자 이상 입력하세요.');
            return;
        }

        Keyboard.dismiss();

        // 중복 없이 추가 (앞에 추가)
        setRecentSearches(prev => {
            const filtered = prev.filter(item => item !== term);
            const updated = [term, ...filtered];
            saveRecentSearches(updated);
            return updated;
        });
    };

    // 4) 검색 실행
    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        addSearchTerm(searchTerm);
        navigation.navigate("SearchOutput", { keyword: searchTerm });
        setSearchTerm("");
    };

    // 5) 태그 클릭 시
    const handleTagPress = (term) => {
        if (!term.trim()) return;
        if (term.trim().length < 2) {
            Alert.alert('알림', '검색어는 2글자 이상 입력하세요.');
            return;
        }
        addSearchTerm(term);
        navigation.navigate("SearchOutput", { keyword: term });
        setSearchTerm("");
    };

    // 6) 검색어 삭제
    const removeSearch = (term) => {
        setRecentSearches(prev => {
            const updated = prev.filter(item => item !== term);
            saveRecentSearches(updated);
            return updated;
        });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.searchWrapper}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="검색어를 입력하세요."
                    placeholderTextColor="gray"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity onPress={handleSearch} hitSlop={10}>
                    <Feather name="search" size={20} color={"#000"} />
                </TouchableOpacity>
            </View>

            <View style={styles.viewContainer}>
                <Text style={styles.searchTitle}>최근 검색</Text>
                <View style={styles.tagContainer}>
                    {recentSearches.length === 0 ? (
                        <Text style={styles.emptyText}>최근 검색어가 없습니다.</Text>
                    ) : (
                        recentSearches.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => handleTagPress(item)}
                                style={styles.recentTag}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.recentSearch}>{item}</Text>
                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        removeSearch(item);
                                    }}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close" size={16} color="#999" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

// styles는 기존 코드 유지
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
        backgroundColor: '#FFF',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#000',
        borderWidth: 2,
        borderRadius: wp('2%'),
        paddingHorizontal: wp('4%'),
        height: hp('5%'),
        marginBottom: hp('2%'),
        backgroundColor: '#fff',
    },
    searchInput: {
        flex: 1,
        fontSize: wp('3.8%'),
        color: '#000',
        fontWeight: '500',
        marginRight: wp('2%'),
    },
    viewContainer: {
        paddingHorizontal: wp('1%'),
        paddingTop: hp('2.5%'),
    },
    searchTitle: {
        fontSize: wp('4.5%'),
        fontWeight: "800",
        marginBottom: hp('1.5%'),
    },
    tagContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: hp('2%'),
    },
    recentTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderColor: "#d3d3d3",
        borderWidth: 1,
        borderRadius: wp('10%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1%'),
        marginRight: wp('2.5%'),
        marginBottom: hp('1.5%'),
    },
    recentSearch: {
        fontSize: wp('3.4%'),
        marginRight: wp('2%'),
    },
    emptyText: {
        fontSize: wp('3.5%'),
        color: '#999',
        paddingVertical: hp('1%'),
    },
});
