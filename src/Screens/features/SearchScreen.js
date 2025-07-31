import React, { useState } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    TextInput,
    Keyboard,
    ScrollView,
} from "react-native";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function SearchingPage({ navigation }) {
    const [recentSearches, setRecentSearches] = useState(["토익", "토스", "오픽"]);
    const [searchTerm, setSearchTerm] = useState("");

    const removeSearch = (term) => {
        setRecentSearches(recentSearches.filter((item) => item !== term));
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        Keyboard.dismiss();
        if (!recentSearches.includes(searchTerm)) {
            setRecentSearches([searchTerm, ...recentSearches]);
        }
        navigation.navigate("SearchOutput", { keyword: searchTerm });
        setSearchTerm("");
    };

    const handleTagPress = (term) => {
        Keyboard.dismiss();
        if (!recentSearches.includes(term)) {
            setRecentSearches([term, ...recentSearches]);
        }
        navigation.navigate("SearchOutput", { keyword: term });
        setSearchTerm("");
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.searchWrapper}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="검색어를 입력하세요."
                    placeholderTextColor="gray"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity onPress={handleSearch} hitSlop={10}>
                    <Feather name="search" size={20} color={"#000"} />
                </TouchableOpacity>
            </View>

            <View style={styles.viewContainer}>
                <Text style={styles.searchTitle}>최근 검색</Text>
                <View style={styles.tagContainer}>
                    {recentSearches.length === 0 ? (
                        <Text style={styles.emptyText}>최근 검색어가 없습니다.</Text>
                    ) : (
                        recentSearches.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => handleTagPress(item)}
                                style={styles.recentTag}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.recentSearch}>{item}</Text>
                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        removeSearch(item);
                                    }}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close" size={16} color="#999" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
        backgroundColor: '#FFF',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#000',
        borderWidth: 2,
        borderRadius: wp('2%'),
        paddingHorizontal: wp('4%'),
        height: hp('5%'),
        marginBottom: hp('2%'),
        backgroundColor: '#fff',
    },
    searchInput: {
        flex: 1,
        fontSize: wp('3.8%'),
        color: '#000',
        fontWeight: '500',
        marginRight: wp('2%'),
    },
    viewContainer: {
        paddingHorizontal: wp('1%'),
        paddingTop: hp('2.5%'),
    },
    searchTitle: {
        fontSize: wp('4.5%'),
        fontWeight: "800",
        marginBottom: hp('1.5%'),
    },
    tagContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: hp('2%'),
    },
    recentTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderColor: "#d3d3d3",
        borderWidth: 1,
        borderRadius: wp('10%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1%'),
        marginRight: wp('2.5%'),
        marginBottom: hp('1.5%'),
    },
    recentSearch: {
        fontSize: wp('3.4%'),
        marginRight: wp('2%'),
    },
    emptyText: {
        fontSize: wp('3.5%'),
        color: '#999',
        paddingVertical: hp('1%'),
    },
});
