import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const MessageScreen = () => {
  const navigation = useNavigation();
  
  const messages = [
    {
      id: '1',
      sender: 'Landlord1',
      message: 'Cho chủ thuê phòng này nhé',
      description: 'Không biết giá đó có thấp đối với bạn không chủ',
      avatar: require('../assets/logoEasyRommie.png'),
      time: 'Aug 21 - 25, 2023',
      unread: true,
      online: true,
    },
    {
      id: '2',
      sender: 'Customer',
      message: 'Mình có thấy bạn đang đăng bài kiếm người ở ghép',
      description: 'Cho mình ở ghép với nhá',
      avatar: require('../assets/logoEasyRommie.png'),
      time: '2 hours ago',
      unread: false,
      online: true,
    },
    {
      id: '3',
      sender: 'Airbnb Support',
      message: 'Mình có thấy bạn đang đăng bài kiếm người ở ghép',
      description: 'Cho mình ở ghép với nhá',
      avatar: require('../assets/logoEasyRommie.png'),
      time: '3 hours ago',
      unread: false,
      online: false,
    },
    {
      id: '4',
      sender: 'Joe',
      message: 'New event',
      description: 'Unavailable',
      avatar: require('../assets/logoEasyRommie.png'),
      time: 'Aug 21 - 25, 2023',
      unread: false,
      online: false,
    },
    {
      id: '5',
      sender: 'Airbnb Support',
      message: 'If you leave this message thread, you',
      description: 'can get back to it from your Airbnb',
      avatar: require('../assets/logoEasyRommie.png'),
      time: '5 hours ago',
      unread: false,
      online: true,
    },
    {
      id: '6',
      sender: 'Airbnb Support',
      message: 'Which reservation do you need help',
      description: 'with?',
      avatar: require('../assets/logoEasyRommie.png'),
      time: '6 hours ago',
      unread: false,
      online: false,
    },
  ];

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.messageItem}
      onPress={() => navigation.navigate('Chat', { 
        userName: item.sender,
        avatar: item.avatar
      })}
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
        colors={['#6D5BA3', '#8873BE']}
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
        keyExtractor={item => item.id}
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