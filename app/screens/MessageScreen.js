import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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
    },
    {
      id: '2',
      sender: 'Customer',
      message: 'Mình có thấy bạn đang đăng bài kiếm người ở ghép',
      description: 'Cho mình ở ghép với nhá',
      avatar: require('../assets/logoEasyRommie.png'),
      time: '2 hours ago',
      unread: false,
    },
    {
      id: '3',
      sender: 'Airbnb Support',
      message: 'Mình có thấy bạn đang đăng bài kiếm người ở ghép',
      description: 'Cho mình ở ghép với nhá',
      avatar: require('../assets/logoEasyRommie.png'),
      time: '3 hours ago',
      unread: false,
    },
    {
      id: '4',
      sender: 'Joe',
      message: 'New event',
      description: 'Unavailable',
      avatar: require('../assets/logoEasyRommie.png'),
      time: 'Aug 21 - 25, 2023',
      unread: false,
    },
    {
      id: '5',
      sender: 'Airbnb Support',
      message: 'If you leave this message thread, you',
      description: 'can get back to it from your Airbnb',
      avatar: require('../assets/logoEasyRommie.png'),
      time: '5 hours ago',
      unread: false,
    },
    {
      id: '6',
      sender: 'Airbnb Support',
      message: 'Which reservation do you need help',
      description: 'with?',
      avatar: require('../assets/logoEasyRommie.png'),
      time: '6 hours ago',
      unread: false,
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
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{item.sender}</Text>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={1}>{item.message}</Text>
        <Text style={styles.messageDescription} numberOfLines={1}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <MaterialIcons name="signal-cellular-4-bar" size={20} color="#000" />
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 44,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  messageDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default MessageScreen; 