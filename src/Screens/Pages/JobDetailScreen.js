import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import IMAGES from '../../assets/images';
import COLORS from "../../constants/colors";


export default function JobDetailScreen({ route, navigation }) {
    const [favorites, setFavorites] = useState({});
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const scrollRef = useRef();
    const { job } = route.params;
    const myUserId = 1; // 임시 ID, 실제 사용자 ID로 대체
    const post = { userId: 1 }; // 예시, 실제 post 데이터로 교체

    const toggleFavorite = (id) => {
        setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.scrollContent}
                onScroll={(e) => {
                    const offsetY = e.nativeEvent.contentOffset.y;
                    setShowScrollTop(offsetY > 0);
                    if (showOptions) {
                        setShowOptions(false);
                    }
                }}
                scrollEventThrottle={16}
            >
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{job.title || '제목 없음'}</Text>

                    <TouchableOpacity
                        onPress={() => setShowOptions(prev => !prev)}
                        style={{ padding: 5, marginLeft: 5 }}
                    >
                        <Image
                            source={IMAGES.THREEDOT}
                            resizeMode="contain"
                            style={{ height: 13, width: 13 }}
                        />
                    </TouchableOpacity>

                    {showOptions && (
                        <View style={styles.popup}>
                            <TouchableOpacity onPress={() => {
                                setShowOptions(false);
                                console.log("신고하기");
                            }}>
                                <Text style={styles.popupItem}>신고하기</Text>
                            </TouchableOpacity>

                            {myUserId === post.userId && (
                                <>
                                    <View style={styles.popupDivider} />
                                    <TouchableOpacity onPress={() => {
                                        setShowOptions(false);
                                        navigation.navigate('FreeBoardEditPage', { postId: job.id });
                                    }}>
                                        <Text style={styles.popupItem}>수정하기</Text>
                                    </TouchableOpacity>

                                    <View style={styles.popupDivider} />
                                    <TouchableOpacity onPress={() => {
                                        setShowOptions(false);
                                        // 삭제 로직 호출
                                        console.log("삭제하기");
                                    }}>
                                        <Text style={styles.popupItem}>삭제하기</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                </View>

                <Text style={styles.company}>{job.company || '회사명 없음'}</Text>
                <Text style={styles.location}>{job.location || '위치 정보 없음'}</Text>


                <View style={styles.photoView}>
                    <ScrollView horizontal>
                        {(post.imageUrls?.length > 0 ? post.imageUrls : []).map((uri, index) => {
                            const fullUri = uri.startsWith("http") ? uri : `${BASE_URL}${uri}`;
                            return (
                                <Image
                                    key={index}
                                    source={{ uri: fullUri }}
                                    style={styles.photo}
                                    resizeMode="cover"
                                />
                            );
                        })}
                    </ScrollView>
                </View>


                <View style={styles.infoRow}>
                    {job.deadline && <View style={styles.tag}><Text style={styles.tagText}>마감: {job.deadline}</Text></View>}
                    {job.career && <View style={styles.tag}><Text style={styles.tagText}>경력: {job.career}</Text></View>}
                    {job.education && <View style={styles.tag}><Text style={styles.tagText}>학력: {job.education}</Text></View>}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>채용 조건 요약</Text>
                    <Text style={styles.text}>{job.summary?.trim() || '요약 정보가 없습니다.'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>채용 상세 내용</Text>
                    <Text style={styles.text}>{job.detail?.trim() || '상세 내용이 없습니다.'}</Text>
                </View>

                {job.condition && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>조건</Text>
                        <Text style={styles.text}>{job.condition}</Text>
                    </View>
                )}

                {job.jobConditions && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>장애인 채용 조건</Text>
                        {job.jobConditions.disabilityGrade && (
                            <Text style={styles.text}>장애 정도: {job.jobConditions.disabilityGrade}</Text>
                        )}
                        {job.jobConditions.disabilityTypes?.length > 0 && (
                            <Text style={styles.text}>장애 유형: {job.jobConditions.disabilityTypes.join(', ')}</Text>
                        )}
                        {job.jobConditions.assistiveDevices?.length > 0 && (
                            <Text style={styles.text}>보조 기구: {job.jobConditions.assistiveDevices.join(', ')}</Text>
                        )}
                        {job.jobConditions.jobInterest?.length > 0 && (
                            <Text style={styles.text}>직무 관심: {job.jobConditions.jobInterest.join(', ')}</Text>
                        )}
                        {job.jobConditions.preferredWorkType?.length > 0 && (
                            <Text style={styles.text}>선호 근무 형태: {job.jobConditions.preferredWorkType.join(', ')}</Text>
                        )}
                    </View>
                )}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.scrapButton,
                        favorites[job.id] && styles.scrapActive,
                        { flex: 1 }
                    ]}
                    onPress={() => toggleFavorite(job.id)}
                >
                    <View style={styles.scrapContent}>
                        <Icon
                            name={favorites[job.id] ? 'bookmark' : 'bookmark-o'}
                            size={20}
                            color={favorites[job.id] ? '#FFD700' : '#fff'}
                            style={styles.scrapIcon}
                        />
                        <Text style={styles.scrapText}>스크랩</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.applyButton, { flex: 2 }]}
                >
                    <Text style={styles.buttonText}>지원하기</Text>
                </TouchableOpacity>
            </View>

            {showScrollTop && (
                <TouchableOpacity
                    style={styles.scrollTopButton}
                    onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
                >
                    <Ionicons name="chevron-up" size={24} color="black" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: wp('6%'),
        paddingTop: hp('3%'),
        paddingBottom: hp('20%'),
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp('1%'),
    },
    title: {
        fontSize: wp('6.5%'),
        fontWeight: 'bold',
        color: '#111',
        flexShrink: 1,
    },
    company: {
        fontSize: wp('5%'),
        marginBottom: hp('0.3%'),
        color: '#555',
    },
    location: {
        fontSize: wp('4.5%'),
        marginBottom: hp('1.5%'),
        color: '#666',
    },
    photoView: {
        flexDirection: "row",
        width: wp("100%"),
        height: wp("55%"),
    },
    photo: {
        width: wp("80%"),
        height: wp("55%"),
        marginRight: wp("1%"),
        backgroundColor: "#f0f0f0",
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: hp('3%'),
        gap: wp('2%'),
    },
    tag: {
        backgroundColor: '#e0e0e0',
        borderRadius: wp('3%'),
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('0.8%'),
        marginRight: wp('2%'),
        marginBottom: hp('0.8%'),
    },
    tagText: {
        fontSize: wp('3.7%'),
        color: '#444',
    },
    section: {
        marginBottom: hp('3%'),
    },
    sectionTitle: {
        fontSize: wp('5%'),
        fontWeight: '600',
        marginBottom: hp('1%'),
        color: '#222',
    },
    text: {
        fontSize: wp('4.2%'),
        color: '#333',
        lineHeight: hp('3%'),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('1.5%'),
        position: 'absolute',
        bottom: hp('2%'),
        width: wp('100%'),
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    button: {
        backgroundColor: '#999',
        marginHorizontal: wp('2%'),
        paddingVertical: hp('1.5%'),
        borderRadius: 10,
        alignItems: 'center',
    },
    applyButton: {
        backgroundColor: COLORS.THEMECOLOR
    },
    scrapButton: {
        backgroundColor: '#999',
    },
    scrapActive: {
        backgroundColor: '#555',
    },
    scrapContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrapIcon: {
        marginRight: wp('2%'),
    },
    scrapText: {
        color: '#fff',
        fontSize: wp('4.3%'),
        fontWeight: '600',
    },
    buttonText: {
        color: '#fff',
        fontSize: wp('4.3%'),
        fontWeight: '600',
    },
    scrollTopButton: {
        position: 'absolute',
        bottom: hp('10%'),
        right: wp('5%'),
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 25,
        width: 45,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    popup: {
        position: 'absolute',
        top: 5,
        right: 20,
        backgroundColor: 'white',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 1000,
        minWidth: 70,
    },
    popupItem: {
        fontSize: wp('3.5%'),
        paddingVertical: 5,
        color: "#333",
    },
    popupDivider: {
        height: 1,
        backgroundColor: '#ddd',
    },
});
