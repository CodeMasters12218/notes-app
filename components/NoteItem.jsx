//import TaskList from '@/components/TaskList'; import sin usar
import { useTheme } from '@/contexts/ThemeContext';
import { parseTasksFromText } from '@/services/taskUtils';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Path, Svg, SvgXml } from 'react-native-svg';

const NoteItem = ({ note, onDelete, onEdit }) => {
    const [expanded, setExpanded] = useState(false);
    const [reminderEnabled, setReminderEnabled] = useState(!!note.reminderAt);
    const [reminderDate, setReminderDate] = useState(
    note.reminderAt ? new Date(note.reminderAt) : new Date()
    );
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(note.text);
    const inputRef = useRef(null);
    
    const [tasks, setTasks] = useState(note.tasks || parseTasksFromText(note.text));

    const { theme } = useTheme();

    useEffect(() => {
      setTasks(note.tasks || parseTasksFromText(note.text));
      setEditedText(note.text);
      setReminderEnabled(!!note.reminderAt);
      setReminderDate(note.reminderAt ? new Date(note.reminderAt) : new Date());
    }, [note]);

    const handleSave = () => {
        if (editedText.trim() === '') {
            return;
        }
        const reminderAt = reminderEnabled ? reminderDate.toISOString() : null;
        onEdit(note.$id, editedText, reminderAt);
        setIsEditing(false);
    }

    const renderTaskItem = ({ item, drag, isActive }) => {
        return (
        <TouchableOpacity
            onLongPress={drag}
            disabled={isActive}
            style={{
                padding: 15,
                backgroundColor: isActive ? '#ddd' : '#fff',
                borderBottomWidth: 1,
                borderColor: '#ccc',
            }}
        >
            <Text>{item.text}</Text>
        </TouchableOpacity>
        );
    };


    return (<View style={[styles.noteItem, {
        backgroundColor: theme.cardBackground,
        borderColor: theme.text === '#FFFFFF' ? '#333' : '#eee'
    }]}>
            <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => setExpanded(!expanded)}
                onLongPress={() => setIsEditing(true)} // Abre edición con pulsación larga
                activeOpacity={0.8}
            ></TouchableOpacity>
            
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
    
    {note.drawing && typeof note.drawing === 'string' ? (
        <View style={styles.drawingContainer}>
            <SvgXml xml={note.drawing} width="100%" height={150} />
        </View>
        ) : note.drawing && Array.isArray(note.drawing) && note.drawing.length > 0 ? (
        <View style={{ marginVertical: 8 }}>
            {note.drawing.map((pathData, index) => (
            <Svg key={index} height={100} width={100}>
                <Path
                d={pathData.path}
                stroke={pathData.color || 'black'}
                strokeWidth={pathData.strokeWidth || 2}
                fill="transparent"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                </Svg>
            ))}
        </View>
    ) : null}

    
    <Text style={[styles.noteText, {color: theme.text}]}>
        {expanded ? note.text : note.text.split('\n')[0]}
    </Text>

    {/* Mostrar etiquetas y tareas solo si está expandido */}
    {expanded && note.tags && note.tags.length > 0 && (
        <View style={styles.tagsContainer}>
            {note.tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>#{tag}</Text>
            ))}
            </View>
        )}
        {expanded && (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <DraggableFlatList
                    data={tasks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTaskItem}
                    onDragEnd={({ data }) => setTasks(data)}
                    scrollEnabled={true}
                    style={{ marginTop: 10 }}
                />
            </GestureHandlerRootView>
        )}


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
    drawingContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 5,
        padding: 5,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 5,
    },
    tag: {
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        padding: 4,
        marginRight: 5,
        fontSize: 12,
    },
    taskItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    }
});    

export default NoteItem;