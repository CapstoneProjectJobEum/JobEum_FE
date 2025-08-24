import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { io } from 'socket.io-client';
import { BASE_URL } from '@env';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const [socket, setSocket] = useState(null);

    // DB에서 읽지 않은 알림 수 조회
    const fetchUnread = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            const res = await axios.get(`${BASE_URL}/api/notifications`, {
                params: { unreadOnly: 'true' },
                headers: { Authorization: `Bearer ${token}` },
            });

            // total 혹은 length 확인
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

            fetchUnread(); // 읽은 후 빨간점 갱신
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

    // 초기 조회
    useEffect(() => {
        fetchUnread();
    }, []);

    // 소켓 연결
    useEffect(() => {
        const connectSocket = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            const s = io(BASE_URL, { auth: { token }, transports: ['websocket'] });
            s.on('notification:new', fetchUnread);
            setSocket(s);
        };

        connectSocket();

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    return (
        <NotificationContext.Provider
            value={{ hasNewNotification, fetchUnread, markAsRead, markAllAsRead }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
