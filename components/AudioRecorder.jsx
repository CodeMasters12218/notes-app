import { Audio } from 'expo-av';
import { useState } from 'react';
import { Button, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';

export default function AudioRecorder({ onRecordingComplete }) {
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to record audio.',
            
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.error('Microphone permission denied');
          return;
        }  
      }  
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.error('Permission to access microphone was denied');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();

      setRecording(recording);
      setIsRecording(true);
      setRecordedUri(null);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
      setIsRecording(false);

      if (onRecordingComplete) {
        onRecordingComplete(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={isRecording ? 'Stop recording' : 'Record audio'}
        onPress={isRecording ? stopRecording : startRecording}
      />
      {recordedUri && <Text style={styles.text}>Recorded audio: {recordedUri}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    alignItems: 'center',
  },
  text: {
    marginTop: 8,
    fontSize: 12,
    color: '#555',
  },
});