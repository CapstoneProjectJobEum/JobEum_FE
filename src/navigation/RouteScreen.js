import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert, View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { BASE_URL } from '@env';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import HomeScreen from '../Screens/tabs/HomeScreen';
import RecommendScreen from '../Screens/tabs/RecommendScreen';
import JobListScreen from '../Screens/tabs/JobListScreen';
import ScrapScreen from '../Screens/tabs/ScrapScreen';
import MyScreenWrapper from '../Screens/tabs/MyScreenWrapper';
import SearchScreen from '../Screens/features/SearchScreen';
import NotificationScreen from '../Screens/features/NotificationScreen';
import MenuScreen from '../Screens/features/MenuScreen';
import SettingScreen from '../Screens/features/SettingScreen';

import IMAGES from '../assets/images';
import COLORS from '../constants/colors';
import SCREENS from '../Screens';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = ({ userType }) => {
    const navigation = useNavigation();

    return (
        <Tab.Navigator
            initialRouteName={SCREENS.HOME}
            screenOptions={({ route }) => ({
                headerStyle: {
                    height: hp('11.5%'),
                },
                tabBarActiveTintColor: COLORS.BLACK,
                tabBarInactiveTintColor: COLORS.GRAY_LIGHT,
                headerTitleAlign: 'left',
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: wp('5%'),
                    color: COLORS.BLACK,
                },
                headerRight: () => {
                    if (route.name === SCREENS.MY) {
                        return (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => navigation.navigate(SCREENS.SETTING)}>
                                    <Ionicons name="settings-outline" size={24} color="black" style={{ marginRight: wp('3%') }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate(SCREENS.MENU)} style={{ marginRight: 15 }}>
                                    <Ionicons name="menu-outline" size={28} color="black" />
                                </TouchableOpacity>
                            </View>
                        );
                    }
                    const isSearchScreen = route.name === SCREENS.RECOMMEND || route.name === SCREENS.JOBLIST;

                    return (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() =>
                                    isSearchScreen
                                        ? navigation.navigate(SCREENS.SEARCH)
                                        : navigation.navigate(SCREENS.NOTIFICATION)
                                }
                                style={{ marginRight: wp('3%') }}
                            >
                                {isSearchScreen ? (
                                    <Feather name="search" size={20} color="black" />
                                ) : (
                                    <FontAwesome5 name="bell" size={20} color="black" />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.MENU)} style={{ marginRight: 15 }}>
                                <Ionicons name="menu-outline" size={28} color="black" />
                            </TouchableOpacity>
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={userType === '기업회원' ? JobListScreen : HomeScreen}
                options={{
                    title: '홈',
                    tabBarIcon: ({ focused }) => <Image source={IMAGES.HOME} style={tabIconStyle(focused)} />,
                }}
            />
            {userType !== '기업회원' && (
                <>
                    <Tab.Screen
                        name={SCREENS.RECOMMEND}
                        component={RecommendScreen}
                        options={{
                            title: '추천',
                            tabBarIcon: ({ focused }) => <Image source={IMAGES.RECOMMEND} style={tabIconStyle(focused)} />,
                        }}
                    />
                    <Tab.Screen
                        name={SCREENS.JOBLIST}
                        component={JobListScreen}
                        options={{
                            title: '채용공고',
                            tabBarIcon: ({ focused }) => <Image source={IMAGES.JOBLIST} style={tabIconStyle(focused)} />,
                        }}
                    />
                    <Tab.Screen
                        name={SCREENS.SCRAP}
                        component={ScrapScreen}
                        options={{
                            title: '모아보기',
                            tabBarIcon: ({ focused }) => <Image source={IMAGES.SCRAP} style={tabIconStyle(focused)} />,
                        }}
                    />
                </>
            )}
            <Tab.Screen
                name={SCREENS.MY}
                options={{
                    title: 'MY',
                    tabBarIcon: ({ focused }) => <Image source={IMAGES.MY} style={tabIconStyle(focused)} />,
                }}
            >
                {() => <MyScreenWrapper userType={userType} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

export default function RouteScreen() {
    const navigation = useNavigation();
    const [userType, setUserType] = useState(null);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchUserType = async () => {
    //         try {
    //             const jsonValue = await AsyncStorage.getItem('userInfo');
    //             const userInfo = jsonValue ? JSON.parse(jsonValue) : null;
    //             setUserType(userInfo?.userType || '개인회원');
    //             // setUserType(userInfo?.userType || '기업회원'); //지울 예정(임시)

    //         } catch (error) {
    //             // setUserType('개인회원');
    //             setUserType('기업회원'); //지울 예정(임시)

    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchUserType();
    // }, []);


    useEffect(() => {
        const fetchUserTypeAndCheckProfile = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('userInfo');
                const userInfo = jsonValue ? JSON.parse(jsonValue) : null;
                const currentUserType = userInfo?.userType || '개인회원';
                setUserType(currentUserType);

                if (!userInfo?.id) {
                    setLoading(false);
                    return;
                }

                // 프로필 API 경로 분기
                const profileApiUrl =
                    currentUserType === '기업회원'
                        ? `${BASE_URL}/api/company-profile/${userInfo.id}`
                        : `${BASE_URL}/api/user-profile/${userInfo.id}`;

                const token = await AsyncStorage.getItem('accessToken');

                const response = await fetch(profileApiUrl, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 404) {
                    Alert.alert(
                        '알림',
                        '프로필 정보를 입력해 주세요.\n더 나은 맞춤 서비스를 위해 필요합니다.',
                        [
                            {
                                text: '확인',
                                onPress: () => {
                                    if (currentUserType === '개인회원') {
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
                                    } else if (currentUserType === '기업회원') {
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
                                    }
                                },
                            },
                        ],
                        { cancelable: false }
                    );
                }
            } catch (error) {
                console.error('프로필 체크 오류:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserTypeAndCheckProfile();
    }, []);


    if (loading) return null;

    return (
        <Stack.Navigator
            screenOptions={({ navigation }) => ({
                headerTitleAlign: 'center',
                title: '',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: wp('3%') }}>
                        <Ionicons name="chevron-back" size={28} color="black" />
                    </TouchableOpacity>
                ),
            })}
        >
            <Stack.Screen name="MainTab" options={{ headerShown: false }}>
                {() => <TabNavigator userType={userType} />}
            </Stack.Screen>

            <Stack.Screen name={SCREENS.SEARCH} component={SearchScreen} />
            <Stack.Screen name={SCREENS.NOTIFICATION} component={NotificationScreen} />
            <Stack.Screen name={SCREENS.SETTING} component={SettingScreen} />
            <Stack.Screen name={SCREENS.MENU} component={MenuScreen} />
        </Stack.Navigator>
    );
}

const tabIconStyle = (focused) => ({
    height: hp('3.7%'),
    width: wp('8%'),
    tintColor: focused ? COLORS.BLACK : COLORS.GRAY_LIGHT,
});

const styles = StyleSheet.create({

});
