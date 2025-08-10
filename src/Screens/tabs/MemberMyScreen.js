import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

import COLORS from "../../constants/colors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import PersonalInfoForm from '../myPages/user/PersonalInfoForm';
import ResumeManagement from '../myPages/user/ResumeManagement';
import RecentAnnouncementsScreen from '../Pages/RecentAnnouncementsScreen';
import FavoriteCompaniesScreen from '../Pages/FavoriteCompaniesScreen';
import FavoriteJobsScreen from '../Pages/FavoriteJobsScreen';
import AppliedJobsScreen from '../Pages/AppliedJobsScreen';


const buttonData = [
    '최근 본 공고',
    '이력서 관리',
    '맞춤정보설정'
];

export default function MemberMyScreen() {
    const route = useRoute(); // 추가
    const initialTab = route.params?.selectedTab || '최근 본 공고'; // 기본값 지정
    const [selectedTab, setSelectedTab] = useState(initialTab); // 수정

    useEffect(() => {
        console.log('MemberMyScreen params:', route.params);
    }, [route.params]);


    const renderButton = (label) => {
        const isSelected = selectedTab === label;

        return (
            <TouchableOpacity
                key={label}
                style={[
                    styles.scrollButton,
                    isSelected && { borderColor: COLORS.THEMECOLOR }
                ]}
                onPress={() => setSelectedTab(label)}
            >
                <Text
                    style={[
                        styles.scrollButtonText,
                        isSelected && { color: COLORS.THEMECOLOR, fontWeight: 'bold' }
                    ]}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderContent = () => {
        switch (selectedTab) {
            case '최근 본 공고':
                return < RecentAnnouncementsScreen />;
            case '이력서 관리':
                return < ResumeManagement />;
            case '맞춤정보설정':
                return <PersonalInfoForm />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* 고정된 가로 스크롤 버튼 바 */}
            <View style={styles.fixedBar}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalBarContent}
                >
                    {buttonData.map(renderButton)}
                </ScrollView>
            </View>

            {/* 스크롤 가능한 콘텐츠 영역 */}
            <View style={{ flex: 1 }}>
                {renderContent()}
            </View>

            <View style={{ paddingBottom: 10 }} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    fixedBar: {
        backgroundColor: '#fff',
        paddingVertical: hp('1%'),
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        zIndex: 10,
    },
    horizontalBarContent: {
        paddingHorizontal: wp('5%'),
        flexDirection: 'row',
    },
    scrollButton: {
        marginRight: wp('3%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1%'),
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    scrollButtonText: {
        fontSize: wp('3.5%'),
        color: 'black',
    },
    pageContent: {
        fontSize: 16,
        color: '#333',
        paddingVertical: 20,
    },
});
