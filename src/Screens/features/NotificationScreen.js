import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { BASE_URL } from '@env';
import { useNotification } from '../../context/NotificationContext';
import { RectButton } from "react-native-gesture-handler";
import { Ionicons } from '@expo/vector-icons';
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";


export default function NotificationScreen() {
    const navigation = useNavigation();
    const { fetchUnread, markAsRead, markAllAsRead } = useNotification();
    const [notifications, setNotifications] = useState([]);


    const formatDateTime = (timestamp) => {
        const d = new Date(timestamp);
        const date = d.toISOString().split('T')[0];
        const time = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: 'numeric', hour12: true }).format(d);
        return `${date} ${time}`;
    };

    // 알림 목록 불러오기
    const loadNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            const res = await axios.get(`${BASE_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data?.success) {
                const formatted = res.data.data.map((n) => {
                    let relatedId = null;
                    let extra = {};

                    switch (n.type) {
                        case 'EMP_APPLICATION_RECEIVED': {
                            const { resume_id, job_post_id, applicant_user_id } = n.metadata || {};
                            relatedId = null;
                            extra = {
                                resumeId: resume_id,
                                jobPostId: job_post_id,
                                applicantUserId: applicant_user_id
                            };
                            break;
                        }


                        case 'NEW_JOB_FROM_FAVORITE_COMPANY':
                        case 'FAVORITE_JOB_DEADLINE':
                        case 'EMP_JOB_DEADLINE':
                        case 'APPLICATION_STATUS_UPDATE':
                            relatedId = n.metadata?.job_post_id || null;
                            break;

                        case 'EMP_JOB_DELETED_BY_ADMIN':
                        case 'ADMIN_INQUIRY_CREATED':
                        case 'ADMIN_REPORT_CREATED':
                        case 'INQUIRY_REPORT_ANSWERED':
                            relatedId =
                                n.metadata?.report_id ||
                                n.metadata?.inquiry_id ||
                                n.metadata?.reportId ||
                                n.metadata?.inquiryId ||
                                null;
                            break;

                        default:
                            relatedId =
                                n.metadata?.job_post_id ||
                                n.metadata?.applicant_user_id ||
                                n.metadata?.resume_id ||
                                n.metadata?.report_id ||
                                n.metadata?.inquiry_id ||
                                n.metadata?.reportId ||
                                n.metadata?.inquiryId ||
                                null;
                            break;
                    }

                    return {
                        id: n.id.toString(),
                        type: n.type,
                        title: n.title,
                        subtitle: n.message,
                        relatedId,
                        extra,
                        createdAt: new Date(n.created_at).getTime(),
                        isViewed: n.is_read === 1,
                    };
                });


                setNotifications(formatted);
            }
        } catch (err) {
            console.error('[NotificationScreen] 알림 조회 실패', err);
        }
    };


    useEffect(() => {
        loadNotifications();
    }, []);

    // 개별 알림 읽음 + 이동
    const handlePress = (n) => {
        // 1. 네비게이션을 먼저 실행하여 즉각적인 화면 전환을 유도
        switch (n.type) {
            case 'NEW_JOB_FROM_FAVORITE_COMPANY':
            case 'FAVORITE_JOB_DEADLINE':
            case 'EMP_JOB_DEADLINE':
            case 'APPLICATION_STATUS_UPDATE':
                if (n.relatedId) navigation.navigate('JobDetailScreen', { jobPostId: n.relatedId });
                break;

            case 'EMP_APPLICATION_RECEIVED':
                if (n.extra?.resumeId && n.extra?.jobPostId && n.extra?.applicantUserId) {
                    navigation.navigate('ApplicationDetailsScreen', {
                        resumeId: n.extra.resumeId,
                        jobPostId: n.extra.jobPostId,
                        applicantUserId: n.extra.applicantUserId
                    });
                }
                break;

            case 'EMP_JOB_DELETED_BY_ADMIN':
                Alert.alert('알림', '공고가 문제가 발생하거나 신고로 인해 관리자가 삭제했습니다.');
                break;

            case 'ADMIN_INQUIRY_CREATED':
                if (n.relatedId) navigation.navigate('InquiryReportAnswerScreen', { source: 'inquiry', inquiryId: n.relatedId });
                break;

            case 'ADMIN_REPORT_CREATED':
                if (n.relatedId) navigation.navigate('InquiryReportAnswerScreen', { source: 'report', reportId: n.relatedId });
                break;

            case 'INQUIRY_REPORT_ANSWERED':
                navigation.navigate('InquiryHistoryScreen');
                break;

            default:
                console.warn('[NotificationScreen] 처리되지 않은 알림 타입:', n.type);
                break;
        }

        // 2. 읽음 처리 로직을 비동기적으로 실행 (await 키워드 제거)
        if (!n.isViewed) {
            markAsRead(n.id)
                .then(() => {
                    setNotifications((prev) =>
                        prev.map((x) => (x.id === n.id ? { ...x, isViewed: true } : x))
                    );
                })
                .catch((err) => {
                    console.error('[markAsRead] 읽음 처리 실패', err);
                });
        }
    };
    // 전체 읽음 처리
    const handleClearAll = () => {
        if (!notifications.length) return;

        Alert.alert('알림 읽음 처리', '모든 알림을 읽음 처리하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '확인',
                onPress: async () => {
                    await markAllAsRead();
                    setNotifications((prev) => prev.map((n) => ({ ...n, isViewed: true })));
                },
            },
        ]);
    };

    // 개별 삭제
    const handleDelete = async (id) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            await axios.delete(`${BASE_URL}/api/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setNotifications((prev) => prev.filter((x) => x.id !== id));
            fetchUnread();
        } catch (err) {
            console.error('[handleDelete] 알림 삭제 실패', err);
        }
    };

    // 전체 삭제
    const handleDeleteAll = () => {
        if (!notifications.length) return;

        Alert.alert('알림 삭제', '모든 알림을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '확인',
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('accessToken');
                        await axios.delete(`${BASE_URL}/api/notifications/delete-all`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setNotifications([]);
                        fetchUnread(); // BellIcon 갱신
                    } catch (err) {
                        console.error('[handleDeleteAll] 전체 삭제 실패', err);
                    }
                },
            },
        ]);
    };

    // Reanimated Swipeable의 renderRightActions 시그니처: (progress, translation, methods)
    const renderRightActions = (id) => (_progress, _translation, _methods) => (
        <RectButton onPress={() => handleDelete(id)} style={styles.deleteBox}>
            <View accessible accessibilityRole="button">
                <Text style={styles.deleteText}>삭제</Text>
            </View>
        </RectButton>
    );

    const NotificationCard = ({ item }) => (
        <Swipeable
            friction={2}
            rightThreshold={wp("35%")}
            renderRightActions={renderRightActions(item.id)}
            onSwipeableOpen={(dir) => {
                if (dir === "left") handleDelete(item.id);
            }}
        >
            <TouchableOpacity style={styles.card} onPress={() => handlePress(item)} activeOpacity={0.8}>
                <View style={styles.cardHeader}>
                    <Text style={styles.title}>
                        {item.title}
                        {!item.isViewed && <Text style={styles.newLabel}> New</Text>}
                    </Text>
                    <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
                </View>
                <Text style={styles.content}>{item.subtitle}</Text>
            </TouchableOpacity>
        </Swipeable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* 왼쪽: 알림 설정 버튼 */}
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => navigation.navigate('NotificationSettingScreen')}
                >
                    <Ionicons
                        name="settings-outline"
                        size={wp('3%')}
                        color="#808080"
                        style={{ marginRight: wp('1%') }}
                    />
                    <Text style={styles.settingsText}>알림 설정</Text>
                </TouchableOpacity>

                {/* 오른쪽: 전체 읽음 + 전체 삭제 버튼 */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={handleDeleteAll}>
                        <Text style={styles.clearText}>전체 삭제</Text>
                    </TouchableOpacity>

                    <Text style={{ marginHorizontal: 8, color: '#808080' }}>|</Text>

                    <TouchableOpacity onPress={handleClearAll}>
                        <Text style={styles.clearText}>전체 읽음</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                contentContainerStyle={styles.scrollContent}
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <NotificationCard item={item} />}
                ListEmptyComponent={
                    <Text style={{ marginTop: 10, fontSize: 16, color: 'gray', textAlign: 'center' }}>
                        알림이 없습니다.
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: hp("1.5%"),
        paddingHorizontal: wp("5%"),
        backgroundColor: 'white'
    },
    scrollContent: {
        paddingBottom: hp("4%"),
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: wp("2%"),
        paddingVertical: hp("1.8%"),
        paddingHorizontal: wp("3%"),
        marginBottom: hp("1.2%"),
        borderWidth: 1,
        borderColor: "#ddd",
        shadowColor: '#aaa',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: hp("0.6%"),
    },
    title: {
        fontSize: wp("3.6%"),
        fontWeight: "700",
        color: "#2c3e50",
        flex: 1,
        marginRight: wp("2.5%"),
    },
    newLabel: {
        fontSize: wp("3.2%"),
        color: "#e74c3c",
        fontWeight: "700",
    },
    time: {
        fontSize: wp("2.8%"),
        color: "#95a5a6",
        textAlign: "right",
        minWidth: wp("14%"),
    },
    content: {
        fontSize: wp("3.5%"),
        color: "#34495e",
        lineHeight: hp("2.2%"),
    },
    deleteBox: {
        backgroundColor: "#e74c3c",
        justifyContent: "center",
        alignItems: "center",
        width: wp("14%"),
        borderRadius: wp("2%"),
        marginBottom: hp("1.2%"),
    },
    deleteText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: wp("3.5%"),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    settingsText: {
        fontSize: wp("3.5%"),
        color: '#808080',
        fontWeight: '700',
    },
    clearText: {
        fontSize: wp("3.5%"),
        color: '#808080',
        fontWeight: '700',
    },
});
