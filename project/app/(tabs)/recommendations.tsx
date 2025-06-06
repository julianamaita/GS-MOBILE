import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/utils/colors';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { Recommendation } from '@/types';
import { getRecommendations, initializeRecommendations } from '@/utils/storage';

export default function RecommendationsScreen() {
  const [recommendations, setRecommendations] = useState<{
    before: Recommendation[];
    during: Recommendation[];
    after: Recommendation[];
  }>({
    before: [],
    during: [],
    after: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadRecommendations = useCallback(async () => {
    try {
      await initializeRecommendations();
      const allRecommendations = await getRecommendations();
      
      const before = allRecommendations.filter(r => r.phase === 'before');
      const during = allRecommendations.filter(r => r.phase === 'during');
      const after = allRecommendations.filter(r => r.phase === 'after');
      
      setRecommendations({ before, during, after });
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRecommendations();
  }, [loadRecommendations]);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[600]]}
            tintColor={colors.primary[600]}
          />
        }
      >
        <Text style={styles.title}>Recomendações</Text>
        <Text style={styles.description}>
          Orientações e boas práticas para lidar com eventos de falta de energia 
          causados por desastres naturais.
        </Text>
        
        {recommendations.before.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Antes do Evento</Text>
            {recommendations.before.map((recommendation) => (
              <RecommendationCard 
                key={recommendation.id}
                recommendation={recommendation}
              />
            ))}
          </View>
        )}
        
        {recommendations.during.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Durante o Evento</Text>
            {recommendations.during.map((recommendation) => (
              <RecommendationCard 
                key={recommendation.id}
                recommendation={recommendation}
              />
            ))}
          </View>
        )}
        
        {recommendations.after.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Após o Evento</Text>
            {recommendations.after.map((recommendation) => (
              <RecommendationCard 
                key={recommendation.id}
                recommendation={recommendation}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: colors.gray[900],
    marginBottom: 8,
    marginTop: Platform.OS === 'android' ? 16 : 0,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.gray[700],
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.gray[800],
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});