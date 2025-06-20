import React from 'react';
import { View, } from 'react-native';
import JobList from '../shared/JobList';

const RecentAnnouncementsScreen = () => {
    return (
        <View style={{ flex: 1, backgroundColor: '#F8F9FA', }}>
            <JobList
                type="recent"
                apiUrl="http://192.168.0.19:4000/api/jobs"
                fallbackData={[
                    { id: '1', company: '삼성', location: '서울', title: '백엔드 개발자', deadline: '2025-07-01' },
                    { id: '2', company: '카카오', location: '판교', title: '프론트엔드 개발자', deadline: '2025-07-10' },
                    { id: '3', company: '네이버', location: '분당', title: '안드로이드 개발자', deadline: '2025-07-15' },
                    // ... 최대 10개
                ]}
            />
        </View>
    );
};

export default RecentAnnouncementsScreen;