import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import COLORS from "../../constants/colors";
import RecentAnnouncementsScreen from '../Pages/RecentAnnouncementsScreen';
import ResumeManagement from '../myPages/user/ResumeManagement';
import PersonalInfoForm from '../myPages/user/PersonalInfoForm';


const buttonData = [
    '최근 본 공고',
    '이력서 관리',
    '맞춤정보 설정'
];

//개인회원 MY 페이지
export default function MemberMyScreen() {
    const route = useRoute();
    const initialTab = route.params?.selectedTab || '최근 본 공고';
    const [selectedTab, setSelectedTab] = useState(initialTab);

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
            case '맞춤정보 설정':
                return <PersonalInfoForm />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <View style={styles.fixedBar}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalBarContent}
                >
                    {buttonData.map(renderButton)}
                </ScrollView>
            </View>

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
});
