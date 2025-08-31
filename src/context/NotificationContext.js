import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const [socket, setSocket] = useState(null);

    /** ---------------- DB 관련 ---------------- **/

    // DB에서 읽지 않은 알림 수 조회
    const fetchUnread = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            const res = await axios.get(`${BASE_URL}/api/notifications`, {
                params: { unreadOnly: 'true' },
                headers: { Authorization: `Bearer ${token}` },
            });

            const unreadCount = res.data.total ?? res.data.data?.length ?? 0;
            setHasNewNotification(unreadCount > 0);
        } catch (err) {
            console.error('[NotificationContext] fetchUnread 실패', err);
        }
    };

    // 개별 알림 읽음 처리
    const markAsRead = async (id) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            await axios.patch(`${BASE_URL}/api/notifications/${id}/read`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchUnread();
        } catch (err) {
            console.error('[NotificationContext] markAsRead 실패', err);
        }
    };

    // 전체 읽음 처리
    const markAllAsRead = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            await axios.patch(`${BASE_URL}/api/notifications/read-all`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchUnread();
        } catch (err) {
            console.error('[NotificationContext] markAllAsRead 실패', err);
        }
    };

    /** ---------------- 소켓 관련 ---------------- **/

    // 소켓 연결
    const connectSocket = async (token) => {
        if (!token) return;

        // 기존 소켓 종료
        if (socket) {
            socket.disconnect();
        }

        const s = io(BASE_URL, { auth: { token }, transports: ['websocket'] });
        s.on('notification:new', fetchUnread);
        setSocket(s);
    };

    // 로그인 직후 소켓 초기화
    const initSocketAfterLogin = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        await connectSocket(token);
    };

    /** ---------------- 상태 초기화 ---------------- **/

    // 로그아웃 시 호출: 소켓 종료 + 빨간점 초기화
    const resetNotificationState = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        setHasNewNotification(false);
    };

    /** ---------------- 초기 조회 ---------------- **/

    useEffect(() => {
        fetchUnread();
    }, []);

    useEffect(() => {
        const initSocket = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            await connectSocket(token);
        };
        initSocket();

        // 언마운트 시 소켓 종료
        return () => socket?.disconnect();
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                hasNewNotification,
                fetchUnread,
                markAsRead,
                markAllAsRead,
                socket,
                initSocketAfterLogin,
                resetNotificationState, // 추가
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
