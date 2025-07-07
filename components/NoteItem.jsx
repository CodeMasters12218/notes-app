import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NoteItem = ({ note, onDelete }) => {
    return (<View style={styles.noteItem}>
            <Text style={styles.noteText}>{note.text}</Text>
            <TouchableOpacity onPress={() => onDelete(note.$id)}>
                <Text style={styles.delete}>❌</Text>

            </TouchableOpacity>
            </View>);  

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
    noteText: {
        fontSize: 18,
    },
    delete: {
        fontSize: 18,
        color: 'red',
    },
});    

export default NoteItem;