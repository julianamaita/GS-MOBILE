import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableCard } from '@/components/ui/Card';
import { Damage } from '@/types';
import { getDamages } from '@/utils/storage';
import { colors } from '@/utils/colors';
import { formatDate } from '@/utils/formatters';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface DamagesListProps {
  onSelectDamage?: (damage: Damage) => void;
  refreshTrigger?: number;
}

export function DamagesList({ onSelectDamage, refreshTrigger = 0 }: DamagesListProps) {
  const [damages, setDamages] = useState<Damage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadDamages = useCallback(async () => {
    try {
      const data = await getDamages();
      // Sort by creation date (newest first)
      const sortedData = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setDamages(sortedData);
    } catch (error) {
      console.error('Error loading damages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDamages();
  }, [loadDamages, refreshTrigger]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDamages();
  }, [loadDamages]);

  const handleSelectDamage = (damage: Damage) => {
    if (onSelectDamage) {
      onSelectDamage(damage);
    } else {
      // If no select handler is provided, navigate to details
      router.push(`/damage/${damage.id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (damages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <AlertTriangle size={48} color={colors.gray[400]} />
        <Text style={styles.emptyText}>Nenhum registro de prejuízo</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={damages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableCard 
          variant="elevated" 
          style={styles.card}
          onPress={() => handleSelectDamage(item)}
        >
          <View style={styles.damageHeader}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={20} color={colors.primary[600]} />
            </View>
            <Text style={styles.date}>Registrado em: {formatDate(item.createdAt)}</Text>
          </View>
          
          <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
          
          <View style={styles.statsContainer}>
            {item.affectedHomes !== undefined && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Residências:</Text>
                <Text style={styles.statValue}>{item.affectedHomes}</Text>
              </View>
            )}
            
            {item.affectedBusinesses !== undefined && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Estabelecimentos:</Text>
                <Text style={styles.statValue}>{item.affectedBusinesses}</Text>
              </View>
            )}
          </View>
        </TouchableCard>
      )}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary[600]]}
          tintColor={colors.primary[600]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 12,
    textAlign: 'center',
  },
  card: {
    marginBottom: 12,
  },
  damageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.gray[500],
  },
  description: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.gray[800],
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    marginRight: 16,
  },
  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.gray[600],
    marginRight: 4,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: colors.gray[800],
  },
});