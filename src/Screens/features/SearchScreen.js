import React, { useState, useEffect } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Keyboard, ScrollView, Alert, Platform, } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function SearchingPage() {
    const navigation = useNavigation();
    const [recentSearches, setRecentSearches] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [myUserId, setMyUserId] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const getUserId = async () => {
            const userInfoString = await AsyncStorage.getItem('userInfo');
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                setMyUserId(userInfo.id);
                setRole(userInfo.role);
            }
        };
        getUserId();
    }, []);

    useEffect(() => {
        if (myUserId) {
            loadRecentSearches();
        }
    }, [myUserId]);

    const loadRecentSearches = async () => {
        if (!myUserId) return;
        try {
            const saved = await AsyncStorage.getItem(`recent_searches_${myUserId}`);
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            }
        } catch (e) {
            console.error('[AsyncStorage] 불러오기 실패:', e);
        }
    };

    // 2) AsyncStorage에 최근 검색어 저장
    const saveRecentSearches = async (searches) => {
        if (!myUserId) return;
        try {
            await AsyncStorage.setItem(`recent_searches_${myUserId}`, JSON.stringify(searches));
        } catch (e) {
            console.error('[AsyncStorage] 저장 실패:', e);
        }
    };

    // 3) 검색어 추가
    const addSearchTerm = (term) => {
        if (!term.trim() || !myUserId) return;

        Keyboard.dismiss();

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

        if (searchTerm.trim().length < 2) {
            Alert.alert('알림', '검색어는 2글자 이상 입력하세요.');
            return;
        }

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
        if (!myUserId) return;

        setRecentSearches(prev => {
            const updated = prev.filter(item => item !== term);
            saveRecentSearches(updated);
            return updated;
        });
    };

    const handleClearAllRecent = () => {
        if (!myUserId || recentSearches.length === 0) return;

        Alert.alert(
            "최근 검색어 삭제",
            "모든 최근 검색어를 삭제하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(`recent_searches_${myUserId}`);
                            setRecentSearches([]);
                        } catch (e) {
                            console.error("[AsyncStorage] 전체 삭제 실패:", e);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['left', 'right']}
        >
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                extraScrollHeight={5}
            >
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
                        <View style={styles.searchHeader}>
                            <Text style={styles.searchTitle}>최근 검색</Text>
                            {recentSearches.length > 0 && (
                                <TouchableOpacity onPress={handleClearAllRecent} activeOpacity={0.7}>
                                    <Text style={styles.clearAllText}>검색 기록 지우기</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.tagContainer}>
                            {recentSearches.length === 0 ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={styles.emptyText}>최근 검색어가 없습니다.</Text>
                                </View>
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
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

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
        height: Platform.OS === 'android' ? hp('6%') : hp('5%'),
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
    searchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp("1%"),
    },
    clearAllText: {
        fontSize: wp("3.5%"),
        color: '#808080',
        fontWeight: '700',
        marginBottom: hp('1.5%'),
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
        marginRight: wp('1.5%'),
        marginBottom: hp('1.5%'),
    },
    recentSearch: {
        fontSize: wp('3.4%'),
        marginRight: wp('2%'),
    },
    emptyText: {
        fontSize: wp("3.5%"),
        color: '#808080',
        fontWeight: '700',
    }
});
