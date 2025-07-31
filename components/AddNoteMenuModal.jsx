import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AddNoteMenuModal = ({ visible, onClose, onAddText, onAddImage }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>What do you want to add?</Text>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onAddText();
              onClose();
            }}
          >
            <Text style={styles.optionText}>Add text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onAddImage();
              onClose();
            }}
          >
            <Text style={styles.optionText}>Add image</Text>
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
    marginHorizontal: 40,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: '600',
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

export default AddNoteMenuModal;