import React, { useState } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ScrollView,
    Platform,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function FeedbackScreen() {
    const navigation = useNavigation();
    const [content, setContent] = useState('');
    const [form, setForm] = useState({ email: '' });

    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('서비스 이용 문의');
    const [items, setItems] = useState([
        { label: '서비스 이용 문의', value: '서비스 이용 문의' },
        { label: '오류 신고', value: '오류 신고' },
        { label: '서비스 칭찬', value: '서비스 칭찬' },
    ]);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        console.log('Category:', selectedCategory);
        console.log('Content:', content);
        console.log('Email:', form.email);
    };

    return (
        <View style={styles.container}>
            {/* 문의 내역 이동 버튼 */}
            <TouchableOpacity
                style={styles.historyButton}
                onPress={() => navigation.navigate('InquiryHistoryScreen')}
            >
                <View style={styles.historyButtonContent}>
                    <Text style={styles.historyButtonText}>문의 · 신고 내역</Text>
                    <Ionicons name="chevron-forward" size={20} color="black" />
                </View>
            </TouchableOpacity>

            {/* 폼 영역 */}
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

                {/* 내용 입력 */}
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

                {/* 이메일 입력 */}
                <View style={styles.inputRow}>
                    <Text style={styles.label}>이메일</Text>
                    <TextInput
                        style={styles.inputField}
                        placeholder="example@email.com"
                        keyboardType="email-address"
                        value={form.email}
                        onChangeText={(text) => handleChange('email', text)}
                        autoCapitalize="none"
                    />
                </View>

                {/* 제출 버튼 */}
                <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
                    <Text style={styles.addButtonText}>의견 보내기</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        backgroundColor: 'white',
        paddingBottom: hp('5%'),
    },
    container: {
        paddingTop: hp('2%'),
        paddingHorizontal: 20,
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
    inputField: {
        flex: 1,
        paddingHorizontal: wp('4%'),
        height: hp('5.5%'),
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: wp('3.7%'),
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
