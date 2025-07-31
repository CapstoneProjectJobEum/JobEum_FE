import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import COLORS from '../../constants/colors';

import RegionFilter from './filters/RegionFilter';
import JobFilter from './filters/JobFilter';
import CareerFilter from './filters/CareerFilter';
import EducationFilter from './filters/EducationFilter';
import CompanyTypeFilter from './filters/CompanyTypeFilter';
import EmploymentTypeFilter from './filters/EmploymentTypeFilter';
import PersonalizedFilter from './filters/PersonalizedFilter';
import FilterMenuScreen from './filters/FilterMenuScreen';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.7;

export default function FilterModal({
    visible,
    onClose,
    title,
    onReset,
    onApply,
    fromConditionMenu,
    setFromConditionMenu,
    onSelectFilterFromMenu,
    ...props
}) {
    const renderFilterContent = () => {
        switch (title) {
            case '직무': return <JobFilter {...props} />;
            case '지역': return <RegionFilter {...props} />;
            case '경력': return <CareerFilter {...props} />;
            case '학력': return <EducationFilter {...props} />;
            case '기업형태': return <CompanyTypeFilter {...props} />;
            case '고용형태': return <EmploymentTypeFilter {...props} />;
            case '맞춤정보': return <PersonalizedFilter {...props} />;
            case '조건추가': return (
                <FilterMenuScreen
                    onClose={onClose}
                    onSelectFilter={onSelectFilterFromMenu}
                    {...props}
                />
            );
            default:
                return <Text style={{ marginTop: 20 }}>‘{title}’ 필터는 준비 중입니다.</Text>;
        }
    };

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.backdrop} pointerEvents="none" />
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {fromConditionMenu && title !== '조건추가' && (
                                <TouchableOpacity
                                    onPress={() => {
                                        onSelectFilterFromMenu('조건추가');
                                        setFromConditionMenu(false);
                                    }}
                                    style={{ marginRight: 10 }}
                                >
                                    <Ionicons name="chevron-back" size={24} color="black" />
                                </TouchableOpacity>
                            )}
                            <Text style={styles.title}>{title}</Text>
                        </View>

                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.body}>{renderFilterContent()}</View>

                    <View style={styles.bottomButtons}>
                        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
                            <Ionicons name="refresh" size={22} color="black" style={{ marginRight: 5 }} />
                            <Text style={styles.resetText}>조건 초기화</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.applyButton} onPress={onApply}>
                            <Text style={styles.applyText}>결과보기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
    modalContent: {
        height: MODAL_HEIGHT,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 15,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
    },
    title: { fontSize: 18, fontWeight: 'bold' },
    body: { flex: 1 },
    bottomButtons: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 10,
        paddingBottom: 10,
    },
    resetButton: {
        flex: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginRight: 10,
    },
    resetText: { fontSize: 16, color: 'black' },
    applyButton: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.THEMECOLOR,
        paddingVertical: 10,
        borderRadius: 8,
        marginLeft: 5,
    },
    applyText: { fontSize: 16, color: 'white', fontWeight: 'bold' },
});
