import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import COLORS from "../../constants/colors";
import FavoriteCompaniesScreen from '../Pages/FavoriteCompaniesScreen';
import FavoriteJobsScreen from '../Pages/FavoriteJobsScreen';
import AppliedJobsScreen from '../Pages/AppliedJobsScreen';


const buttonData = [
    '관심 공고', '관심 기업', '지원 현황'
];

//개인 회원 스크랩 페이지
export default function ScrapScreen() {
    const route = useRoute();
    const initialTab = route.params?.params?.selectedTab || '관심 공고';
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

            case '관심 공고':
                return <FavoriteJobsScreen />;
            case '관심 기업':
                return <FavoriteCompaniesScreen />;
            case '지원 현황':
                return <AppliedJobsScreen />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <View style={styles.fixedBar}>
                <View style={styles.horizontalBarContent}>
                    {buttonData.map(renderButton)}
                </View>
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
