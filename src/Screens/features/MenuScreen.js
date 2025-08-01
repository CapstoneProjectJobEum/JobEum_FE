import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function MenuScreen() {
    const navigation = useNavigation();

    const [userType, setUserType] = useState(''); // 저장된 타입
    const [snsProvider, setSnsProvider] = useState('');

    useEffect(() => {
        const loadUserInfo = async () => {
            const stored = await AsyncStorage.getItem("userInfo");
            const parsed = stored ? JSON.parse(stored) : {};
            setUserType(parsed.userType || '개인회원');  // 기본값: 개인회원
            setSnsProvider(parsed.snsProvider || '');
        };
        loadUserInfo();
    }, []);

    const isMember = userType === '개인회원';
    const isCompany = userType === '기업회원';

    return (
        <ScrollView style={styles.container}>
            {/* 채용공고 */}
            <Text style={styles.sectionTitle}>채용공고</Text>
            <View style={styles.gridContainer}>
                {isMember && (
                    <>
                        <TouchableOpacity style={styles.gridItem}><Text>홈</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.gridItem}><Text>AI추천</Text></TouchableOpacity>
                    </>
                )}
                <TouchableOpacity style={styles.gridItem}><Text>직무별</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}><Text>지역별</Text></TouchableOpacity>


            </View>

            {/* MY */}
            <Text style={styles.sectionTitle}>MY</Text>
            <View style={styles.gridContainer}>
                {isMember && (
                    <>
                        <TouchableOpacity onPress={() =>
                            navigation.navigate('RouteScreen', {
                                screen: 'MainTab',
                                params: {
                                    screen: 'MY',
                                    params: {
                                        screen: 'MemberMyScreen',
                                        params: { selectedTab: '최근 본 공고' },
                                    },
                                },
                            })
                        } style={styles.gridItem}><Text>최근 본 공고</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() =>
                            navigation.navigate('RouteScreen', {
                                screen: 'MainTab',
                                params: {
                                    screen: 'MY',
                                    params: {
                                        screen: 'MemberMyScreen',
                                        params: { selectedTab: '지원 현황' },
                                    },
                                },
                            })
                        } style={styles.gridItem}><Text>지원 현황</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() =>
                            navigation.navigate('RouteScreen', {
                                screen: 'MainTab',
                                params: {
                                    screen: 'MY',
                                    params: {
                                        screen: 'MemberMyScreen',
                                        params: { selectedTab: '관심 공고' },
                                    },
                                },
                            })
                        } style={styles.gridItem}><Text>관심 공고</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() =>
                            navigation.navigate('RouteScreen', {
                                screen: 'MainTab',
                                params: {
                                    screen: 'MY',
                                    params: {
                                        screen: 'MemberMyScreen',
                                        params: { selectedTab: '관심 기업' },
                                    },
                                },
                            })
                        } style={styles.gridItem}><Text>관심 기업</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() =>
                            navigation.navigate('RouteScreen', {
                                screen: 'MainTab',
                                params: {
                                    screen: 'MY',
                                    params: {
                                        screen: 'MemberMyScreen',
                                        params: { selectedTab: '이력서 관리' },
                                    },
                                },
                            })
                        } style={styles.gridItem}><Text>이력서 관리</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() =>
                            navigation.navigate('RouteScreen', {
                                screen: 'MainTab',
                                params: {
                                    screen: 'MY',
                                    params: {
                                        screen: 'MemberMyScreen',
                                        params: { selectedTab: '맞춤정보설정' },
                                    },
                                },
                            })
                        } style={styles.gridItem}><Text>맞춤정보설정</Text>
                        </TouchableOpacity>
                    </>
                )}
                {isCompany && (
                    <>
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('RouteScreen', {
                                    screen: 'MainTab',
                                    params: {
                                        screen: 'MY',
                                        params: {
                                            screen: 'CompanyMyScreen',
                                            params: { selectedTab: '채용공고 관리' },
                                        },
                                    },
                                })
                            } style={styles.gridItem}><Text>채용공고 관리</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('RouteScreen', {
                                    screen: 'MainTab',
                                    params: {
                                        screen: 'MY',
                                        params: {
                                            screen: 'CompanyMyScreen',
                                            params: { selectedTab: '지원자 현황' },
                                        },
                                    },
                                })
                            } style={styles.gridItem}><Text>지원자 현황</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() =>
                            navigation.navigate('RouteScreen', {
                                screen: 'MainTab',
                                params: {
                                    screen: 'MY',
                                    params: {
                                        screen: 'CompanyMyScreen',
                                        params: { selectedTab: '기업 정보 수정' },
                                    },
                                },
                            })
                        } style={styles.gridItem}><Text>기업 정보 수정</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* 설정 */}
            <Text style={styles.sectionTitle}>설정</Text>
            <View style={styles.gridContainer}>
                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => {
                        if (userType === '기업회원') {
                            navigation.navigate('AccountInfoCompany');
                        } else {
                            navigation.navigate('AccountInfoUser');
                        }
                    }}
                >
                    <Text>계정 정보</Text>
                </TouchableOpacity>
                {!snsProvider && (
                    <TouchableOpacity onPress={() => navigation.navigate('FindPasswordScreen')} style={styles.gridItem}><Text>비밀번호 변경</Text></TouchableOpacity>
                )}
                <TouchableOpacity style={styles.gridItem}><Text>알림 설정</Text></TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('LogoutScreen')} style={styles.gridItem}>
                    <Text>로그아웃</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('WithdrawScreen')} style={styles.gridItem}><Text>탈퇴하기</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('CustomerServiceScreen')} style={styles.gridItem}><Text>고객센터</Text></TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingHorizontal: wp(4),
    },
    sectionTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginTop: hp(3),
        marginBottom: hp(1.5),
        color: '#333',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        backgroundColor: '#fff',
        paddingVertical: hp(2),
        marginBottom: hp(1.5),
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: hp(0.25) },
        shadowRadius: wp(1),
        elevation: 2,
    },
});
