import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ImageSourcePickerModal = ({ visible, onClose, onPickCamera, onPickGallery }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Select image source</Text>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onPickCamera();
              onClose();
            }}
          >
            <Text style={styles.optionText}>Take a photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onPickGallery();
              onClose();
            }}
          >
            <Text style={styles.optionText}>Pick from gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={[styles.optionText, styles.cancelText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#007bff',
    marginVertical: 6,
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  cancelText: {
    color: '#333',
  },
});

export default ImageSourcePickerModal;