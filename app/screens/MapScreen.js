import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
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
  const [mapReady, setMapReady] = useState(false);

  // Default values for initialRegion
  const initialRegion = {
    latitude: 10.762622, 
    longitude: 106.660172,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  useEffect(() => {
    console.log("Rooms received in MapScreen:", JSON.stringify(rooms));
    if (rooms && rooms.length > 0) {
      try {
        const processedMarkers = rooms.map(room => {
          let latitude, longitude;
          
          if (room.coordinate) {
            latitude = parseFloat(room.coordinate.latitude);
            longitude = parseFloat(room.coordinate.longitude);
          }
          
          if (isNaN(latitude) || isNaN(longitude)) {
            console.warn("Invalid coordinates for room:", room.roomId);
            return null;
          }
          
          return {
            id: room.roomId,
            coordinate: {
              latitude: latitude,
              longitude: longitude,
            },
            price: room.price || 0,
            title: room.title || "",
            room: room
          };
        }).filter(marker => marker !== null);
        
        console.log("Processed markers:", JSON.stringify(processedMarkers));
        setMarkers(processedMarkers);

        if (processedMarkers.length > 0) {
          console.log(`Found ${processedMarkers.length} valid markers`);
        } else {
          console.log("No valid markers found");
        }
      } catch (err) {
        console.error("Error processing markers:", err);
        Alert.alert("Error", "Failed to process room markers: " + err.message);
      }
    }
  }, [rooms]);
  
  useEffect(() => {
    if (mapRef.current && markers.length > 0 && mapReady) {
      try {
        console.log("Trying to fit map to coordinates");
        const coordinates = markers.map(marker => marker.coordinate);
        
        if (coordinates.length > 0) {
          // Add timeout to ensure map has loaded
          setTimeout(() => {
            mapRef.current.fitToCoordinates(coordinates, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true
            });
          }, 1000);
        }
      } catch (err) {
        console.error("Error fitting to coordinates:", err);
      }
    }
  }, [markers, mapReady]);

  const handleMapReady = () => {
    console.log("Map is ready");
    setMapReady(true);
  };

  const handleMarkerPress = async (room) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedRoom(room); // Display available data immediately
      
      try {
        const response = await fetch(`${API_BASE_URL}/room/rooms/${room.roomId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch room details');
        }
        const roomDetails = await response.json();
        // Ensure we preserve the price if it's not in the API response
        if (!roomDetails.price && room.price) {
          roomDetails.price = room.price;
        }
        setSelectedRoom(roomDetails);
      } catch (err) {
        console.error('Error fetching room details:', err);
        // No need to set error since we're already displaying available data
      }
    } finally {
      setLoading(false);
    }
  };

  // Custom tile overlay for OpenStreetMap
  const customMapStyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dadada"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c9c9c9"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    }
  ];

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
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        mapType="standard"
        loadingEnabled={true}
        onMapReady={handleMapReady}
        customMapStyle={customMapStyle}
        zoomControlEnabled={true}
        // Using default provider (no PROVIDER_GOOGLE)
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => handleMarkerPress(marker.room)}
            pinColor="#6D5BA3"
          >
            <View style={styles.customMarker}>
              <MaterialIcons name="home" size={30} color="#6D5BA3" />
              <Text style={styles.markerPrice}>
                {(marker.price / 1000000).toFixed(1)}M
              </Text>
            </View>
            <Callout tooltip>
              <View style={styles.calloutView}>
                <Text style={styles.calloutTitle}>{marker.title}</Text>
                <Text style={styles.calloutPrice}>{marker.price.toLocaleString()} VND</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      {markers.length === 0 && (
        <View style={styles.noMarkersContainer}>
          <Text style={styles.noMarkersText}>No rooms found on the map</Text>
        </View>
      )}

      {/* DEBUG PANEL */}
      <View style={styles.debugPanel}>
        <Text style={styles.debugText}>Markers: {markers.length}</Text>
        <Text style={styles.debugText}>Map: OpenStreetMap</Text>
      </View>

      {/* ROOM DETAIL MODAL */}
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
        ) : (
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
                    selectedRoom?.roomImages && selectedRoom.roomImages.length > 0
                      ? { uri: selectedRoom.roomImages[0] }
                      : require('../assets/logoEasyRommie.png')
                  } 
                  style={styles.modalImage}
                />
                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>{selectedRoom?.title || 'Room Details'}</Text>
                  <Text style={styles.modalPrice}>
                    {selectedRoom?.price ? selectedRoom.price.toLocaleString() : '0'} VND/ tháng
                  </Text>
                  <Text style={styles.modalLocation}>
                    {selectedRoom?.location || 'No location provided'}
                  </Text>
                  <Text style={styles.modalDescription}>
                    {selectedRoom?.description || 'No description available'}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    position: 'relative'
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
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
  map: { 
    flex: 1,
    zIndex: 1
  },
  customMarker: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#6D5BA3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  markerPrice: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    position: 'absolute',
    bottom: 3,
  },
  calloutView: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 6,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4,
  },
  calloutPrice: {
    color: '#6D5BA3',
    fontWeight: 'bold',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
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
  noMarkersContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  noMarkersText: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  debugText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default MapScreen;