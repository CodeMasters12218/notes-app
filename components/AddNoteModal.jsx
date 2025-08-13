import TaskList from '@/components/TaskList';
import { useTheme } from '@/contexts/ThemeContext'; // 🔧
import tagService from '@/services/tagService';
import { parseTasksFromText, serializeTasksToText } from '@/services/taskUtils';
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
  const { theme } = useTheme(); // 🔧

  const [tagInput, setTagInput] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const setup = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Notifications permission not granted');
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

  useEffect(() => {
    if (modalVisible) {
      const parsed = parseTasksFromText(newNote);
      setTasks(parsed);
    }
  }, [modalVisible, newNote]);

  const filteredSuggestions = allTags.filter(
    tag =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !selectedTags.includes(tag)
  );

  const toggleReminder = (value) => {
    setReminderEnabled(value);
    setDate(value ? new Date() : null);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(prev => new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        prev?.getHours() || 0,
        prev?.getMinutes() || 0
      ));
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setDate(prev => new Date(
        prev?.getFullYear() || new Date().getFullYear(),
        prev?.getMonth() || new Date().getMonth(),
        prev?.getDate() || new Date().getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      ));
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

  const handleTasksChange = (updatedTasks) => {
    setTasks(updatedTasks);
    setNewNote(serializeTasksToText(updatedTasks));
  };

  return (
    <Modal
      visible={modalVisible}
      animationType='slide'
      transparent
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay || 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.modalBackground }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Add a New Note</Text>

          <TaskList
            noteId={null}
            initialTasks={tasks}
            onTasksChange={handleTasksChange}
          />

          <TextInput
            style={[styles.input, {
              backgroundColor: theme.inputBackground,
              color: theme.text,
              borderColor: theme.text === '#FFFFFF' ? '#555' : '#ccc',
            }]}
            placeholder='Enter note...'
            placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#666'}
            value={newNote}
            onChangeText={setNewNote}
          />

          <TextInput
            style={[styles.input, {
              backgroundColor: theme.inputBackground,
              color: theme.text,
              borderColor: theme.text === '#FFFFFF' ? '#555' : '#ccc',
            }]}
            placeholder="Add tag and press enter"
            placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#666'}
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={() => {
              if (tagInput.trim() !== '' && !selectedTags.includes(tagInput.trim())) {
                setSelectedTags([...selectedTags, tagInput.trim()]);
              }
              setTagInput('');
            }}
          />

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
                  <Text style={[styles.suggestion, { color: theme.text }]}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.tagsContainer}>
            {selectedTags.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.inputBackground }]}>
                <Text style={{ color: theme.text }}>#{tag}</Text>
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
            <Text style={[styles.reminderLabel, { color: theme.text }]}>Reminder</Text>
            <Switch value={reminderEnabled} onValueChange={toggleReminder} />
          </View>

          {reminderEnabled && (
            <>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.datetimeButton, { backgroundColor: theme.inputBackground }]}>
                <Text style={{ color: theme.text }}>
                  Select Date: {date?.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={[styles.datetimeButton, { backgroundColor: theme.inputBackground }]}>
                <Text style={{ color: theme.text }}>
                  Select Time: {date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
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

          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.inputBackground }]} onPress={() => setModalVisible(false)}>
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                if (reminderEnabled && date) {
                  programNotification(date);
                }
                addNote(date);
                setModalVisible(false);
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
  },
  modalContent: {
    width: '90%',
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
