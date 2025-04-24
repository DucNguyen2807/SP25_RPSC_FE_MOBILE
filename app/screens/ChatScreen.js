import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import chatService from '../services/chatService';
import * as signalR from '@microsoft/signalr';

const ChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);

  const { userName, avatar, userId, myId } = route.params;

  useEffect(() => {
    const fetchChat = async () => {
      if (!myId) return;

      const res = await chatService.getChatHistory(userId);
      if (res.isSuccess) {
        const formatted = res.data.map((msg, index) => {
          const senderId = msg.sender?.senderId;
          return {
            id: index.toString(),
            text: msg.message,
            sender: String(senderId) === String(myId) ? 'user' : 'other',
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
          };
        });
        setMessages(formatted.reverse());
      }
    };

    fetchChat();
  }, [userId, myId]);

  useEffect(() => {
    const connectToSignalR = async () => {
      const newConnection = new signalR.HubConnectionBuilder()
         .withUrl('http://10.0.2.2:5262/chatHub')
       //withUrl('http://192.168.0.100:5262/chatHub')
        .withAutomaticReconnect()
        .build();

      try {
        await newConnection.start();
        await newConnection.invoke('JoinChat', myId);
        setConnection(newConnection);

        // In your SignalR connection setup (inside useEffect)
newConnection.on('ReceiveMessage', (senderId, receiverId, newMessage, clientTimestamp) => {
  if ((String(senderId) === String(userId) || String(receiverId) === String(userId))) {
    const isCurrentUser = String(senderId) === String(myId);
    
    // Only add the message if it's from the other user (not from you)
    // This prevents duplicate messages from your own sends
    if (!isCurrentUser) {
      setMessages(prev => [
        {
          id: Date.now().toString(),
          text: newMessage,
          sender: 'other',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        },
        ...prev
      ]);
    }
  }
});
      } catch (err) {
        console.error('SignalR Connection Error:', err);
      }
    };

    connectToSignalR();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [myId, userId]);

  const messageInputRef = useRef(null); // Create a reference for the TextInput

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const messageToSend = message; // Store message in a temporary variable
    setMessage(''); // Clear input immediately
    
    
    const res = await chatService.sendMessageToUser({ message: messageToSend, receiverId: userId });
    if (res.isSuccess) {
      const newMessage = {
        id: Date.now().toString(),
        text: messageToSend,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };
      
      setMessages(prev => [newMessage, ...prev]);
      
      // if (connection) {
      //   await connection.invoke('SendMessageToUser', myId, userId, messageToSend, Date.now());
      // }
    }
  };
  
  
  
  
  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.otherMessage
    ]}>
      {item.sender === 'other' && (
        <View style={styles.avatarContainer}>
          <Image source={avatar} style={styles.avatar} />
          <View style={styles.onlineIndicator} />
        </View>
      )}
      <View style={styles.messageContent}>
        <LinearGradient
          colors={item.sender === 'user' ? ['#6D5BA3', '#8873BE'] : ['#F8F9FA', '#F0EDF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.otherBubble
          ]}
        >
          <Text style={[
            styles.messageText,
            item.sender === 'user' ? styles.userMessageText : null
          ]}>{item.text}</Text>
        </LinearGradient>
        <View style={[
          styles.messageFooter,
          item.sender === 'user' ? styles.userFooter : styles.otherFooter
        ]}>
          <Text style={styles.messageTime}>{item.time}</Text>
          {item.sender === 'user' && item.status === 'read' && (
            <FontAwesome5 name="check-double" size={12} color="#4CAF50" style={styles.readIcon} />
          )}
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#ACDCD0', '#ACDCD0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerAvatarContainer}>
            <Image source={avatar} style={styles.headerAvatar} />
            <View style={styles.headerOnlineIndicator} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{userName}</Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          inverted
          extraData={messages}  // Cập nhật khi messages thay đổi
        />

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.attachButton}>
            <FontAwesome5 name="plus" size={20} color="#6D5BA3" />
          </TouchableOpacity>
          <TextInput
  ref={messageInputRef}
  style={styles.input}
  placeholder="Nhắn tin..."
  placeholderTextColor="#999"
  value={message} // This should be correctly bound
  onChangeText={setMessage}
  multiline
/>



          <TouchableOpacity 
            style={[styles.sendButton, message ? styles.sendButtonActive : null]}
            onPress={handleSendMessage}
          >
            <MaterialIcons 
              name="send" 
              size={20} 
              color={message ? "#FFF" : "#6D5BA3"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerAvatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  headerOnlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  headerAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  messageContent: {
    maxWidth: '70%',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userFooter: {
    justifyContent: 'flex-end',
  },
  otherFooter: {
    justifyContent: 'flex-start',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
  },
  readIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0EDF6',
  },
  input: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    paddingHorizontal: 12,
    color: '#333',
  },
  emojiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0EDF6',
    marginLeft: 4,
  },
  sendButtonActive: {
    backgroundColor: '#6D5BA3',
  },
});

export default ChatScreen; 