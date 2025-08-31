import React, { useEffect, useState } from 'react';
import { Alert, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import { useNotification } from '../context/NotificationContext';

import { Ionicons, Feather } from '@expo/vector-icons';

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

import BellIcon from '../components/BellIon';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = ({ userType, role, hasNewNotification, setHasNewNotification, fetchUnread }) => {
    const navigation = useNavigation();

    // ADMIN이면 기업회원처럼 처리
    const isCompany = userType === '기업회원' || role === 'ADMIN';

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
                                    <Ionicons name="settings-outline" size={wp('6%')} color="black" style={{ marginRight: wp('3%') }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate(SCREENS.MENU)} style={{ marginRight: 15 }}>
                                    <Ionicons name="menu-outline" size={wp('8%')} color="black" />
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
                                    <Feather name="search" size={wp('6%')} color="black" />
                                ) : (
                                    <BellIcon hasNewNotification={hasNewNotification} fetchUnread={fetchUnread} />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.MENU)} style={{ marginRight: 15 }}>
                                <Ionicons name="menu-outline" size={wp('8%')} color="black" />
                            </TouchableOpacity>
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={isCompany ? JobListScreen : HomeScreen}
                options={{
                    title: '홈',
                    tabBarIcon: ({ focused }) => <Image source={IMAGES.HOME} style={tabIconStyle(focused)} />,
                }}
            />
            {!isCompany && (
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
                {() => <MyScreenWrapper userType={userType} role={role} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};


export default function RouteScreen() {
    const { fetchUnread, initSocketAfterLogin } = useNotification();
    const navigation = useNavigation();
    const [userType, setUserType] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasNewNotification, setHasNewNotification] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('userInfo');
                const userInfo = jsonValue ? JSON.parse(jsonValue) : null;
                const currentUserType = userInfo?.userType || '개인회원';
                setUserType(currentUserType);
                setRole(userInfo?.role || 'MEMBER');

                if (!userInfo?.id) return;

                // 관리자면 종료
                if (userInfo.role === 'ADMIN') return;

                const token = await AsyncStorage.getItem('accessToken');

                // 1. 알림 빨간점 갱신
                await fetchUnread();

                // 2. 소켓 연결
                await initSocketAfterLogin();

                // 3. 프로필 체크
                const profileApiUrl =
                    currentUserType === '기업회원'
                        ? `${BASE_URL}/api/company-profile/${userInfo.id}`
                        : `${BASE_URL}/api/user-profile/${userInfo.id}`;

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
                                        });
                                    } else if (currentUserType === '기업회원') {
                                        navigation.navigate('RouteScreen', {
                                            screen: 'MainTab',
                                            params: {
                                                screen: 'MY',
                                                params: {
                                                    screen: 'CompanyMyScreen',
                                                    params: { selectedTab: '기업정보설정' },
                                                },
                                            },
                                        });
                                    }
                                },
                            },
                        ],
                        { cancelable: false }
                    );
                }
            } catch (error) {
                console.error('RouteScreen init 오류:', error);
            } finally {
                setLoading(false);
            }
        };

        init();
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
                {() => <TabNavigator
                    userType={userType}
                    role={role}
                    hasNewNotification={hasNewNotification}
                    setHasNewNotification={setHasNewNotification}
                />}
            </Stack.Screen>

            <Stack.Screen name={SCREENS.SEARCH} component={SearchScreen} options={{ title: "검색" }} />
            <Stack.Screen name={SCREENS.NOTIFICATION} component={NotificationScreen} options={{ title: "알림" }} />
            <Stack.Screen name={SCREENS.SETTING} component={SettingScreen} options={{ title: "설정" }} />
            <Stack.Screen name={SCREENS.MENU} component={MenuScreen} options={{ title: "메뉴" }} />
        </Stack.Navigator>
    );
}

const tabIconStyle = (focused) => ({
    height: hp('3.7%'),
    width: wp('8%'),
    tintColor: focused ? COLORS.BLACK : COLORS.GRAY_LIGHT,
});