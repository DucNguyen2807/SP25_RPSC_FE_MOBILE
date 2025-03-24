import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const RoommateScreen = () => {
  const roommates = [
    {
      id: '1',
      name: 'Trần Vũ Khải',
      avatar: require('../assets/logoEasyRommie.png'),
      occupation: 'Sinh viên ưu tú trường đại học FPT',
      description: 'Tôi là sinh viên cần tìm 1 bạn đồng phòng giúp chia sẻ tiền nhà và học cùng ngày.',
      traits: ['Ngủ sớm', 'Ngăn nắp', 'Sạch sẽ'],
      age: 23,
      status: 'Today',
    },
    {
      id: '2',
      name: 'Nguyễn Nhật Hào',
      avatar: require('../assets/logoEasyRommie.png'),
      occupation: 'Nhân viên IT công ty LCK',
      description: 'Tôi là sinh viên cần tìm 1 bạn đồng phòng giúp chia sẻ tiền nhà và học cùng ngày.',
      traits: ['Ngủ trễ', 'Ngăn nắp', 'Sạch sẽ'],
      age: 24,
      status: 'Today',
    },
  ];

  const renderRoommateCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={item.avatar} style={styles.avatar} />
          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={16} color="#4CAF50" />
                <Text style={styles.age}>{item.age}</Text>
              </View>
            </View>
            <Text style={styles.occupation}>{item.occupation}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>
        <Text style={styles.status}>{item.status}</Text>
      </View>

      <View style={styles.traitsContainer}>
        <Text style={styles.traitsLabel}>Tiêu chí:</Text>
        <View style={styles.traits}>
          {item.traits.map((trait, index) => (
            <View key={index} style={styles.traitBadge}>
              <Text style={styles.traitText}>{trait}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>$Tháng</Text>
            <View style={styles.minMaxContainer}>
              <Text style={styles.minMaxText}>Min</Text>
              <Text style={styles.minMaxText}>Max</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Tuổi</Text>
            <View style={styles.minMaxContainer}>
              <Text style={styles.minMaxText}>Min</Text>
              <Text style={styles.minMaxText}>Max</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.filterText}>Map</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>+ More</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={roommates}
        renderItem={renderRoommateCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    padding: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#F0EDF6',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 100,
  },
  filterText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  minMaxText: {
    color: '#999',
    fontSize: 12,
  },
  moreButton: {
    alignSelf: 'center',
  },
  moreButtonText: {
    color: '#6D5BA3',
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  age: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  occupation: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  status: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    height: 24,
  },
  traitsContainer: {
    marginTop: 8,
  },
  traitsLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  traits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  traitBadge: {
    backgroundColor: '#F0EDF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  traitText: {
    color: '#6D5BA3',
    fontSize: 12,
  },
});

export default RoommateScreen; 