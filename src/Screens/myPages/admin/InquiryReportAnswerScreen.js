import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import COLORS from '../../../constants/colors';

export default function InquiryReportAnswerScreen({ route }) {
    const navigation = useNavigation();
    const { inquiryId, reportId, source } = route.params;
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState('');

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('알림', '로그인이 필요합니다.');
                setLoading(false);
                return;
            }

            let url = '';
            if (source === 'inquiry') url = `${BASE_URL}/api/admin/inquiries/${inquiryId}`;
            else if (source === 'report') url = `${BASE_URL}/api/admin/reports/${reportId}`;
            else throw new Error('잘못된 source 값');

            const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

            if (response.data.success === false) {
                Alert.alert('오류', response.data.message || '내용을 불러오지 못했습니다.');
            } else {
                setItem(response.data.item);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '상세 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, []);

    useEffect(() => {
        if (item) setAnswer(item.answer || '');
    }, [item]);

    const handleSubmit = async () => {
        if (!answer.trim()) {
            Alert.alert('알림', '답변 내용을 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('알림', '로그인이 필요합니다.');
                setLoading(false);
                return;
            }

            let url = '';
            let statusValue = '';
            if (source === 'inquiry') {
                url = `${BASE_URL}/api/admin/inquiries/${inquiryId}`;
                statusValue = 'DONE';
            } else if (source === 'report') {
                url = `${BASE_URL}/api/admin/reports/${reportId}`;
                statusValue = 'CLOSED';
            } else throw new Error('잘못된 source 값');

            const response = await axios.patch(
                url,
                { answer, status: statusValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                Alert.alert('완료', '답변이 저장되었습니다.');
                navigation.goBack();
            } else {
                Alert.alert('오류', response.data.message || '답변 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '답변 저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !item) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.THEMECOLOR} />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['left', 'right']} >
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                extraScrollHeight={5}
            >


                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>관리자 답변</Text>
                    <View style={styles.formContainer}>
                        <View style={styles.inputRow}>
                            <Text style={styles.label}>내용</Text>
                            <TextInput
                                style={[styles.textInput, { height: hp('15%') }]}
                                multiline
                                editable={false}
                                value={source === 'inquiry' ? item.content : item.reason}
                            />
                        </View>

                        <View style={styles.inputRow}>
                            <Text style={styles.label}>답변</Text>
                            <TextInput
                                style={[styles.textInput, { height: hp('15%') }]}
                                multiline
                                placeholder="답변을 입력해주세요."
                                value={answer}
                                onChangeText={setAnswer}
                            />
                        </View>

                        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
                            <Text style={styles.addButtonText}>답변 보내기</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: hp('2%'),
        paddingBottom: hp('3.7%'),
        paddingHorizontal: wp('5.3%'),
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    formContainer: {
        width: wp('90%'),
        alignSelf: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp('2%'),
    },
    label: {
        width: wp('15%'),
        fontSize: wp('3.7%'),
        fontWeight: '500',
    },
    textInput: {
        flex: 1,
        paddingHorizontal: wp('4%'),
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: wp('3.7%'),
        paddingTop: hp('1.5%'),
        textAlignVertical: 'top',
    },
    addButton: {
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: hp('2%'),
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
