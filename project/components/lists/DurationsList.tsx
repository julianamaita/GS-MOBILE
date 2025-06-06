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
import { Duration } from '@/types';
import { getDurations } from '@/utils/storage';
import { colors } from '@/utils/colors';
import { formatDateTime, calculateDurationHours, formatDuration } from '@/utils/formatters';
import { Clock } from 'lucide-react-native';

interface DurationsListProps {
  onSelectDuration?: (duration: Duration) => void;
  refreshTrigger?: number;
}

export function DurationsList({ onSelectDuration, refreshTrigger = 0 }: DurationsListProps) {
  const [durations, setDurations] = useState<Duration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadDurations = useCallback(async () => {
    try {
      const data = await getDurations();
      // Sort by creation date (newest first)
      const sortedData = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setDurations(sortedData);
    } catch (error) {
      console.error('Error loading durations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDurations();
  }, [loadDurations, refreshTrigger]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDurations();
  }, [loadDurations]);

  const handleSelectDuration = (duration: Duration) => {
    if (onSelectDuration) {
      onSelectDuration(duration);
    } else {
      // If no select handler is provided, navigate to details
      router.push(`/duration/${duration.id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (durations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Clock size={48} color={colors.gray[400]} />
        <Text style={styles.emptyText}>Nenhum registro de tempo</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={durations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const durationHours = calculateDurationHours(item.startTime, item.endTime);
        const formattedDuration = formatDuration(durationHours);
        
        return (
          <TouchableCard 
            variant="elevated" 
            style={styles.card}
            onPress={() => handleSelectDuration(item)}
          >
            <View style={styles.durationHeader}>
              <View style={styles.iconContainer}>
                <Clock size={20} color={colors.primary[600]} />
              </View>
              <Text style={styles.duration}>{formattedDuration}</Text>
              {item.isEstimated && (
                <View style={styles.estimatedBadge}>
                  <Text style={styles.estimatedText}>Estimado</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.timeLabel}>Início:</Text>
            <Text style={styles.time}>{formatDateTime(item.startTime)}</Text>
            
            {item.endTime ? (
              <>
                <Text style={styles.timeLabel}>Término:</Text>
                <Text style={styles.time}>{formatDateTime(item.endTime)}</Text>
              </>
            ) : (
              <Text style={styles.ongoing}>Em andamento</Text>
            )}
          </TouchableCard>
        );
      }}
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
  durationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  duration: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.gray[900],
    flex: 1,
  },
  estimatedBadge: {
    backgroundColor: colors.warning[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  estimatedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.warning[700],
  },
  timeLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.gray[700],
    marginBottom: 2,
  },
  time: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.gray[800],
    marginBottom: 8,
  },
  ongoing: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.warning[600],
    marginTop: 4,
  },
});