import React, { useState } from 'react';
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
import InquiryListScreen from '../myPages/admin/InquiryListScreen';
import ReportListScreen from '../myPages/admin/ReportListScreen';

const buttonData = [
    '문의내역',
    '신고내역',
];

export default function AdminMyScreen() {
    const route = useRoute();
    const initialTab = route?.params?.selectedTab || '문의내역';
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
            case '문의내역':
                return < InquiryListScreen />;
            case '신고내역':
                return < ReportListScreen />;
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
