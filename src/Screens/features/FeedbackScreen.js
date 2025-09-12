import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Alert, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

export default function FeedbackScreen() {
    const navigation = useNavigation();
    const [content, setContent] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('서비스 이용 문의');
    const [items, setItems] = useState([
        { label: '서비스 이용 문의', value: '서비스 이용 문의' },
        { label: '오류 신고', value: '오류 신고' },
        { label: '서비스 칭찬', value: '서비스 칭찬' },

    ]);

    const apiMap = {
        '서비스 이용 문의': {
            url: `${BASE_URL}/api/inquiries`,
            type: 'SERVICE',
            title: '서비스 이용 문의',
        },
        '오류 신고': {
            url: `${BASE_URL}/api/inquiries`,
            type: 'BUG',
            title: '오류 신고',
        },
        '서비스 칭찬': {
            url: `${BASE_URL}/api/inquiries`,
            type: 'PRAISE',
            title: '서비스 칭찬',
        },
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            Alert.alert('알림', '내용을 입력해주세요.');
            return;
        }

        const apiInfo = apiMap[selectedCategory];
        if (!apiInfo) {
            Alert.alert('알림', '지원하지 않는 문의 유형입니다.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                Alert.alert('알림', '로그인이 필요합니다.');
                return;
            }

            const body = {
                type: apiInfo.type,
                title: apiInfo.title,
                content: content.trim(),
            };

            const response = await axios.post(apiInfo.url, body, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                Alert.alert('성공', '접수되었습니다.');
                setContent('');
            } else {
                Alert.alert('실패', response.data.message || '접수 실패');
            }
        } catch (error) {
            if (error.response) {
                console.error('Axios Response Error:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('Axios Request Error:', error.request);
            } else {
                console.error('Axios Error:', error.message);
            }
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['left', 'right']}>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => navigation.navigate('InquiryHistoryScreen')}
                >
                    <View style={styles.historyButtonContent}>
                        <Text style={styles.historyButtonText}>문의 · 신고 내역</Text>
                        <Ionicons name="chevron-forward" size={20} color="black" />
                    </View>
                </TouchableOpacity>

                <View style={styles.formContainer}>
                    <DropDownPicker
                        open={open}
                        value={selectedCategory}
                        items={items}
                        setOpen={setOpen}
                        setValue={setSelectedCategory}
                        setItems={setItems}
                        placeholder="문의 유형을 선택하세요"
                        style={styles.dropdown}
                        textStyle={styles.dropdownText}
                        dropDownContainerStyle={styles.dropdownBox}
                        listItemContainerStyle={styles.dropdownItem}
                        selectedItemContainerStyle={styles.selectedItem}
                        selectedItemLabelStyle={styles.selectedItemText}
                        showTickIcon={false}
                    />

                    <View style={styles.inputRow}>
                        <Text style={styles.label}>내용</Text>
                        <TextInput
                            style={[styles.textInput, { height: hp('15%') }]}
                            multiline
                            placeholder="문의 내용을 입력해주세요."
                            value={content}
                            onChangeText={setContent}
                        />
                    </View>

                    <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
                        <Text style={styles.addButtonText}>의견 보내기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: hp('2%'),
        paddingBottom: hp('3.7%'),
        alignItems: 'center',
        paddingHorizontal: wp('5.3%'),
    },
    historyButton: {
        borderColor: '#ccc',
        borderWidth: 1,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: hp('2%'),
    },
    historyButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    historyButtonText: {
        fontSize: wp('3.8%'),
    },
    formContainer: {
        width: wp('90%'),
        alignSelf: 'center',
    },
    dropdown: {
        borderColor: '#ccc',
        borderRadius: 0,
        marginBottom: hp('2%'),
        zIndex: 1000,
    },
    dropdownText: {
        fontSize: wp('3.8%'),
    },
    dropdownBox: {
        borderRadius: 0,
        borderColor: '#ccc',
        zIndex: 999,
    },
    dropdownItem: {
        paddingVertical: hp('1%'),
    },
    selectedItem: {
        backgroundColor: '#D3D3D350',
    },
    selectedItemText: {
        fontWeight: 'bold',
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
