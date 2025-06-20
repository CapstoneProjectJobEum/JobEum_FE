
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';

import HomeScreen from '../Screens/tabs/HomeScreen';
import RecommendScreen from '../Screens/tabs/RecommendScreen';
import JobListScreen from '../Screens/tabs/JobListScreen';
import ScrapScreen from '../Screens/tabs/ScrapScreen';
import MyScreenWrapper from '../Screens/tabs/MyScreenWrapper';
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
                tabBarActiveTintColor: COLORS.BLACK,
                tabBarInactiveTintColor: COLORS.GRAY_LIGHT,
                headerRight: () => {
                    if (route.name === SCREENS.MY) {
                        return (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => navigation.navigate(SCREENS.SETTING)}>
                                    <Image source={IMAGES.SETTING} style={styles.iconRight} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate(SCREENS.MENU)} style={{ marginRight: 15 }}>
                                    <Image source={IMAGES.MENU} style={styles.iconLeft} />
                                </TouchableOpacity>
                            </View>
                        );
                    }
                    return (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.NOTIFICATION)}>
                                <Image source={IMAGES.NOTIFICATION} style={styles.iconRight} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.MENU)} style={{ marginRight: 15 }}>
                                <Image source={IMAGES.MENU} style={styles.iconLeft} />
                            </TouchableOpacity>
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={userType === '기업' ? JobListScreen : HomeScreen}
                options={{
                    title: '홈',
                    tabBarIcon: ({ focused }) => <Image source={IMAGES.HOME} style={tabIconStyle(focused)} />,
                }}
            />
            {userType !== '기업' && (
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



const RouteScreen = ({ route }) => {
    // const { userType = '회원' } = route.params || {};
    const { userType = '기업' } = route.params || {};
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="MainTab"
                options={{ headerShown: false }}
            >
                {() => <TabNavigator userType={userType} />}
            </Stack.Screen>
            <Stack.Screen
                name={SCREENS.NOTIFICATION}
                component={NotificationScreen}
                options={{ title: '알림' }}
            />
            <Stack.Screen
                name={SCREENS.SETTING}
                component={SettingScreen}
                options={{ title: '설정' }}
            />
            <Stack.Screen
                name={SCREENS.MENU}
                component={MenuScreen}
                options={{ title: '메뉴' }}
            />
        </Stack.Navigator>

    );
};

const tabIconStyle = (focused) => ({
    height: 30,
    width: 30,
    tintColor: focused ? COLORS.BLACK : COLORS.GRAY_LIGHT,
});

const styles = StyleSheet.create({
    iconLeft: {
        width: 25,
        height: 25,
        marginLeft: 15,
    },
    iconRight: {
        width: 25,
        height: 25,
        marginRight: 15,
    },
});

export default RouteScreen;
