import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    Text
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';

export default function NotificationScreen({ navigation }) {
    const [notifications, setNotifications] = useState([
        { id: '1', title: '댓글이 달렸습니다.', content: '이거 얼마인가요?', time: '14:54' },
        { id: '2', title: '새 글이 등록되었습니다.', content: '지금 확인해보세요!', time: '13:20' },
    ]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // const res = await axios.get('http://10.106.2.70:4000/api/jobs');
                const res = await axios.get('http://192.168.0.19:4000/api/jobs');
                // setNotifications(res.data);
            } catch (err) {
                console.error('채용공고 로딩 실패:', err.message);
            }
        };
        // fetchNotifications();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("")}>
            <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.content}>{item.content}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView />
            <View style={styles.middleView}>
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: hp('5%') }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    middleView: {
        flex: 1,
        paddingHorizontal: wp('4%'),
        paddingTop: hp('1%'),
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: wp('2%'),
        paddingVertical: hp('2%'),
        paddingHorizontal: wp('4%'),
        marginBottom: hp('1%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: wp('3.8%'),
        fontWeight: '600',
        color: '#2c3e50',
    },
    time: {
        fontSize: wp('3%'),
        color: '#95a5a6',
    },
    content: {
        fontSize: wp('3.3%'),
        color: '#34495e',
        marginTop: hp('0.8%'),
    },
});
