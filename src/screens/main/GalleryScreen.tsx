import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';

interface CapturedPhoto {
  id: string;
  pokemonId: number;
  pokemonName: string;
  pokemonImage: string;
  photoUri: string;
  timestamp: Date;
  location?: {latitude: number; longitude: number};
}

const GALLERY_STORAGE_KEY = 'captured_photos';

const GalleryScreen: React.FC = () => {
  const {user} = useAuth();
  const {colors} = useTheme();
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(`${GALLERY_STORAGE_KEY}_${user?.uid}`);
      if (stored) {
        const parsedPhotos = JSON.parse(stored).map((photo: any) => ({
          ...photo,
          timestamp: new Date(photo.timestamp),
        }));
        setPhotos(parsedPhotos);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (photo: CapturedPhoto) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(photo.photoUri, {
          message: `I captured ${photo.pokemonName} in AR! #PokeExplorer`,
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing photo:', error);
    }
  };

  const handleDelete = async (photoId: string) => {
    try {
      const updatedPhotos = photos.filter(p => p.id !== photoId);
      setPhotos(updatedPhotos);
      if (user) {
        await AsyncStorage.setItem(
          `${GALLERY_STORAGE_KEY}_${user.uid}`,
          JSON.stringify(updatedPhotos),
        );
      }
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const renderPhotoItem = ({item}: {item: CapturedPhoto}) => (
    <TouchableOpacity
      style={[styles.photoCard, {backgroundColor: colors.surface}]}
      onPress={() => setSelectedPhoto(item)}>
      <Image source={{uri: item.photoUri}} style={styles.photoThumbnail} resizeMode="cover" />
      <View style={styles.photoInfo}>
        <Image
          source={{uri: item.pokemonImage}}
          style={styles.pokemonThumbnail}
          resizeMode="contain"
        />
        <View style={styles.photoDetails}>
          <Text style={[styles.pokemonName, {color: colors.text}]}>
            {item.pokemonName.charAt(0).toUpperCase() + item.pokemonName.slice(1)}
          </Text>
          <Text style={[styles.timestamp, {color: colors.textSecondary}]}>
            {item.timestamp.toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.textSecondary}]}>
          Loading gallery...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
            No captured photos yet.{'\n'}Use AR mode to capture Pokemon!
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Photo Detail Modal */}
      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}>
        {selectedPhoto && (
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, {backgroundColor: colors.surface}]}>
              <Image
                source={{uri: selectedPhoto.photoUri}}
                style={styles.modalPhoto}
                resizeMode="contain"
              />
              <View style={styles.modalInfo}>
                <Text style={[styles.modalPokemonName, {color: colors.text}]}>
                  {selectedPhoto.pokemonName.charAt(0).toUpperCase() +
                    selectedPhoto.pokemonName.slice(1)}
                </Text>
                <Text style={[styles.modalTimestamp, {color: colors.textSecondary}]}>
                  {selectedPhoto.timestamp.toLocaleString()}
                </Text>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, {backgroundColor: colors.primary}]}
                  onPress={() => handleShare(selectedPhoto)}>
                  <Text style={styles.modalButtonText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton, {borderColor: colors.error}]}
                  onPress={() => handleDelete(selectedPhoto.id)}>
                  <Text style={[styles.modalButtonText, {color: colors.error}]}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, {backgroundColor: colors.textSecondary}]}
                  onPress={() => setSelectedPhoto(null)}>
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

// Export function to save captured photo
export const saveCapturedPhoto = async (
  userId: string,
  pokemonId: number,
  pokemonName: string,
  pokemonImage: string,
  photoUri: string,
  location?: {latitude: number; longitude: number},
): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(`${GALLERY_STORAGE_KEY}_${userId}`);
    const photos: CapturedPhoto[] = stored ? JSON.parse(stored) : [];

    const newPhoto: CapturedPhoto = {
      id: Date.now().toString(),
      pokemonId,
      pokemonName,
      pokemonImage,
      photoUri,
      timestamp: new Date(),
      location,
    };

    photos.unshift(newPhoto); // Add to beginning
    await AsyncStorage.setItem(`${GALLERY_STORAGE_KEY}_${userId}`, JSON.stringify(photos));
  } catch (error) {
    console.error('Error saving captured photo:', error);
    throw error;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContent: {
    padding: 8,
  },
  photoCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoThumbnail: {
    width: '100%',
    height: 150,
  },
  photoInfo: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  pokemonThumbnail: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  photoDetails: {
    flex: 1,
  },
  pokemonName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  timestamp: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 16,
  },
  modalPhoto: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalInfo: {
    marginBottom: 16,
  },
  modalPokemonName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  modalTimestamp: {
    fontSize: 14,
  },
  modalActions: {
    gap: 8,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GalleryScreen;

