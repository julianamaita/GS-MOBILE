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
import { Location } from '@/types';
import { getLocations } from '@/utils/storage';
import { colors } from '@/utils/colors';
import { formatDate } from '@/utils/formatters';
import { MapPin } from 'lucide-react-native';

interface LocationsListProps {
  onSelectLocation?: (location: Location) => void;
  refreshTrigger?: number;
}

export function LocationsList({ onSelectLocation, refreshTrigger = 0 }: LocationsListProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadLocations = useCallback(async () => {
    try {
      const data = await getLocations();
      // Sort by creation date (newest first)
      const sortedData = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLocations(sortedData);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations, refreshTrigger]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLocations();
  }, [loadLocations]);

  const handleSelectLocation = (location: Location) => {
    if (onSelectLocation) {
      onSelectLocation(location);
    } else {
      // If no select handler is provided, navigate to details
      router.push(`/location/${location.id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (locations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MapPin size={48} color={colors.gray[400]} />
        <Text style={styles.emptyText}>Nenhuma localização registrada</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={locations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableCard 
          variant="elevated" 
          style={styles.card}
          onPress={() => handleSelectLocation(item)}
        >
          <View style={styles.locationHeader}>
            <View style={styles.iconContainer}>
              <MapPin size={20} color={colors.primary[600]} />
            </View>
            <Text style={styles.neighborhood}>{item.neighborhood}</Text>
          </View>
          <Text style={styles.city}>{item.city}</Text>
          {item.zipCode && <Text style={styles.zipCode}>CEP: {item.zipCode}</Text>}
          <Text style={styles.date}>Registrado em: {formatDate(item.createdAt)}</Text>
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
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainer: {
    marginRight: 8,
  },
  neighborhood: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.gray[900],
  },
  city: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: 28,
    marginBottom: 4,
  },
  zipCode: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 28,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 8,
    textAlign: 'right',
  },
});