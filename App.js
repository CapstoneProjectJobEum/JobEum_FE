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
import AdminMyScreen from './src/Screens/tabs/AdminMyScreen';
import CompanyMyScreen from './src/Screens/tabs/CompanyMyScreen';
import MemberMyScreen from './src/Screens/tabs/MemberMyScreen';
import MyScreenWrapper from './src/Screens/tabs/MyScreenWrapper';
import RecommendScreen from './src/Screens/tabs/RecommendScreen';
import ScrapScreen from './src/Screens/tabs/ScrapScreen';
import CustomerServiceScreen from './src/Screens/tabs/CustomerServiceScreen';
import FilterTabSection from './src/Screens/tabs/FilterTabSection';


// Features
import SearchScreen from './src/Screens/features/SearchScreen';
import SearchOutput from './src/Screens/features/SearchOutput';
import MenuScreen from './src/Screens/features/MenuScreen';
import NotificationScreen from './src/Screens/features/NotificationScreen';
import SettingScreen from './src/Screens/features/SettingScreen';
import FAQScreen from './src/Screens/features/FAQScreen';
import FeedbackScreen from './src/Screens/features/FeedbackScreen';
import InquiryHistoryScreen from './src/Screens/features/InquiryHistoryScreen';
import FilterModal from './src/Screens/features/FilterModal';

// Filters
import JobFilter from './src/Screens/features/filters/JobFilter';
import RegionFilter from './src/Screens/features/filters/RegionFilter';
import CareerFilter from './src/Screens/features/filters/CareerFilter';
import EducationFilter from './src/Screens/features/filters/EducationFilter';
import CompanyTypeFilter from './src/Screens/features/filters/CompanyTypeFilter';
import EmploymentTypeFilter from './src/Screens/features/filters/EmploymentTypeFilter';
import PersonalizedFilter from './src/Screens/features/filters/PersonalizedFilter';
import FilterMenuScreen from './src/Screens/features/filters/FilterMenuScreen';


//Admin Pages
import InquiryListScreen from './src/Screens/myPages/admin/InquiryListScreen';
import ReportListScreen from './src/Screens/myPages/admin/ReportListScreen';
import InquiryReportAnswerScreen from './src/Screens/myPages/admin/InquiryReportAnswerScreen';


// Company Pages
import AddJobScreen from './src/Screens/myPages/company/AddJobScreen';
import JobManagementScreen from './src/Screens/myPages/company/JobManagementScreen';
import ApplicationDetailsScreen from './src/Screens/myPages/company/ApplicationDetailsScreen';
import ApplicantStatusScreen from './src/Screens/myPages/company/ApplicantStatusScreen';
import CompanyEditScreen from './src/Screens/myPages/company/CompanyEditScreen';
import EditJobScreen from './src/Screens/myPages/company/EditJobScreen';
import AccountInfoCompany from './src/Screens/myPages/company/AccountInfoCompany';


// User Pages
import AddResumeScreen from './src/Screens/myPages/user/AddResumeScreen';
import EditResumeScreen from './src/Screens/myPages/user/EditResumeScreen';
import ResumeDetailScreen from './src/Screens/myPages/user/ResumeDetailScreen';
import ResumeManagement from './src/Screens/myPages/user/ResumeManagement';
import PersonalInfoForm from './src/Screens/myPages/user/PersonalInfoForm';
import AccountInfoUser from './src/Screens/myPages/user/AccountInfoUser';

// General Pages
import AppliedJobsScreen from './src/Screens/Pages/AppliedJobsScreen';
import FavoriteCompaniesScreen from './src/Screens/Pages/FavoriteCompaniesScreen';
import FavoriteJobsScreen from './src/Screens/Pages/FavoriteJobsScreen';
import JobDetailScreen from './src/Screens/Pages/JobDetailScreen';
import RecentAnnouncementsScreen from './src/Screens/Pages/RecentAnnouncementsScreen';
import CompanyDetailScreen from './src/Screens/Pages/CompanyDetailScreen';



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
          <Stack.Screen name="AdminMyScreen" component={AdminMyScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CompanyMyScreen" component={CompanyMyScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MemberMyScreen" component={MemberMyScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MyScreenWrapper" component={MyScreenWrapper} options={{ headerShown: false }} />
          <Stack.Screen name="RecommendScreen" component={RecommendScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ScrapScreen" component={ScrapScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CustomerServiceScreen" component={CustomerServiceScreen} options={{ headerShown: true }} />
          <Stack.Screen name="FilterTabSection" component={FilterTabSection} options={{ headerShown: false }} />


          {/* Features */}
          <Stack.Screen name="SearchScreen" component={SearchScreen} options={{ headerShown: true }} />
          <Stack.Screen name="SearchOutput" component={SearchOutput} options={{ headerShown: true }} />
          <Stack.Screen name="MenuScreen" component={MenuScreen} options={{ headerShown: true }} />
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: true }} />
          <Stack.Screen name="SettingScreen" component={SettingScreen} options={{ headerShown: true }} />
          <Stack.Screen name="FAQScreen" component={FAQScreen} options={{ headerShown: true }} />
          <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} options={{ headerShown: true }} />
          <Stack.Screen name="InquiryHistoryScreen" component={InquiryHistoryScreen} options={{ headerShown: true }} />
          <Stack.Screen name="FilterModal" component={FilterModal} options={{ headerShown: false }} />


          {/* Filters */}
          <Stack.Screen name="JobFilter" component={JobFilter} options={{ headerShown: false }} />
          <Stack.Screen name="RegionFilter" component={RegionFilter} options={{ headerShown: false }} />
          <Stack.Screen name="CareerFilter" component={CareerFilter} options={{ headerShown: false }} />
          <Stack.Screen name="EducationFilter" component={EducationFilter} options={{ headerShown: false }} />
          <Stack.Screen name="CompanyTypeFilter" component={CompanyTypeFilter} options={{ headerShown: false }} />
          <Stack.Screen name="EmploymentTypeFilter" component={EmploymentTypeFilter} options={{ headerShown: false }} />
          <Stack.Screen name="PersonalizedFilter" component={PersonalizedFilter} options={{ headerShown: false }} />
          <Stack.Screen name="FilterMenuScreen" component={FilterMenuScreen} options={{ headerShown: false }} />


          {/* Admin Pages */}
          <Stack.Screen name="InquiryListScreen" component={InquiryListScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ReportListScreen" component={ReportListScreen} options={{ headerShown: true }} />
          <Stack.Screen name="InquiryReportAnswerScreen" component={InquiryReportAnswerScreen} options={{ headerShown: true }} />

          {/* Company Pages */}
          <Stack.Screen name="AddJobScreen" component={AddJobScreen} options={{ headerShown: true }} />
          <Stack.Screen name="JobManagementScreen" component={JobManagementScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ApplicantStatusScreen" component={ApplicantStatusScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ApplicationDetailsScreen" component={ApplicationDetailsScreen} options={{ headerShown: true }} />
          <Stack.Screen name="CompanyEditScreen" component={CompanyEditScreen} options={{ headerShown: true }} />
          <Stack.Screen name="EditJobScreen" component={EditJobScreen} options={{ headerShown: true }} />
          <Stack.Screen name="AccountInfoCompany" component={AccountInfoCompany} options={{ headerShown: true }} />



          {/* User Pages */}
          <Stack.Screen name="AddResumeScreen" component={AddResumeScreen} options={{ headerShown: true }} />
          <Stack.Screen name="EditResumeScreen" component={EditResumeScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ResumeDetailScreen" component={ResumeDetailScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ResumeManagement" component={ResumeManagement} options={{ headerShown: true }} />
          <Stack.Screen name="PersonalInfoForm" component={PersonalInfoForm} options={{ headerShown: true }} />
          <Stack.Screen name="AccountInfoUser" component={AccountInfoUser} options={{ headerShown: true }} />


          {/* General Pages */}
          <Stack.Screen name="JobDetailScreen" component={JobDetailScreen} options={{ headerShown: true }} />
          <Stack.Screen name="AppliedJobsScreen" component={AppliedJobsScreen} options={{ headerShown: true }} />
          <Stack.Screen name="FavoriteCompaniesScreen" component={FavoriteCompaniesScreen} options={{ headerShown: true }} />
          <Stack.Screen name="FavoriteJobsScreen" component={FavoriteJobsScreen} options={{ headerShown: true }} />
          <Stack.Screen name="RecentAnnouncementsScreen" component={RecentAnnouncementsScreen} options={{ headerShown: true }} />
          <Stack.Screen name="CompanyDetailScreen" component={CompanyDetailScreen} options={{ headerShown: true }} />


          {/* Shared */}
          <Stack.Screen name="JobCard" component={JobCard} options={{ headerShown: true }} />



        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>

  );
}