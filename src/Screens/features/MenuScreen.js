import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function MenuScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { userType = '개인회원' } = route.params || {};

    const isMember = userType === '개인회원';
    const isCompany = userType === '기업회원';

    return (
        <ScrollView style={styles.container}>
            {/* 채용공고 */}
            <Text style={styles.sectionTitle}>채용공고</Text>
            <View style={styles.gridContainer}>
                <TouchableOpacity style={styles.gridItem}><Text>지역별</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}><Text>직무별</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}><Text>AI추천</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}><Text>TOP10</Text></TouchableOpacity>
            </View>

            {/* MY */}
            <Text style={styles.sectionTitle}>MY</Text>
            <View style={styles.gridContainer}>
                {isMember && (
                    <>
                        <TouchableOpacity style={styles.gridItem}><Text>최근 본 공고</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.gridItem}><Text>지원 현황</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.gridItem}><Text>관심 공고</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.gridItem}><Text>관심 기업</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.gridItem}><Text>이력서 관리</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.gridItem}><Text>맞춤정보설정</Text></TouchableOpacity>
                    </>
                )}
                {isCompany && (
                    <>
                        <TouchableOpacity style={styles.gridItem}><Text>채용공고 관리</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.gridItem}><Text>지원자 현황</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.gridItem}><Text>기업 정보 수정</Text></TouchableOpacity>
                    </>
                )}
            </View>

            {/* 설정 */}
            <Text style={styles.sectionTitle}>설정</Text>
            <View style={styles.gridContainer}>
                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => navigation.navigate('AccountInfoScreen')}
                >
                    <Text>계정 정보</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}><Text>비밀번호 변경</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}><Text>알림 설정</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}><Text>로그인 / 로그아웃</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}><Text>탈퇴하기</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}><Text>고객센터</Text></TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
        color: '#333',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        backgroundColor: '#fff',
        paddingVertical: 16,
        marginBottom: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
});