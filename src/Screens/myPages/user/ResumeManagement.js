import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../../constants/colors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function ResumeManagement() {
    const navigation = useNavigation();
    const [resumes, setResumes] = useState([
        {
            id: '1',
            title: '백엔드 개발자용 이력서',
            createdAt: '2025-06-10',
            isDefault: false,
        },
        {
            id: '2',
            title: '스타트업 지원용 이력서',
            createdAt: '2025-06-15',
            isDefault: true,
        },
    ]);

    const handlePress = (resume) => {
        navigation.navigate('ResumeDetailScreen', { resume });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>생성일: {item.createdAt}</Text>
            {item.isDefault && <Text style={styles.defaultLabel}>기본 이력서</Text>}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddResumeScreen')}
            >
                <Text style={styles.addButtonText}>이력서 추가하기</Text>
            </TouchableOpacity>

            <FlatList
                data={resumes}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingTop: 20 }}
                ListEmptyComponent={
                    <Text style={{ marginTop: 20, fontSize: 16, color: 'gray' }}>
                        등록된 이력서가 없습니다.
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },
    addButton: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        borderWidth: 1,
        borderColor: '#ddd',
        padding: wp('4%'),
        marginVertical: hp('0.8%'),
    },
    title: {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        color: '#333',
    },
    date: {
        fontSize: wp('3.5%'),
        color: '#666',
        marginTop: 4,
    },
    defaultLabel: {
        marginTop: 6,
        fontSize: wp('3.5%'),
        color: COLORS.THEMECOLOR,
        fontWeight: 'bold',
    },
});