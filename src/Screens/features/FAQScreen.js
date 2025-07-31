import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 공통 FAQ
const commonFAQ = [
    {
        question: "알림을 끄거나 다시 설정하려면 어떻게 하나요?",
        answer: "설정 > 알림 설정에서 원하는 항목만 개별적으로 ON/OFF 설정할 수 있습니다.",
    },
    {
        question: "비밀번호를 바꾸고 싶어요.",
        answer: "설정 > 비밀번호 변경 메뉴에서 현재 비밀번호를 입력 후 새 비밀번호로 변경할 수 있습니다.",
    },
    {
        question: "계정을 탈퇴하려면 어떻게 하나요?",
        answer: "설정 > 탈퇴하기 메뉴를 통해 본인 확인 후 계정을 탈퇴할 수 있습니다.",
    },
    {
        question: "고객센터는 어디 있나요?",
        answer: "설정 또는 메뉴 하단에서 '고객센터' 메뉴를 통해 문의할 수 있습니다.",
    },
    {
        question: "로그아웃은 어디서 하나요?",
        answer: "설정 또는 메뉴 하단에서 '로그아웃'을 누르면 로그아웃됩니다.",
    },
    {
        question: "앱 이용 중 오류가 발생했어요.",
        answer: "고객센터에 문의하거나 최신 버전으로 업데이트되어 있는지 확인해주세요.",
    },
];

// 개인 회원용 FAQ
const personalFAQ = [
    {
        question: "AI 추천은 어떻게 작동하나요?",
        answer: "설정한 맞춤정보(희망 직무, 지역, 경력 등)를 기반으로 가장 적합한 채용 공고를 AI가 자동 분석하여 추천합니다.",
    },
    {
        question: "맞춤 채용공고와 일반 채용공고의 차이는 무엇인가요?",
        answer: "맞춤 채용공고는 사용자의 설정을 바탕으로 자동 필터링된 공고이며, 일반 채용공고는 전체 공고를 카테고리별로 보여줍니다.",
    },
    {
        question: "관심 기업을 등록하면 어떤 점이 좋은가요?",
        answer: "관심 기업의 신규 채용 소식을 빠르게 알림으로 받아볼 수 있으며, MY 페이지에서 한눈에 관리할 수 있습니다.",
    },
    {
        question: "관심 공고를 삭제하고 싶어요.",
        answer: "MY > 관심 공고 메뉴에서 삭제하고 싶은 공고 옆의 삭제 버튼을 누르세요.",
    },
    {
        question: "최근 본 공고는 자동 저장되나요?",
        answer: "네, 최근에 확인한 공고는 자동으로 MY > 최근 본 공고에 저장됩니다.",
    },
    {
        question: "지원한 이력서를 다시 확인할 수 있나요?",
        answer: "지원한 공고 상세에서 이력서 내용을 확인할 수 있으며, 마감 전이라면 수정 후 재제출도 가능합니다.",
    },
    {
        question: "이력서 여러 개 등록 가능한가요?",
        answer: "가능합니다. 이력서를 여러 개 작성해두고 지원 시 원하는 이력서를 선택할 수 있습니다.",
    },
    {
        question: "맞춤정보를 변경하고 싶어요.",
        answer: "MY > 맞춤정보 설정에서 직무, 지역, 경력 등을 언제든지 수정할 수 있습니다.",
    },
    {
        question: "채용공고 검색은 어떻게 하나요?",
        answer: "채용공고 탭 상단의 검색창에서 키워드 또는 필터(지역, 직무 등)를 선택해 검색할 수 있습니다.",
    },
    {
        question: "지원 결과는 어디서 확인하나요?",
        answer: "MY > 지원 현황에서 합격/불합격 여부 및 결과 처리 상태를 확인할 수 있습니다.",
    },
    {
        question: "지원 취소는 가능한가요?",
        answer: "공고 마감 전이라면 지원 현황 페이지에서 취소 버튼을 눌러 취소할 수 있습니다.",
    },
];

// 기업 회원용 FAQ
const companyFAQ = [
    {
        question: "채용 공고는 몇 개까지 등록할 수 있나요?",
        answer: "공고 개수 제한은 없으며, 자유롭게 등록 후 관리하실 수 있습니다.",
    },
    {
        question: "지원자 현황은 실시간으로 확인 가능한가요?",
        answer: "네, 공고에 지원이 들어올 경우 즉시 '지원자 관리' 메뉴에 반영됩니다.",
    },
    {
        question: "등록한 공고는 언제부터 노출되나요?",
        answer: "보통 1~3시간 이내에 검수 후 노출되며, 검수 완료 시 알림이 전송됩니다.",
    },
    {
        question: "지원자에게 연락하려면 어떻게 하나요?",
        answer: "지원자 상세정보에서 연락처 또는 이메일을 통해 직접 연락하실 수 있습니다.",
    },
    {
        question: "공고를 임시 저장할 수 있나요?",
        answer: "공고 작성 중 '임시 저장' 버튼을 누르면 추후 수정 후 등록할 수 있습니다.",
    },
    {
        question: "공고 마감일 이후에도 지원자가 들어올 수 있나요?",
        answer: "아니요. 마감일이 지나면 해당 공고는 자동으로 종료되어 지원이 불가능합니다.",
    },
    {
        question: "기업 정보는 어디서 수정하나요?",
        answer: "MY > 기업 정보 수정 메뉴에서 로고, 회사 소개, 주소 등을 변경할 수 있습니다.",
    },
    {
        question: "채용공고를 비공개로 전환하고 싶어요.",
        answer: "공고 수정 화면에서 '비공개 설정'을 선택하면 해당 공고는 외부에 노출되지 않습니다.",
    },
    {
        question: "지원자의 이력서는 어디서 다운로드하나요?",
        answer: "지원자 상세정보 화면에서 이력서를 다운로드할 수 있습니다.",
    },
];

export default function FAQScreen() {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [faqData, setFaqData] = useState([]);
    const [userType, setUserType] = useState(null); // 디버깅용

    const toggleExpand = (index) => {
        setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    const loadUserType = async () => {
        try {
            const userInfoString = await AsyncStorage.getItem("userInfo");
            if (!userInfoString) return;

            const userInfo = JSON.parse(userInfoString);
            const type = userInfo.userType;

            if (type === "개인회원") {
                setFaqData([...commonFAQ, ...personalFAQ]);
                setUserType("개인회원");
            } else if (type === "기업회원") {
                setFaqData([...commonFAQ, ...companyFAQ]);
                setUserType("기업회원");
            } else {
                setFaqData([...commonFAQ]);
                setUserType("알수없음");
            }
        } catch (error) {
            console.error("FAQ 로드 실패:", error);
        }
    };


    useEffect(() => {
        loadUserType();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {faqData.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.faqItem}
                        onPress={() => toggleExpand(index)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.question}>Q. {item.question}</Text>
                        {expandedIndex === index && (
                            <Text style={styles.answer}>A. {item.answer}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        padding: 16,
    },
    faqItem: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 10,
    },
    question: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    answer: {
        marginTop: 8,
        fontSize: 15,
        color: "#555",
        lineHeight: 20,
    },
    debugText: {
        fontSize: 12,
        color: "#aaa",
        marginBottom: 10,
    },
});
