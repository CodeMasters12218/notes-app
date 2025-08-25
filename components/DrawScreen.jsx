import AsyncStorage from '@react-native-async-storage/async-storage';
import { Canvas, PaintStyle, Path, Skia, StrokeCap, StrokeJoin } from '@shopify/react-native-skia';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, StyleSheet, View } from 'react-native';

function pathsToSVG(paths, width = 300, height = 300) {
  if (!paths || paths.length === 0) return '';
  
  const pathsData = paths.map(p => {
    const d = p.path.toSVGString();
    return `<path d="${d}" stroke="${p.color}" stroke-width="${p.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('\n');

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${pathsData}
    </svg>
  `;
}

export default function DrawScreen() {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const handleTouchStart = (event) => {
    const { locationX: x, locationY: y } = event.nativeEvent;
    const newPath = Skia.Path.Make();
    newPath.moveTo(x, y);
    setCurrentPath({
      path: newPath,
      color: '#000000',
      strokeWidth: 3
    });
  };

  const handleTouchMove = (event) => {
    if (!currentPath) return;
    const { locationX: x, locationY: y } = event.nativeEvent;
    currentPath.path.lineTo(x, y);
    setCurrentPath({ ...currentPath });
  };

  const handleTouchEnd = () => {
    if (currentPath) {
      setPaths(prev => [...prev, currentPath]);
      setCurrentPath(null);
    }
  };

  const handleSave = () => {
    const svgString = pathsToSVG(paths);
    AsyncStorage.setItem('lastDrawing', svgString)
      .then(() => {
        router.back();
      })
      .catch(err => {
        console.error('Error saving SVG:', err);
      });
  };

  return (
    <View style={styles.container}>
      <View
        style={styles.canvas}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Canvas style={{ flex: 1 }}>
          {paths.map((p, i) => (
            <Path
              key={i}
              path={p.path}
              color={p.color}
              style={PaintStyle.Stroke}
              strokeWidth={p.strokeWidth}
              strokeCap={StrokeCap.Round}
              strokeJoin={StrokeJoin.Round}
            />
          ))}
          {currentPath && (
            <Path
              path={currentPath.path}
              color={currentPath.color}
              style={PaintStyle.Stroke}
              strokeWidth={currentPath.strokeWidth}
              strokeCap={StrokeCap.Round}
              strokeJoin={StrokeJoin.Round}
            />
          )}
        </Canvas>
      </View>
      <View style={styles.buttons}>
        <Button title={t('drawingSave')} onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  canvas: { flex: 1, backgroundColor: 'white' },
  buttons: { padding: 20 }
});