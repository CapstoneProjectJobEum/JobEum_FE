import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
} from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Ionicons from '@expo/vector-icons/Ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation
import RouteScreen from './src/navigation/RouteScreen';

// Auth Screens
import LoginScreen from './src/Screens/auth/LoginScreen';
import LogoutScreen from './src/Screens/auth/LogoutScreen';
import FindIdScreen from './src/Screens/auth/FindIdScreen';
import FindPasswordScreen from './src/Screens/auth/FindPasswordScreen';
import SignUpScreen from './src/Screens/auth/SignUpScreen';
import SplashScreen from './src/Screens/auth/SplashScreen';
import SignUpPersonalScreen from './src/Screens/auth/SignUpPersonalScreen';
import SignUpCompanyScreen from './src/Screens/auth/SignUpCompanyScreen';
import KakaoLoginScreen from './src/Screens/auth/KakaoLoginScreen';
import NaverLoginScreen from './src/Screens/auth/NaverLoginScreen';
import WithdrawScreen from './src/Screens/auth/WithdrawScreen';

// Tabs
import HomeScreen from './src/Screens/tabs/HomeScreen';
import JobListScreen from './src/Screens/tabs/JobListScreen';
import CompanyMyScreen from './src/Screens/tabs/CompanyMyScreen';
import MemberMyScreen from './src/Screens/tabs/MemberMyScreen';
import MyScreenWrapper from './src/Screens/tabs/MyScreenWrapper';
import RecommendScreen from './src/Screens/tabs/RecommendScreen';
import ScrapScreen from './src/Screens/tabs/ScrapScreen';

// Features
import MenuScreen from './src/Screens/features/MenuScreen';
import NotificationScreen from './src/Screens/features/NotificationScreen';
import SettingScreen from './src/Screens/features/SettingScreen';
import AccountInfoScreen from './src/Screens/features/AccountInfoScreen';

// Company Pages
import AddJobScreen from './src/Screens/myPages/company/AddJobScreen';
import JobManagementScreen from './src/Screens/myPages/company/JobManagementScreen';
import JobRequirementsForm from './src/Screens/myPages/company/JobRequirementsForm';
import ApplicationDetailsScreen from './src/Screens/myPages/company/ApplicationDetailsScreen';
import ApplicantStatusScreen from './src/Screens/myPages/company/ApplicantStatusScreen';
import CompanyEditScreen from './src/Screens/myPages/company/CompanyEditScreen';
import EditJobScreen from './src/Screens/myPages/company/EditJobScreen';

// User Pages
import AddResumeScreen from './src/Screens/myPages/user/AddResumeScreen';
import ResumeDetailScreen from './src/Screens/myPages/user/ResumeDetailScreen';
import ResumeManagement from './src/Screens/myPages/user/ResumeManagement';
import PersonalInfoForm from './src/Screens/myPages/user/PersonalInfoForm';

// General Pages
import AppliedJobsScreen from './src/Screens/Pages/AppliedJobsScreen';
import FavoriteCompaniesScreen from './src/Screens/Pages/FavoriteCompaniesScreen';
import FavoriteJobsScreen from './src/Screens/Pages/FavoriteJobsScreen';
import JobDetailScreen from './src/Screens/Pages/JobDetailScreen';
import RecentAnnouncementsScreen from './src/Screens/Pages/RecentAnnouncementsScreen';

// Shared
import JobCard from './src/Screens/shared/JobCard';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [initialRoute, setInitialRoute] = useState('LoginScreen');


  useEffect(() => {
    const checkLogin = async () => {
      const userInfoString = await AsyncStorage.getItem("userInfo");
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        if (userInfo.token) {
          setInitialRoute("RouteScreen"); // 자동 로그인
        } else {
          setInitialRoute("LoginScreen");
        }
      } else {
        setInitialRoute("LoginScreen");
      }
      setIsShowSplash(false);
    };

    setTimeout(() => {
      checkLogin();
    }, 1000);
  }, []);


  if (isShowSplash) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}
          screenOptions={({ navigation }) => ({
            title: '',
            headerTitleAlign: 'center',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}>
          {/* Auth */}
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LogoutScreen" component={LogoutScreen} options={{ headerShown: false }} />
          <Stack.Screen name="FindIdScreen" component={FindIdScreen} />
          <Stack.Screen name="FindPasswordScreen" component={FindPasswordScreen} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          <Stack.Screen name="SignUpPersonalScreen" component={SignUpPersonalScreen} />
          <Stack.Screen name="SignUpCompanyScreen" component={SignUpCompanyScreen} />
          <Stack.Screen name="KakaoLoginScreen" component={KakaoLoginScreen} />
          <Stack.Screen name="NaverLoginScreen" component={NaverLoginScreen} />
          <Stack.Screen name="WithdrawScreen" component={WithdrawScreen} />

          {/* Main Route */}
          <Stack.Screen name="RouteScreen" component={RouteScreen} options={{ headerShown: false }} />

          {/* Tabs */}
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="JobListScreen" component={JobListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CompanyMyScreen" component={CompanyMyScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MemberMyScreen" component={MemberMyScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MyScreenWrapper" component={MyScreenWrapper} options={{ headerShown: false }} />
          <Stack.Screen name="RecommendScreen" component={RecommendScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ScrapScreen" component={ScrapScreen} options={{ headerShown: false }} />

          {/* Features */}
          <Stack.Screen name="MenuScreen" component={MenuScreen} options={{ headerShown: true }} />
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: true }} />
          <Stack.Screen name="SettingScreen" component={SettingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AccountInfoScreen" component={AccountInfoScreen} options={{ headerShown: true }} />

          {/* Company Pages */}
          <Stack.Screen name="AddJobScreen" component={AddJobScreen} options={{ headerShown: true }} />
          <Stack.Screen name="JobRequirementsForm" component={JobRequirementsForm} options={{ headerShown: true }} />
          <Stack.Screen name="JobManagementScreen" component={JobManagementScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ApplicantStatusScreen" component={ApplicantStatusScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ApplicationDetailsScreen" component={ApplicationDetailsScreen} options={{ headerShown: true }} />
          <Stack.Screen name="CompanyEditScreen" component={CompanyEditScreen} options={{ headerShown: true }} />
          <Stack.Screen name="EditJobScreen" component={EditJobScreen} options={{ headerShown: true }} />




          {/* User Pages */}
          <Stack.Screen name="AddResumeScreen" component={AddResumeScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ResumeDetailScreen" component={ResumeDetailScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ResumeManagement" component={ResumeManagement} options={{ headerShown: true }} />
          <Stack.Screen name="PersonalInfoForm" component={PersonalInfoForm} options={{ headerShown: true }} />

          {/* General Pages */}
          <Stack.Screen name="JobDetailScreen" component={JobDetailScreen} options={{ headerShown: true }} />
          <Stack.Screen name="AppliedJobsScreen" component={AppliedJobsScreen} options={{ headerShown: true }} />
          <Stack.Screen name="FavoriteCompaniesScreen" component={FavoriteCompaniesScreen} options={{ headerShown: true }} />
          <Stack.Screen name="FavoriteJobsScreen" component={FavoriteJobsScreen} options={{ headerShown: true }} />
          <Stack.Screen name="RecentAnnouncementsScreen" component={RecentAnnouncementsScreen} options={{ headerShown: true }} />

          {/* Shared */}
          <Stack.Screen name="JobCard" component={JobCard} options={{ headerShown: true }} />



        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>

  );
}