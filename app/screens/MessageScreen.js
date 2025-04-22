import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';  // Thêm useFocusEffect
import { LinearGradient } from 'expo-linear-gradient';
import chatService from '../services/chatService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessageScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [myId, setMyId] = useState(null);

  // Fetch messages when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchMessages = async () => {
        const res = await chatService.getHistoryByUserId();
        if (res.isSuccess) {
          const data = res.data.map((item, index) => ({
            id: item.chatId || index.toString(),
            sender: item.receiver?.username || 'Unknown',
            userId: item.receiver?.id,
            message: item.latestMessage || '',
            description: '',
            avatar: item.receiver?.avatar
              ? { uri: item.receiver.avatar }
              : require('../assets/logoEasyRommie.png'),
            time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: false,
            online: false,
          }));
          setMessages(data);
        }
      };
      fetchMessages();
    }, [])  // Empty dependency array ensures it runs only when tab is focused
  );

  useEffect(() => {
    const getMyIdAndMessages = async () => {
      try {
        const currentUserId = await AsyncStorage.getItem('userId');
        if (!currentUserId) return;
        setMyId(currentUserId);
  
        const res = await chatService.getHistoryByUserId(); 
        if (res.isSuccess) {
          const data = res.data.map((item, index) => ({
            id: item.chatId || index.toString(),
            sender: item.receiver?.username || 'Unknown',
            userId: item.receiver?.id,
            message: item.latestMessage || '',
            description: '',
            avatar: item.receiver?.avatar
              ? { uri: item.receiver.avatar }
              : require('../assets/logoEasyRommie.png'),
            time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: false,
            online: false,
          }));
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
  
    getMyIdAndMessages();
  }, []); // Initial load once

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() =>
        navigation.navigate('Chat', {
          userName: item.sender,
          avatar: item.avatar,
          userId: item.userId,
          myId: myId, // truyền myId sang ChatScreen
        })
      }
    >
      <View style={styles.avatarContainer}>
        <Image source={item.avatar} style={styles.avatar} />
        {item.online && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <View style={styles.senderContainer}>
            <Text style={styles.senderName}>{item.sender}</Text>
            {item.unread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>New</Text>
              </View>
            )}
          </View>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
        <Text style={[styles.messageText, item.unread && styles.unreadMessage]} numberOfLines={1}>
          {item.message}
        </Text>
        <Text style={styles.messageDescription} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#ACDCD0', '#ACDCD0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <FontAwesome5 name="edit" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingVertical: 8,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#F0EDF6',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#6D5BA3',
    borderRadius: 12,
  },
  unreadText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  messageDescription: {
    fontSize: 13,
    color: '#999',
  },
});

export default MessageScreen;
