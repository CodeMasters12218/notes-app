import { useRef, useState } from 'react';
import { Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';



const NoteItem = ({ note, onDelete, onEdit }) => {
    const [reminderEnabled, setReminderEnabled] = useState(!!note.reminderAt);
    const [reminderDate, setReminderDate] = useState(
    note.reminderAt ? new Date(note.reminderAt) : new Date()
    );
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(note.text);
    const inputRef = useRef(null);
    
    const handleSave = () => {
        if (editedText.trim() === '') {
            return;
        }
        const reminderAt = reminderEnabled ? reminderDate.toISOString() : null;
        onEdit(note.$id, editedText, reminderAt);
        setIsEditing(false);
    }

    return (<View style={styles.noteItem}>
            {isEditing ? (
                <View style={{ flex: 1 }}>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        value={editedText}
                        onChangeText={setEditedText}
                        autoFocus
                        multiline
                        returnKeyType="done"
                    />

                    <View style={styles.reminderRow}>
                        <Text>Reminder</Text>
                        <Switch
                            value={reminderEnabled}
                            onValueChange={(val) => {
                                setReminderEnabled(val);
                                if (!val) setReminderDate(new Date());
                            }}
                        />
                </View>

                {reminderEnabled && (
            <>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datetimeButton}>
                    <Text>{reminderDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.datetimeButton}>
                    <Text>
                        {reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </TouchableOpacity>
            </>
        )}

        {showDatePicker && (
            <DateTimePicker
                value={reminderDate}
                mode="date"
                display="default"
                onChange={(e, selectedDate) => {
                    if (selectedDate) {
                        const updated = new Date(
                            selectedDate.getFullYear(),
                            selectedDate.getMonth(),
                            selectedDate.getDate(),
                            reminderDate.getHours(),
                            reminderDate.getMinutes()
                        );
                        setReminderDate(updated);
                    }
                setShowDatePicker(false);
            }}
        />
    )}

    {showTimePicker && (
      <DateTimePicker
        value={reminderDate}
        mode="time"
        display="default"
        onChange={(e, selectedTime) => {
          if (selectedTime) {
            const updated = new Date(
              reminderDate.getFullYear(),
              reminderDate.getMonth(),
              reminderDate.getDate(),
              selectedTime.getHours(),
              selectedTime.getMinutes()
            );
            setReminderDate(updated);
          }
          setShowTimePicker(false);
        }}
      />
    )}
  </View>
) : (
  <View style={{ flex: 1 }}>
    {note.imageUrl && (
        <Image source={{ uri: note.imageUrl }} style={styles.noteImage} onError={(e) => console.log("Error loading image:", e.nativeEvent.error)}  />
    )}
    
    <Text style={styles.noteText}>{note.text}</Text>
    {note.reminderAt && (
      <Text style={styles.reminderText}>
        ⏰ {new Date(note.reminderAt).toLocaleString()}
      </Text>
    )}
  </View>
)}

            <View style={styles.actions}>
                {isEditing ? (
                    <TouchableOpacity onPress={() => {
                        handleSave();
                        inputRef.current?.blur();
                    }}>
                        <Text style={styles.edit}>💾</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <Text style={styles.edit}>✏️</Text>
                    </TouchableOpacity>
                
                )}
                
                <TouchableOpacity onPress={() => onDelete(note.$id)}>
                    <Text style={styles.delete}>❌</Text>
                </TouchableOpacity>
            </View>

        </View>
    );  
};

const styles = StyleSheet.create({
        noteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        marginVertical: 5,
        borderRadius: 5,
        backgroundColor: '#f5f5f5',
    },
    noteImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 8,
    },
    noteText: {
        fontSize: 18,
    },
    delete: {
        fontSize: 18,
        color: 'red',
    },
    actions: {
        flexDirection: 'row',
    },
    edit: {
        fontSize: 18,
        marginRight: 10,
        color: 'blue',
    },
    reminderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 6,
    },
    datetimeButton: {
        padding: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
        marginBottom: 6,
    },
    reminderText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    input: {
        minHeight: 60,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 8,
        borderRadius: 6,
    },
});    

export default NoteItem;