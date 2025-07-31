import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
} from 'react-native';
import COLORS from '../../constants/colors';


export default function InquiryHistoryScreen() {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const feedbackList = [
        {
            category: '서비스 이용 문의',
            question: '앱 사용 중 로그인이 자꾸 풀려요. 자동 로그인 기능이 있나요?',
            answer: '현재 자동 로그인 기능은 준비 중이며, 다음 업데이트에 반영될 예정입니다.',
        },
        {
            category: '오류 신고',
            question:
                '문의 내용이 아주아주 길어질 경우 화면이 어떻게 반응하는지 확인해보고 싶습니다. 예를 들어서 이 텍스트가 여러 줄을 차지하고도 더 늘어날 경우, 전체가 다 보이면 UI가 깨질 수 있기 때문에 특정 줄 수까지만 보여주고 나머지는 더보기로 처리하는 방식이 좋은 것 같습니다. 이를 통해 UX를 개선할 수 있습니다.',
            answer: '좋은 제안 감사합니다. 해당 방식으로 개선하겠습니다.',
        },
        {
            category: '서비스 칭찬',
            question: '서비스가 너무 좋아요! 개발자분 최고!',
            answer: '',
        },
    ];

    const toggleExpand = (index) => {
        setExpandedIndex(prev => (prev === index ? null : index));
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.categoryLabel}>[{item.category}]</Text>

            <Text
                style={styles.question}
                numberOfLines={expandedIndex === index ? undefined : 1}
            >
                {item.question}
            </Text>

            <Text style={styles.answerTitle}>답변</Text>
            {item.answer ? (
                <Text style={styles.answer}
                    numberOfLines={expandedIndex === index ? undefined : 1}>{item.answer}</Text>
            ) : (
                <Text style={styles.answerEmpty}>아직 답변이 없습니다.</Text>
            )}

            <TouchableOpacity onPress={() => toggleExpand(index)}>
                <Text style={styles.toggleText}>
                    {expandedIndex === index ? '접기' : '더보기'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>문의 · 신고 내역</Text>
            <FlatList
                data={feedbackList}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    itemContainer: {
        marginBottom: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    categoryLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#444',
        marginBottom: 4,
    },
    question: {
        fontSize: 16,
        fontWeight: '400',
        color: '#333',
    },
    answerTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 4,
        color: '#666',
    },
    answer: {
        fontSize: 15,
        color: '#444',
    },
    answerEmpty: {
        fontSize: 15,
        fontStyle: 'italic',
        color: '#999',
    },
    toggleText: {
        color: COLORS.THEMECOLOR,
        fontSize: 14,
        marginTop: 6,
        textAlign: 'right',
    },
});
