import tagService from '@/services/tagService';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Modal, Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AddNoteModal = ({ 
  modalVisible, 
  setModalVisible,
  newNote,
  setNewNote,
  addNote,
  user,
  selectedTags,
  setSelectedTags,
  drawingSvg,
}) => {
  const [tagInput, setTagInput] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

useEffect(() => {
  const setup = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesitan permisos para notificaciones');
    }
  };

  const fetchTags = async () => {
    if (user) {
      const response = await tagService.getTags(user.$id);
      if (!response.error) {
        setAllTags(response.data.map(tag => tag.name));
      }
    }
  };

  if (modalVisible) {
    setup();
    fetchTags();
  }
}, [modalVisible, user]);


  const filteredSuggestions = allTags.filter(
    tag =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !selectedTags.includes(tag)
  );

  const toggleReminder = (value) => {
    setReminderEnabled(value);
    if (!value) {
      setDate(null); // o puedes usar un estado separado si manejas recordatorio con más detalle
    } else {
      const now = new Date();
    setDate(now);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate((prevDate) => {
        const newDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          prevDate?.getHours() || 0,
          prevDate?.getMinutes() || 0
        );
        return newDate;
      });
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setDate((prevDate) => {
        const newDate = new Date(
          prevDate?.getFullYear() || new Date().getFullYear(),
          prevDate?.getMonth() || new Date().getMonth(),
          prevDate?.getDate() || new Date().getDate(),
          selectedTime.getHours(),
          selectedTime.getMinutes()
        );
        return newDate;
      });
    }
  };

  const programNotification = async (date) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 Reminder',
        body: "Don't forget to check this note!",
        sound: true,
      },
      trigger: date,
    });
  } catch (error) {
    console.error('Error programming notification:', error);
  }
};


  return (
    <Modal
      visible={modalVisible}
      animationType='slide'
      transparent
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add a New Note</Text>

          <TextInput
            style={styles.input}
            placeholder='Enter note...'
            placeholderTextColor='#aaa'
            value={newNote}
            onChangeText={setNewNote}
          />

          {/* Tag input */}
          <TextInput
            style={styles.input}
            placeholder="Add tag and press enter"
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={() => {
              if (tagInput.trim() !== '' && !selectedTags.includes(tagInput.trim())) {
                setSelectedTags([...selectedTags, tagInput.trim()]);
              }
              setTagInput('');
            }}
          />

          {/* Suggestions */}
          {filteredSuggestions.length > 0 && (
            <View>
              {filteredSuggestions.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedTags([...selectedTags, tag]);
                    setTagInput('');
                  }}
                >
                  <Text style={styles.suggestion}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Selected tags */}
          <View style={styles.tagsContainer}>
            {selectedTags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text>#{tag}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedTags(selectedTags.filter((t) => t !== tag))
                  }
                >
                  <Text style={{ color: 'red', marginLeft: 6 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.reminderRow}>
            <Text style={styles.reminderLabel}>Reminder</Text>
            <Switch value={reminderEnabled} onValueChange={toggleReminder} />
          </View>

          {reminderEnabled && (
            <>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datetimeButton}>
                <Text>Select Date: {date?.toLocaleDateString()}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.datetimeButton}>
                <Text>Select Time: {date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
          </>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="time"
          display="default"
          onChange={onChangeTime}
        />
      )}

      {drawingSvg && (
        <View style={styles.drawingPreview}>
          <SvgXml xml={drawingSvg} width="100%" height="100%" />
        </View>
      )}

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                if (reminderEnabled && date) {
                  programNotification(date);
                }
                addNote(date);
                setModalVisible(false); // Cierra modal después de guardar
              }}
            >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
          </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  suggestion: {
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginVertical: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    margin: 4,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  datetimeButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
    marginBottom: 8,
  },
  drawingPreview: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
  }
});

export default AddNoteModal;
