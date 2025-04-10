import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Modal, ScrollView, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../constants/config';

const MapScreen = ({ route }) => {
  const navigation = useNavigation();
  const { rooms } = route.params;
  const mapRef = useRef(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialRegion = rooms.length > 0 ? {
    latitude: rooms[0].coordinate.latitude,
    longitude: rooms[0].coordinate.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  } : {
    latitude: 10.762622,
    longitude: 106.660172,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  useEffect(() => {
    if (rooms.length > 0) {
      const processedMarkers = rooms.map(room => ({
        id: room.roomId,
        coordinate: {
          latitude: room.coordinate.latitude,
          longitude: room.coordinate.longitude
        },
        room: room
      }));
      setMarkers(processedMarkers);
    }
  }, [rooms]);

  useEffect(() => {
    if (mapRef.current && markers.length > 0) {
      const coordinates = markers.map(marker => marker.coordinate);
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true
      });
    }
  }, [markers]);

  const handleMarkerPress = async (room) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/room/rooms/${room.roomId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch room details');
      }
      const roomDetails = await response.json();
      setSelectedRoom(roomDetails);
    } catch (err) {
      console.error('Error fetching room details:', err);
      setError('Failed to load room details. Please try again.');
      setSelectedRoom(null);
    } finally {
      setLoading(false);
    }
  };

  const renderMarker = (marker) => {
    return (
      <Marker
        key={`marker-${marker.id}`}
        coordinate={marker.coordinate}
        onPress={() => handleMarkerPress(marker.room)}
        tracksViewChanges={false}
      >
        <View style={styles.markerContainer}>
          <Image 
            source={require('../assets/logoEasyRommie.png')} 
            style={styles.markerImage} 
          />
        </View>
      </Marker>
    );
  };

  const RoomDetailModal = () => (
    <Modal
      visible={!!selectedRoom}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setSelectedRoom(null)}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6D5BA3" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => selectedRoom && handleMarkerPress(selectedRoom)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : selectedRoom && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedRoom(null)}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            
            <ScrollView>
              <Image 
                source={
                  selectedRoom.roomImages && selectedRoom.roomImages.length > 0
                    ? { uri: selectedRoom.roomImages[0] }
                    : require('../assets/logoEasyRommie.png')
                } 
                style={styles.modalImage}
                defaultSource={require('../assets/logoEasyRommie.png')}
              />
              <View style={styles.modalInfo}>
                <Text style={styles.modalPrice}>
                  {selectedRoom.roomPrices?.[0]?.price?.toLocaleString() || '0'} VND/month
                </Text>
                <Text style={styles.modalLocation}>
                  {selectedRoom.roomType?.address?.houseNumber} {selectedRoom.roomType?.address?.street}, 
                  {selectedRoom.roomType?.address?.district}, {selectedRoom.roomType?.address?.city}
                </Text>
                <Text style={styles.modalDescription}>
                  {selectedRoom.description}
                </Text>
                <TouchableOpacity
                  style={styles.viewDetailButton}
                  onPress={() => {
                    setSelectedRoom(null);
                    navigation.navigate('RoomDetail', { roomId: selectedRoom.roomId });
                  }}
                >
                  <Text style={styles.viewDetailButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.listViewButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="view-list" size={24} color="#6D5BA3" />
          <Text style={styles.listViewText}>List</Text>
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        {...(Platform.OS === 'android' && { provider: PROVIDER_GOOGLE })}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        mapType="standard"
        loadingEnabled={true}
        loadingIndicatorColor="#666666"
        loadingBackgroundColor="#ffffff"
        moveOnMarkerPress={false}
      >
        {markers.map(renderMarker)}
      </MapView>

      <RoomDetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  listViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listViewText: {
    marginLeft: 5,
    color: '#6D5BA3',
    fontWeight: '500',
  },
  map: { flex: 1 },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 5,
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  modalInfo: { padding: 20 },
  modalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  viewDetailButton: {
    backgroundColor: '#6D5BA3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewDetailButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6D5BA3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MapScreen;
