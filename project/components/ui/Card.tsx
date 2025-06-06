import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewProps, 
  StyleProp, 
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps
} from 'react-native';
import { colors } from '@/utils/colors';

interface CardProps extends ViewProps {
  variant?: 'default' | 'outline' | 'elevated';
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function Card({ 
  variant = 'default', 
  style, 
  children, 
  ...rest 
}: CardProps) {
  // Get card style based on variant
  const getCardStyle = () => {
    switch (variant) {
      case 'default':
        return styles.defaultCard;
      case 'outline':
        return styles.outlineCard;
      case 'elevated':
        return styles.elevatedCard;
      default:
        return styles.defaultCard;
    }
  };

  return (
    <View style={[styles.card, getCardStyle(), style]} {...rest}>
      {children}
    </View>
  );
}

interface TouchableCardProps extends TouchableOpacityProps {
  variant?: 'default' | 'outline' | 'elevated';
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function TouchableCard({ 
  variant = 'default', 
  style, 
  children, 
  ...rest 
}: TouchableCardProps) {
  // Get card style based on variant
  const getCardStyle = () => {
    switch (variant) {
      case 'default':
        return styles.defaultCard;
      case 'outline':
        return styles.outlineCard;
      case 'elevated':
        return styles.elevatedCard;
      default:
        return styles.defaultCard;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, getCardStyle(), style]} 
      activeOpacity={0.7}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  defaultCard: {
    backgroundColor: colors.white,
  },
  outlineCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  elevatedCard: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});