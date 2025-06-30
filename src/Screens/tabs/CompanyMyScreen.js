import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';

import COLORS from "../../constants/colors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import JobManagementScreen from '../myPages/company/JobManagementScreen';
import ApplicantStatusScreen from '../myPages/company/ApplicantStatusScreen';
import CompanyEditScreen from '../myPages/company/CompanyEditScreen';

const buttonData = [
    '지원자 현황',
    '채용공고 관리',
    '기업 정보 수정'
];

export default function CompanyMyScreen() {
    const [selectedTab, setSelectedTab] = useState('채용공고 관리');

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
            case '지원자 현황':
                return < ApplicantStatusScreen />;
            case '채용공고 관리':
                return < JobManagementScreen />;
            case '기업 정보 수정':
                return < CompanyEditScreen />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
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
    contentWrapper: {
        flex: 1,
    },
    scrollContainer: {
        padding: 20,
    },
    pageContent: {
        fontSize: 16,
        color: '#333',
    },
});
