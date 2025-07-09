import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
    Dimensions,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import IMAGES from '../../assets/images';
import COLORS from "../../constants/colors";
import { BASE_URL } from '@env';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width * 0.9;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.6;

export default function JobDetailScreen({ route, navigation }) {
    const [favorites, setFavorites] = useState({});
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const scrollRef = React.useRef();
    const flatListRef = useRef();
    const { job } = route.params;
    const myUserId = 1; // 임시 ID, 실제 사용자 ID로 대체
    const post = { userId: 1 }; // 예시, 실제 post 데이터로 교체

    useEffect(() => {
        console.log('=== 상세 페이지 job 데이터 ===');
        console.log(job);
        console.log('job.images:', job.images);
    }, []);

    const toggleFavorite = (id) => {
        setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // FlatList onViewableItemsChanged 콜백
    const onViewRef = React.useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentImageIndex(viewableItems[0].index);
        }
    });

    const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

    // job.images 배열 처리 (uri 문자열로 변환)
    const imageUris = (job.images?.length > 0 ? job.images : []).map(uri =>
        uri.startsWith('http') ? uri : `${BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/'}${uri}`
    );

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.scrollContent}
                onScroll={(e) => {
                    const offsetY = e.nativeEvent.contentOffset.y;
                    setShowScrollTop(offsetY > 0);
                    if (showOptions) setShowOptions(false);
                }}
                scrollEventThrottle={16}
            >
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{job.title || '제목 없음'}</Text>

                    <TouchableOpacity
                        onPress={() => setShowOptions(prev => !prev)}
                        style={{ padding: 10, marginLeft: 10 }}
                    >
                        <Image
                            source={IMAGES.THREEDOT}
                            resizeMode="contain"
                            style={{ height: 18, width: 18 }}
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

                {/* 사진 슬라이더 영역 */}
                <View style={styles.photoContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={imageUris}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={styles.photo} />
                        )}
                        onViewableItemsChanged={onViewRef.current}
                        viewabilityConfig={viewConfigRef.current}
                    />
                    <View style={styles.pagination}>
                        {imageUris.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentImageIndex === index ? styles.dotActive : null,
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {job.deadline && <View style={styles.tag}><Text style={styles.tagText}>마감: {job.deadline}</Text></View>}
                        {job.career && <View style={styles.tag}><Text style={styles.tagText}>경력: {job.career}</Text></View>}
                        {job.education && <View style={styles.tag}><Text style={styles.tagText}>학력: {job.education}</Text></View>}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>채용 조건 요약</Text>
                    <Text style={styles.text}>{job.summary}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>채용 상세 내용</Text>
                    <Text style={styles.text}>{job.detail}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>기타 조건</Text>
                    <Text style={styles.text}>{job.working_conditions || '정보 없음'}</Text>
                </View>

                {job.disability_requirements && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>장애인 채용 조건</Text>

                        {job.disability_requirements.disabilityGrade && (
                            <Text style={styles.text}>
                                <Text style={styles.boldText}>장애 정도: </Text>
                                {job.disability_requirements.disabilityGrade}
                            </Text>
                        )}
                        {job.disability_requirements.disabilityTypes?.length > 0 && (
                            <Text style={styles.text}>
                                <Text style={styles.boldText}>장애 유형: </Text>
                                {job.disability_requirements.disabilityTypes.join(', ')}
                            </Text>
                        )}
                        {job.disability_requirements.assistiveDevices?.length > 0 && (
                            <Text style={styles.text}>
                                <Text style={styles.boldText}>보조 기구: </Text>
                                {job.disability_requirements.assistiveDevices.join(', ')}
                            </Text>
                        )}
                        {job.disability_requirements.jobInterest?.length > 0 && (
                            <Text style={styles.text}>
                                <Text style={styles.boldText}>직무 관심: </Text>
                                {job.disability_requirements.jobInterest.join(', ')}
                            </Text>
                        )}
                        {job.disability_requirements.preferredWorkType?.length > 0 && (
                            <Text style={styles.text}>
                                <Text style={styles.boldText}>선호 근무 형태: </Text>
                                {job.disability_requirements.preferredWorkType.join(', ')}
                            </Text>
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
        marginBottom: hp('1.2%'),
    },
    title: {
        fontSize: wp('6%'),
        fontWeight: '700',
        color: '#111',
        flexShrink: 1,
    },
    company: {
        fontSize: wp('4.5%'),
        fontWeight: '600',
        marginBottom: hp('0.8%'),
        color: '#444',
    },
    location: {
        fontSize: wp('4%'),
        color: '#666',
        marginBottom: hp('2%'),
        fontWeight: '400',
    },
    photoContainer: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT + 20, // 하단 점까지 공간 확보
        alignSelf: 'center',
        marginBottom: hp('3%'),
    },
    photo: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#bbb',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: COLORS.THEMECOLOR,
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        marginBottom: hp('3%'),
    },
    tag: {
        backgroundColor: '#f0f0f0',
        borderRadius: wp('5%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1%'),
        marginRight: wp('3%'),
        marginBottom: hp('1%'),
        borderWidth: 1,
        borderColor: '#ddd',
    },
    tagText: {
        fontSize: wp('3.8%'),
        color: '#555',
        fontWeight: '500',
    },
    section: {
        marginBottom: hp('3.5%'),
    },
    sectionTitle: {
        fontSize: wp('5.2%'),
        fontWeight: '700',
        marginBottom: hp('1.2%'),
        color: '#222',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: hp('0.5%'),
    },
    text: {
        fontSize: wp('4.3%'),
        color: '#333',
        lineHeight: hp('3.3%'),
    },
    boldText: {
        fontWeight: '700',
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
        paddingVertical: hp('1.8%'),
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButton: {
        backgroundColor: COLORS.THEMECOLOR,
    },
    scrapButton: {
        backgroundColor: '#666',
    },
    scrapActive: {
        backgroundColor: '#FFD700',
    },
    scrapContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrapIcon: {
        marginRight: wp('2.5%'),
    },
    scrapText: {
        color: '#fff',
        fontSize: wp('4.3%'),
        fontWeight: '700',
    },
    buttonText: {
        color: '#fff',
        fontSize: wp('4.3%'),
        fontWeight: '700',
    },
    scrollTopButton: {
        position: 'absolute',
        bottom: hp('10%'),
        right: wp('5%'),
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 25,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    popup: {
        position: 'absolute',
        top: 15,
        right: 30,
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
