import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Text,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import { BASE_URL } from '@env';

export default function NotificationScreen({ navigation }) {
    const [notifications, setNotifications] = useState([
        { id: '1', title: '새 글이 등록되었습니다.', content: '지금 확인해보세요!', time: '13:20' },
        { id: '2', title: '지원 현황이 변경되었습니다.', content: '지금 확인해보세요!', time: '12:10' },
    ]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/jobs`);
            } catch (err) {
                console.error('채용공고 로딩 실패:', err.message);
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={styles.scrollContent}>
                {notifications.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.card}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate("")}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.time}>{item.time}</Text>
                        </View>
                        <Text style={styles.content}>{item.content}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: wp('5%'),
        paddingTop: hp('1.5%'),
        paddingBottom: hp('4%'),
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: wp('2%'),
        paddingVertical: hp('1.8%'),
        paddingHorizontal: wp('3%'),
        marginBottom: hp('1.2%'),
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('0.6%'),
    },
    title: {
        fontSize: wp('3.8%'),
        fontWeight: '700',
        color: '#2c3e50',
        flex: 1,
        marginRight: wp('2.5%'),
    },
    time: {
        fontSize: wp('2.8%'),
        color: '#95a5a6',
        textAlign: 'right',
        minWidth: wp('14%'),
    },
    content: {
        fontSize: wp('3.5%'),
        color: '#34495e',
        lineHeight: hp('2.2%'),
    },
});
