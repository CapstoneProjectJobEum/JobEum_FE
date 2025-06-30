import React from 'react';
import MemberMyScreen from './MemberMyScreen'; // 회원용 화면 컴포넌트
import CompanyMyScreen from './CompanyMyScreen'; // 기업용 화면 컴포넌트

export default function MyScreenWrapper({ userType }) {
    if (userType === '개인회원') {
        return <MemberMyScreen />;
    }
    return <CompanyMyScreen />;
}
