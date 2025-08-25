import { useAuth } from '@/contexts/AuthContext';
import noteService from '@/services/noteService';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function NotesScreen() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const fetchTrashNotes = async () => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }
    const response = await noteService.getTrashedNotes(user.$id);

    if (response.error) {
      Alert.alert(t('error'), response.error);
    } else {
      setNotes(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrashNotes();
  }, []);

  const handleRestore = (id) => {
    Alert.alert(t('restoreNote'), t('restoreNoteText'), [
      { text: t('cancelButton'), style: 'cancel' },
      {
        text: t('restoreButton'),
        onPress: async () => {
          const response = await noteService.restoreNote(id);
          if (response.error) {
            Alert.alert(t('error'), response.error);
          } else {
            setNotes(notes.filter((note) => note.$id !== id));
          }
        },
      },
    ]);
  };

  const handleEmptyTrash = () => {
    Alert.alert(
      t('emptyTrash'),
      t('emptyTrashConfirm'),
      [
        { text: t('cancelButton'), style: 'cancel' },
        {
          text: t('deleteButton'),
          style: 'destructive',
          onPress: async () => {
            const response = await noteService.emptyTrash(user.$id);
            if (response.error) {
              Alert.alert(t('error'), response.error);
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
      t('deleteNoteConfirm'),
      t('deleteNoteText'),
      [
        { text: t('cancelButton'), style: 'cancel' },
        {
          text: t('deleteButton'),
          style: 'destructive',
          onPress: async () => {
            const response = await noteService.deleteNote(id);
            if (response.error) {
              Alert.alert(t('error'), response.error);
            } else {
              setNotes(notes.filter((note) => note.$id !== id));
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={{
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#eee',
        borderRadius: 5,
      }}
    >
      <Text style={{ marginBottom: 8 }}>{item.text}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
        <Button title={t('restoreButton')} onPress={() => handleRestore(item.$id)} />
        <Button
          title={t('deleteButton')}
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
          {t('emptyTrash')}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>
            {t('emptyTrash')}
          </Text>
        }
        refreshing={loading}
        onRefresh={fetchTrashNotes}
      />
    </View>
  );
}