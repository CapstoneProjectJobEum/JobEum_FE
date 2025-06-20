import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Navigation
import RouteScreen from './src/navigation/RouteScreen';

// Auth Screens
import LoginScreen from './src/Screens/auth/LoginScreen';
import FindIdScreen from './src/Screens/auth/FindIdScreen';
import FindPasswordScreen from './src/Screens/auth/FindPasswordScreen';
import SignUpScreen from './src/Screens/auth/SignUpScreen';
import SplashScreen from './src/Screens/auth/SplashScreen';
import SignUpPersonalScreen from './src/Screens/auth/SignUpPersonalScreen';
import SignUpCompanyScreen from './src/Screens/auth/SignUpCompanyScreen';
import GoogleLoginScreen from './src/Screens/auth/GoogleLoginScreen';
import KakaoLoginScreen from './src/Screens/auth/KakaoLoginScreen';
import NaverLoginScreen from './src/Screens/auth/NaverLoginScreen';

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

// Company Pages
import AddJobScreen from './src/Screens/myPages/company/AddJobScreen';
import JobManagementScreen from './src/Screens/myPages/company/JobManagementScreen';
import JobRequirementsForm from './src/Screens/myPages/company/JobRequirementsForm';
import ApplicationDetailsScreen from './src/Screens/myPages/company/ApplicationDetailsScreen';
import ApplicantStatusScreen from './src/Screens/myPages/company/ApplicantStatusScreen';
import CompanyEditScreen from './src/Screens/myPages/company/CompanyEditScreen';

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
import JobList from './src/Screens/shared/JobList';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isShowSplash ? (
        <SplashScreen />
      ) : (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
            {/* Auth */}
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="FindIdScreen" component={FindIdScreen} />
            <Stack.Screen name="FindPasswordScreen" component={FindPasswordScreen} />
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
            <Stack.Screen name="SignUpPersonalScreen" component={SignUpPersonalScreen} />
            <Stack.Screen name="SignUpCompanyScreen" component={SignUpCompanyScreen} />
            <Stack.Screen name="GoogleLoginScreen" component={GoogleLoginScreen} />
            <Stack.Screen name="KakaoLoginScreen" component={KakaoLoginScreen} />
            <Stack.Screen name="NaverLoginScreen" component={NaverLoginScreen} />


            {/* Main Route */}
            <Stack.Screen name="RouteScreen" component={RouteScreen} />

            {/* Tabs */}
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="JobListScreen" component={JobListScreen} />
            <Stack.Screen name="CompanyMyScreen" component={CompanyMyScreen} />
            <Stack.Screen name="MemberMyScreen" component={MemberMyScreen} />
            <Stack.Screen name="MyScreenWrapper" component={MyScreenWrapper} />
            <Stack.Screen name="RecommendScreen" component={RecommendScreen} />
            <Stack.Screen name="ScrapScreen" component={ScrapScreen} />

            {/* Features */}
            <Stack.Screen name="MenuScreen" component={MenuScreen} options={{ headerShown: true }} />
            <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: true }} />
            <Stack.Screen name="SettingScreen" component={SettingScreen} options={{ headerShown: true }} />

            {/* Company Pages */}
            <Stack.Screen name="AddJobScreen" component={AddJobScreen} options={{ headerShown: true }} />
            <Stack.Screen name="JobRequirementsForm" component={JobRequirementsForm} options={{ headerShown: true }} />
            <Stack.Screen name="JobManagementScreen" component={JobManagementScreen} options={{ headerShown: true }} />
            <Stack.Screen name="ApplicantStatusScreen" component={ApplicantStatusScreen} options={{ headerShown: true }} />
            <Stack.Screen name="ApplicationDetailsScreen" component={ApplicationDetailsScreen} options={{ headerShown: true }} />
            <Stack.Screen name="ApplicaCompanyEditScreentionDetailsScreen" component={CompanyEditScreen} options={{ headerShown: true }} />

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
            <Stack.Screen name="JobList" component={JobList} options={{ headerShown: true }} />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </>
  );
};

export default App;
