import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';

type Props = {
  uri: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
};

/**
 * Zeigt nur die linke Hälfte eines Bildes an.
 * Wird in Listen/Cards verwendet (MachineList, Reservations, BookingConfirm).
 * Auf der Detailseite wird stattdessen das volle Bild (normales <Image/>) genutzt.
 */
export default function CroppedThumbnail({ uri, size = 70, style, borderRadius = 8 }: Props) {
  return (
    <View style={[{ width: size, height: size, borderRadius, overflow: 'hidden', backgroundColor: 'white' }, style]}>
      <Image
        source={{ uri }}
        style={{
          width: size * 2,   // Bild doppelt so breit wie der Container
          height: size,
          position: 'absolute',
          left: 0,           // -> nur die linke Hälfte bleibt sichtbar
        }}
        resizeMode="cover"
      />
    </View>
  );
}
