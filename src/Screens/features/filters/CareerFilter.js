import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

const careerMap = {
    신입: ['신입'],
    경력: ['1년', '2년', '3년', '4년', '5년', '5년 이상'],
    경력무관: ['경력무관']
};

export default function CareerFilter({ selectedCareer, setSelectedCareer, selectedSubCareer, setSelectedSubCareer, excludeCareers = [] }) {

    const toggleSubCareer = (subCareer) => {
        if (selectedSubCareer.includes(subCareer)) {
            setSelectedSubCareer(selectedSubCareer.filter((item) => item !== subCareer));
        } else {
            setSelectedSubCareer([...selectedSubCareer, subCareer]);
        }
    };

    const removeSubCareer = (subCareer) => {
        setSelectedSubCareer(selectedSubCareer.filter((item) => item !== subCareer));
    };

    return (
        <View style={styles.container}>
            <View style={styles.regionWrapper}>
                <ScrollView style={styles.leftColumn}>
                    {Object.keys(careerMap)
                        .filter(region => !excludeCareers.includes(region))
                        .map((region) => (
                            <TouchableOpacity
                                key={region}
                                style={[
                                    styles.leftItem,
                                    selectedCareer === region && styles.selectedLeftItem,
                                ]}
                                onPress={() => setSelectedCareer(region)}
                            >
                                <Text
                                    style={[
                                        styles.leftItemText,
                                        selectedCareer === region && styles.selectedLeftItemText,
                                    ]}
                                >
                                    {region}
                                </Text>
                            </TouchableOpacity>
                        ))}

                </ScrollView>

                <ScrollView style={styles.rightColumn}>
                    {careerMap[selectedCareer]?.map((subCareer) => (
                        <TouchableOpacity
                            key={subCareer}
                            style={styles.rightItem}
                            onPress={() => toggleSubCareer(subCareer)}
                        >
                            <Text
                                style={[
                                    styles.rightItemText,
                                    selectedSubCareer.includes(subCareer) && { color: COLORS.THEMECOLOR, fontWeight: 'bold' },
                                ]}
                            >
                                {subCareer}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {selectedSubCareer.length > 0 && (
                <View style={styles.selectedSubCareerContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.selectedSubCareerContent}
                    >
                        {selectedSubCareer.map((subCareer) => (
                            <View key={subCareer} style={styles.selectedSubCareerCard}>
                                <Text style={styles.selectedSubCareerText}>{subCareer}</Text>
                                <TouchableOpacity onPress={() => removeSubCareer(subCareer)}>
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
    regionWrapper: {
        flexDirection: 'row',
        flex: 1,
    },
    leftColumn: {
        width: wp(40),
        borderRightWidth: 1,
        borderRightColor: '#eee',
        paddingRight: wp(2),
    },
    rightColumn: {
        width: wp(60),
        paddingLeft: wp(2),
    },
    leftItem: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(3),
    },
    leftItemText: {
        fontSize: wp(4),
        color: '#333',
    },
    selectedLeftItem: {
        backgroundColor: COLORS.THEMECOLOR + '20',
    },
    selectedLeftItemText: {
        fontWeight: 'bold',
        color: COLORS.THEMECOLOR,
    },
    rightItem: {
        paddingVertical: hp(1.6),
        paddingHorizontal: wp(3),
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    rightItemText: {
        fontSize: wp(3.8),
        color: '#555',
    },
    selectedSubCareerContainer: {
        borderTopWidth: 1,
        borderColor: '#ddd',
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
    },
    selectedSubCareerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    selectedSubCareerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: wp(2),
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        marginRight: wp(2),
    },
    selectedSubCareerText: {
        color: '#333',
        fontSize: wp(3.5),
        marginRight: wp(1.5),
    },
});
