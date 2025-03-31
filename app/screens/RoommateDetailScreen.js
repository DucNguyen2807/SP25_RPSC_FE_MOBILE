import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const RoommateDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { roommate } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* Header Image with Gradient Overlay */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('../assets/logoEasyRommie.png')}
          style={styles.headerImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          style={styles.headerGradient}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back-ios" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image source={roommate.avatar} style={styles.avatar} />
        <View style={styles.nameContainer}>
          <Text style={styles.greeting}>Hello, tui là {roommate.name}</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <View style={styles.dotIndicator} />
              <Text style={styles.statusText}>Hoạt động hôm nay</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <FontAwesome5 name="birthday-cake" size={14} color="#666" />
              <Text style={styles.infoText}>{roommate.age} tuổi</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="male-female" size={14} color="#666" />
              <Text style={styles.infoText}>Nam</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Info Sections */}
      <View style={styles.infoContainer}>
        {/* Work & School Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <FontAwesome5 name="briefcase" size={16} color="#6D5BA3" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Công việc</Text>
              <Text style={styles.infoValue}>Là sinh viên còn đi học</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <FontAwesome5 name="graduation-cap" size={16} color="#6D5BA3" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Trường</Text>
              <Text style={styles.infoValue}>Đại học FPT</Text>
            </View>
          </View>
        </View>

        {/* Introduction Section */}
        <View style={[styles.section, styles.introSection]}>
          <Text style={styles.sectionTitle}>Giới thiệu về bản thân</Text>
          <Text style={styles.introText}>
            Xin chào mọi người! Mình là Trần Vũ Khải, hiện đang là sinh viên năm cuối tại trường Đại học FPT, chuyên ngành Công nghệ Thông tin. Mình có niềm đam mê với phát triển phần mềm và đặc biệt quan tâm đến các dự án liên quan đến web và ứng dụng di động.
          </Text>
        </View>

        {/* Traits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sở thích & Tính cách</Text>
          <View style={styles.traitsContainer}>
            {['Hòa đồng', 'Dễ tính', 'Món nào cũng biết nấu', 'Dễ ăn uống'].map((trait, index) => (
              <View key={index} style={styles.traitBadge}>
                <Text style={styles.traitText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Room Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin phòng trọ</Text>
          <Text style={styles.roomDescription}>
            Hiện tại mình đang thuê phòng trọ của chú Mr.Đàm, các bạn có thể coi và tham khảo bên dưới
          </Text>
          
          {/* Room Image Gallery */}
          <View style={styles.roomImageContainer}>
            <Image 
              source={require('../assets/logoEasyRommie.png')}
              style={styles.roomImage}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
              style={styles.imageGradient}
            />
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>1/10</Text>
            </View>
            <View style={styles.roomOwnerInfo}>
              <Image 
                source={require('../assets/logoEasyRommie.png')}
                style={styles.ownerAvatar}
              />
              <View style={styles.ownerTextContainer}>
                <Text style={styles.ownerName}>Nguyễn Xuân Đức</Text>
                <View style={styles.ownerBadges}>
                  <View style={styles.ownerBadge}>
                    <View style={styles.dotIndicator} />
                    <Text style={styles.ownerBadgeText}>Today</Text>
                  </View>
                  <View style={styles.ownerBadge}>
                    <FontAwesome5 name="user-friends" size={12} color="#4CAF50" />
                    <Text style={styles.ownerBadgeText}>roommate</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Room Details */}
          <View style={styles.roomDetailsCard}>
            <View style={styles.roomDetailGrid}>
              <View style={styles.roomDetailItem}>
                <FontAwesome5 name="door-open" size={16} color="#6D5BA3" />
                <Text style={styles.detailLabel}>Số phòng</Text>
                <Text style={styles.detailValue}>101</Text>
              </View>
              <View style={styles.roomDetailItem}>
                <FontAwesome5 name="money-bill-wave" size={16} color="#6D5BA3" />
                <Text style={styles.detailLabel}>Tiền trọ</Text>
                <Text style={styles.detailValue}>2,000,000đ/tháng</Text>
              </View>
              <View style={styles.roomDetailItem}>
                <FontAwesome5 name="ruler-combined" size={16} color="#6D5BA3" />
                <Text style={styles.detailLabel}>Diện tích</Text>
                <Text style={styles.detailValue}>95.75 m²</Text>
              </View>
              <View style={styles.roomDetailItem}>
                <FontAwesome5 name="users" size={16} color="#6D5BA3" />
                <Text style={styles.detailLabel}>Số người</Text>
                <Text style={styles.detailValue}>5 người</Text>
              </View>
            </View>

            <View style={styles.roomDetailDivider} />

            <View style={styles.roomDetailFull}>
              <View style={styles.detailRow}>
                <FontAwesome5 name="map-marker-alt" size={16} color="#6D5BA3" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Địa chỉ</Text>
                  <Text style={styles.detailValue}>
                    12 Mạn Thiện, Phường Long Hiệp, Thành Phố Thủ Đức, TP Hồ Chí Minh
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.roomDetailDivider} />

            <View style={styles.amenitiesSection}>
              <Text style={styles.amenitiesTitle}>Tiện ích</Text>
              <View style={styles.amenitiesList}>
                <View style={styles.amenityItem}>
                  <FontAwesome5 name="bed" size={16} color="#6D5BA3" />
                  <Text style={styles.amenityText}>1 giường</Text>
                </View>
                <View style={styles.amenityItem}>
                  <FontAwesome5 name="desk" size={16} color="#6D5BA3" />
                  <Text style={styles.amenityText}>1 bàn học</Text>
                </View>
                <View style={styles.amenityItem}>
                  <FontAwesome5 name="fan" size={16} color="#6D5BA3" />
                  <Text style={styles.amenityText}>1 quạt</Text>
                </View>
              </View>
            </View>

            <View style={styles.roomDetailDivider} />

            <View style={styles.servicesSection}>
              <Text style={styles.servicesTitle}>Dịch vụ</Text>
              <View style={styles.serviceItem}>
                <View style={styles.serviceHeader}>
                  <FontAwesome5 name="tshirt" size={16} color="#6D5BA3" />
                  <Text style={styles.serviceName}>Giặt ủi</Text>
                  <Text style={styles.servicePrice}>20,000đ/tháng</Text>
                </View>
                <Text style={styles.serviceDetail}>• Có lau giặt ủi và phơi đồ</Text>
              </View>
              <View style={styles.serviceItem}>
                <View style={styles.serviceHeader}>
                  <FontAwesome5 name="wifi" size={16} color="#6D5BA3" />
                  <Text style={styles.serviceName}>Wifi</Text>
                  <Text style={styles.servicePrice}>100,000đ/tháng</Text>
                </View>
                <Text style={styles.serviceDetail}>• Có wifi tốc độ cao</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.messageButton}>
          <LinearGradient
            colors={['#7B6AB4', '#6D5BA3']}
            style={styles.gradientButton}
          >
            <FontAwesome5 name="home" size={16} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.messageButtonText}>Yêu cầu ở ghép</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.transferButton}>
          <FontAwesome5 name="comments" size={16} color="#6D5BA3" style={styles.buttonIcon} />
          <Text style={styles.transferButtonText}>Trò chuyện</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  headerContent: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#FFF',
    marginTop: -50,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  nameContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 6,
  },
  infoContainer: {
    padding: 20,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EDF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  introText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  traitBadge: {
    backgroundColor: '#F0EDF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  traitText: {
    color: '#6D5BA3',
    fontSize: 14,
    fontWeight: '500',
  },
  roomImageContainer: {
    position: 'relative',
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  roomImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  roomOwnerInfo: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 20,
  },
  ownerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  ownerTextContainer: {
    flex: 1,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ownerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  roomDetailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  roomDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roomDetailItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  roomDetailDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  roomDetailFull: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  amenitiesSection: {
    marginBottom: 20,
  },
  amenitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  servicesSection: {
    marginTop: 8,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  serviceItem: {
    marginBottom: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  servicePrice: {
    fontSize: 14,
    color: '#6D5BA3',
    fontWeight: '600',
  },
  serviceDetail: {
    fontSize: 14,
    color: '#666',
    marginLeft: 24,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  messageButton: {
    flex: 1,
    marginRight: 10,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  messageButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transferButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EDF6',
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 10,
  },
  transferButtonText: {
    color: '#6D5BA3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RoommateDetailScreen; 