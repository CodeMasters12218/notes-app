import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

const useAudioRecorder = () => {
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Access denied', 'You need to allow microphone access to record audio.');
      }
    };

    requestPermissions();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
    } catch (err) {
      console.error('Error starting recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      return uri;
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  };

  return { recording, audioUri, startRecording, stopRecording };
};