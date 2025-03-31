import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MapScreen = ({ route }) => {
  const navigation = useNavigation();
  const { rooms } = route.params;

  // Vị trí mặc định (Hồ Chí Minh)
  const initialRegion = {
    latitude: 10.762622,
    longitude: 106.660172,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Giả lập vị trí cho các phòng
  const roomsWithCoordinates = rooms.map((room, index) => ({
    ...room,
    coordinate: {
      latitude: initialRegion.latitude + (Math.random() - 0.5) * 0.05,
      longitude: initialRegion.longitude + (Math.random() - 0.5) * 0.05,
    }
  }));

  const CustomMarker = () => (
    <View style={styles.customMarkerContainer}>
      <Image 
        source={require('../assets/logoEasyRommie.png')} 
        style={styles.markerImage} 
      />
    </View>
  );
  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.listViewButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="view-list" size={24} color="#6D5BA3" />
          <Text style={styles.listViewText}>List</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
      >
        {roomsWithCoordinates.map((room, index) => (
          <Marker
            key={room.id}
            coordinate={room.coordinate}
          >
            <CustomMarker price={room.price} />
            <Callout>
              <View style={styles.calloutContainer}>
                <Image source={room.image} style={styles.calloutImage} />
                <View style={styles.calloutInfo}>
                  <Text style={styles.calloutPrice}>{room.price}</Text>
                  <Text style={styles.calloutLocation}>{room.location}</Text>
                  <Text style={styles.calloutDescription} numberOfLines={2}>
                    {room.description}
                  </Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  map: {
    flex: 1,
  },
  customMarkerContainer: {
    alignItems: 'center',
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerPriceContainer: {
    backgroundColor: '#6D5BA3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: -10,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  markerPrice: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 5,
  },
  calloutInfo: {
    marginTop: 5,
  },
  calloutPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  calloutLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default MapScreen; 