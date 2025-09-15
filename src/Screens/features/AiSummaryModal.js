import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import Ionicons from '@expo/vector-icons/Ionicons';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.35;

export default function AiSummaryModal({ visible, onClose, jobPostId }) {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        if (visible && jobPostId) {
            fetchSummary(jobPostId);
        }
    }, [visible, jobPostId]);

    const fetchSummary = async (id) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('accessToken');

            const res = await axios.get(`${BASE_URL}/api/jobs/summary/job/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setSummary(res.data.summary);
            } else {
                setSummary({ short: '', full: '요약을 불러올 수 없습니다.' });
            }
        } catch (e) {
            setSummary({ short: '', full: '요약 조회 실패' });
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.backdrop} pointerEvents="none" />
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>AI 요약</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.body}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#333" />
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={true}>
                                {/* Short summary - bold */}
                                <Text style={[styles.summaryText, styles.shortText]}>
                                    {summary?.short || '아직 요약된 정보가 없습니다'}
                                </Text>

                                {/* Full summary - normal */}
                                <Text style={[styles.summaryText, styles.fullText]}>
                                    {summary?.full || '아직 요약된 정보가 없습니다'}
                                </Text>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modalContent: {
        height: MODAL_HEIGHT,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    body: {
        flex: 1,
        marginTop: hp('2%'),
    },
    summaryText: {
        fontSize: hp('2%'),
        lineHeight: hp('3%'),
        color: '#333',
        textAlign: 'left',
        flexWrap: 'wrap',
    },
    shortText: {
        fontWeight: 'bold',
        marginBottom: hp('1%'),
    },
    fullText: {
        fontWeight: '400',
        marginBottom: hp('2%'),
    },
});
