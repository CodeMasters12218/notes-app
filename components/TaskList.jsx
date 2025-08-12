import { config, database } from '@/services/appwrite';
import { serializeTasksToText } from '@/services/taskUtils';
import { useState } from 'react'; // import React sin usar
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

export default function TaskList({ noteId, initialTasks, onTasksChange }) {
  const [tasks, setTasks] = useState(initialTasks);

  const updateTasksInBackend = async (updatedTasks) => {
    try {
      const updatedText = serializeTasksToText(updatedTasks);
      
      await database.updateDocument(
        config.db,
        config.col.notes,
        noteId,
        { text: updatedText }
      );
      
      console.log("✅ Tareas actualizadas en Appwrite");
    } catch (error) {
      console.error("❌ Error actualizando tareas", error);
      Alert.alert("Error", "No se pudieron actualizar las tareas");
    }
  };

  const toggleTask = (id) => {
    const updated = tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    onTasksChange(updated);
    updateTasksInBackend(updated);
  };

  const renderItem = ({ item, drag, isActive }) => (
    <Pressable
      onLongPress={drag}
      style={[styles.taskItem, isActive && styles.activeTask]}
    >
      <Pressable
        onPress={() => toggleTask(item.id)}
        style={styles.checkbox}
      >
        <Text style={styles.checkboxText}>
          {item.completed ? '☑' : '☐'}
        </Text>
      </Pressable>
      <Text style={[styles.taskText, item.completed && styles.completedText]}>
        {item.text}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => {
          setTasks(data);
          onTasksChange(data);
          updateTasksInBackend(data);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  activeTask: { backgroundColor: '#e0e0e0' },
  checkbox: { marginRight: 8 },
  checkboxText: { fontSize: 18 },
  taskText: { fontSize: 16 },
  completedText: { 
    textDecorationLine: 'line-through', 
    color: '#999' 
  },
});