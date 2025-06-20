import React from 'react';
import { View, } from 'react-native';
import JobList from '../shared/JobList';

const JobListScreen = () => {
    return (
        <View style={{ flex: 1, backgroundColor: '#F8F9FA', }}>
            <JobList
                apiUrl="http://10.106.2.70:4000/api/jobs"
                fallbackData={[
                    { id: '1', company: '삼성', location: '서울', title: '백엔드 개발자', career: '무관', education: '학사', deadline: '2025-07-01' },
                    { id: '2', company: '삼성', location: '서울', title: '백엔드 개발자', career: '무관', education: '학사', deadline: '2025-07-01' }
                ]}

            />
        </View>
    );
};

export default JobListScreen;
