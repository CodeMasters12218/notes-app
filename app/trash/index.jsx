import { useAuth } from '@/contexts/AuthContext'; // Suponiendo que usas un contexto para user
import noteService from '@/services/noteService';
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function NotesScreen() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Solo trae notas en la papelera
  const fetchTrashNotes = async () => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }
    const response = await noteService.getTrashedNotes(user.$id);

    if (response.error) {
      Alert.alert('Error', response.error);
    } else {
      setNotes(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrashNotes();
  }, []);

  // Restaurar nota desde la papelera
  const handleRestore = (id) => {
    Alert.alert('Restore Note', 'Do you want to restore this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restore',
        onPress: async () => {
          const response = await noteService.restoreNote(id);
          if (response.error) {
            Alert.alert('Error', response.error);
          } else {
            setNotes(notes.filter((note) => note.$id !== id));
          }
        },
      },
    ]);
  };

  // Vaciar papelera permanentemente
  const handleEmptyTrash = () => {
    Alert.alert(
      'Empty Trash',
      'Are you sure you want to permanently delete all notes in the trash? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            const response = await noteService.emptyTrash(user.$id);
            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              setNotes([]);
            }
          },
        },
      ]
    );
  };

  const deleteNotePermanently = (id) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to permanently delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const response = await noteService.deleteNote(id);
            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              setNotes(notes.filter((note) => note.$id !== id));
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#eee',
        borderRadius: 5,
      }}
    >
      <Text style={{ marginBottom: 8 }}>{item.text}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
        <Button title="Restore" onPress={() => handleRestore(item.$id)} />
        <Button
          title="Delete"
          color="red"
          onPress={() => deleteNotePermanently(item.$id)}
        />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity
        onPress={handleEmptyTrash}
        style={{
          backgroundColor: 'red',
          padding: 10,
          borderRadius: 5,
          marginBottom: 15,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Empty Trash
        </Text>
      </TouchableOpacity>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>
            Trash is empty
          </Text>
        }
        refreshing={loading}
        onRefresh={fetchTrashNotes}
      />
    </View>
  );
}
