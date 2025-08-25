import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

const companyTypeList = [
    '대기업',
    '중견 기업',
    '강소 기업',
    '중소 기업',
    '외국계 기업',
    '스타트업',
    '공기업',
    '사회적기업',
];

export default function CompanyTypeFilter({ selectedSubCompanyType, setSelectedSubCompanyType }) {

    const toggleSubCompany = (subCompany) => {
        if (selectedSubCompanyType.includes(subCompany)) {
            setSelectedSubCompanyType(selectedSubCompanyType.filter((item) => item !== subCompany));
        } else {
            setSelectedSubCompanyType([...selectedSubCompanyType, subCompany]);
        }
    };

    const removeSubCompany = (subCompany) => {
        setSelectedSubCompanyType(selectedSubCompanyType.filter((item) => item !== subCompany));
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.listContainer}>
                {companyTypeList.map((subCompany) => {
                    const selected = selectedSubCompanyType.includes(subCompany);
                    return (
                        <TouchableOpacity
                            key={subCompany}
                            style={[
                                styles.itemBox,
                                selected && { borderColor: COLORS.THEMECOLOR },
                            ]}
                            onPress={() => toggleSubCompany(subCompany)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.itemText, selected && { color: COLORS.THEMECOLOR, fontWeight: 'bold' }]}>
                                {subCompany}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {selectedSubCompanyType.length > 0 && (
                <View style={styles.selectedSubCompanyContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.selectedSubCompanyContent}
                    >
                        {selectedSubCompanyType.map((subCompany) => (
                            <View key={subCompany} style={styles.selectedSubCompanyCard}>
                                <Text style={styles.selectedSubCompanyText}>{subCompany}</Text>
                                <TouchableOpacity onPress={() => removeSubCompany(subCompany)}>
                                    <Ionicons name="close" size={16} color="#999" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: hp(2),
    },
    listContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
        paddingHorizontal: wp(2),
    },
    itemBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: wp(2),
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        alignItems: 'center',
    },
    itemText: {
        fontSize: wp(3.5),
        color: '#333',
    },
    selectedSubCompanyContainer: {
        borderTopWidth: 1,
        borderColor: '#ddd',
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
    },
    selectedSubCompanyContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    selectedSubCompanyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: wp(2),
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        marginRight: wp(2),
    },
    selectedSubCompanyText: {
        color: '#333',
        fontSize: wp(3.5),
        marginRight: wp(1.5),
    },
});
