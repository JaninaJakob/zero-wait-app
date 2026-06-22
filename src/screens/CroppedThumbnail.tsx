import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';

type Props = {
  uri: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
};

/**
 * Zeigt das komplette Bild (unverzerrt, vollständig sichtbar) innerhalb
 * eines quadratischen Containers an. Wird in Listen/Cards verwendet
 * (MachineList, Reservations, BookingConfirm).
 */
export default function CroppedThumbnail({ uri, size = 70, style, borderRadius = 8 }: Props) {
  return (
    <View style={[{ width: size, height: size, borderRadius, overflow: 'hidden', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }, style]}>
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}


