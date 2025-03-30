import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const RoommateScreen = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');

  const roommates = [
    {
      id: '1',
      name: 'Nguyễn Trần Vĩ Hào',
      avatar: require('../assets/logoEasyRommie.png'),
      occupation: 'Sinh viên ưu tú trường đại học FPT',
      description: 'Tôi là sinh viên cần tìm 1 bạn đồng phòng giúp chia sẻ tiền nhà và học cùng ngày.',
      traits: ['Ngủ sớm', 'Ngăn nắp', 'Sạch sẽ'],
      age: 23,
      status: 'Today',
    },
    {
      id: '2',
      name: 'Nguyễn Xuân Đức',
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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn muốn tìm nơi đâu?"
            placeholderTextColor="#999"
          />
          <TouchableOpacity>
            <MaterialIcons name="notifications-none" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        {/* First Row - Price and Age Filters */}
        <View style={styles.filterRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>VNĐ/Month</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.filterInput}
                placeholder="Min"
                value={priceMin}
                onChangeText={setPriceMin}
                keyboardType="numeric"
              />
              <Text style={styles.filterDivider}>-</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Max"
                value={priceMax}
                onChangeText={setPriceMax}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Age</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.filterInput}
                placeholder="Min"
                value={ageMin}
                onChangeText={setAgeMin}
                keyboardType="numeric"
              />
              <Text style={styles.filterDivider}>-</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Max"
                value={ageMax}
                onChangeText={setAgeMax}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {isExpanded && (
          <>
            {/* Second Row */}
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterOption}>
                <MaterialIcons name="person" size={20} color="#6D5BA3" />
                <Text style={styles.filterOptionText}>Gender</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterOption}>
                <MaterialIcons name="local-cafe" size={20} color="#6D5BA3" />
                <Text style={styles.filterOptionText}>Lifestyle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterOption}>
                <MaterialIcons name="category" size={20} color="#6D5BA3" />
                <Text style={styles.filterOptionText}>Type</Text>
              </TouchableOpacity>
            </View>

            {/* Third Row */}
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterOption}>
                <MaterialIcons name="access-time" size={20} color="#6D5BA3" />
                <Text style={styles.filterOptionText}>Duration</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterOption}>
                <MaterialIcons name="star" size={20} color="#6D5BA3" />
                <Text style={styles.filterOptionText}>Amenities</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.moreButtonText}>
            {isExpanded ? '- Less' : '+ More'}
          </Text>
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
    paddingTop: 44, // For status bar
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: '#F0EDF6',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  filterOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EDF6',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filterOptionText: {
    marginLeft: 8,
    color: '#6D5BA3',
    fontSize: 14,
  },
  moreButton: {
    alignSelf: 'center',
    marginTop: 8,
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
  filterGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  filterInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 4,
    textAlign: 'center',
    minWidth: 40,
  },
  filterDivider: {
    color: '#666',
    marginHorizontal: 4,
    fontSize: 14,
  },
});

export default RoommateScreen; 