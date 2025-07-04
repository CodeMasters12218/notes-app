import { StyleSheet, Text, View } from 'react-native';

const NoteItem = ({ note }) => {
    return (<View style={styles.noteItem}>
            <Text style={styles.noteText}>{note.text}</Text>
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
});    

export default NoteItem;