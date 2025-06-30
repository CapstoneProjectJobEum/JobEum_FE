import React from 'react';
import { View, } from 'react-native';
import JobList from '../shared/JobList';

export default function AppliedJobsScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: '#F8F9FA', }}>
            <JobList
                apiUrl="http://192.168.0.19:4000/api/applied-jobs" // 지원한 공고 전용 API
                fallbackData={[
                    {
                        id: '1',
                        company: '삼성전자',
                        location: '서울',
                        title: '백엔드 개발자',
                        career: '무관',
                        education: '학사',
                        deadline: '2025-07-01',
                        appliedDate: '2025-06-01',
                        status: '서류 심사중',
                    },
                ]} ㅌㅈ
                type="applied"
            />
        </View>
    );
}