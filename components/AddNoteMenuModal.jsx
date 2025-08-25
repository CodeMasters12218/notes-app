import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AddNoteMenuModal = ({ visible, onClose, onAddText, onAddImage, onAddDrawing }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, {backgroundColor: 'rgba(0,0,0,0.7)'}]}>
        <View style={[styles.modalContainer, { backgroundColor: theme.modalBackground }]}>
          <Text style={[styles.title, {color: theme.text}]}>{t('addDialog')}</Text>

          <TouchableOpacity
            style={[styles.optionButton, {backgroundColor: theme.primary}]}
            onPress={() => {
              onAddText();
              onClose();
            }}
          >
            <Text style={styles.optionText}>{t('addText')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, {backgroundColor: theme.primary}]}
            onPress={() => {
              onAddImage();
              onClose();
            }}
          >
            <Text style={styles.optionText}>{t('addImage')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, {backgroundColor: theme.primary}]}
            onPress={() => {
              onAddDrawing();
              onClose();
            }}
          >
            <Text style={styles.optionText}>{t('addDrawing')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={[styles.optionText, styles.cancelText]}>{t('cancelButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
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