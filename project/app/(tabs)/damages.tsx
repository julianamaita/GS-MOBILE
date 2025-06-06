import React, { useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/utils/colors';
import { DamageForm } from '@/components/forms/DamageForm';
import { DamagesList } from '@/components/lists/DamagesList';
import { Damage } from '@/types';

export default function DamagesScreen() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  
  const handleSuccess = (damage: Damage) => {
    setActiveTab('list');
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.title}>Prejuízos Causados</Text>
        
        <View style={styles.tabContainer}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'list' && styles.activeTabText,
            ]}
            onPress={() => setActiveTab('list')}
          >
            Visualizar
          </Text>
          <Text
            style={[
              styles.tabText,
              activeTab === 'add' && styles.activeTabText,
            ]}
            onPress={() => setActiveTab('add')}
          >
            Adicionar
          </Text>
        </View>
      </View>
      
      {activeTab === 'list' ? (
        <DamagesList refreshTrigger={refreshTrigger} />
      ) : (
        <View style={styles.formContainer}>
          <DamageForm onSuccess={handleSuccess} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: colors.gray[900],
    marginBottom: 16,
    marginTop: Platform.OS === 'android' ? 16 : 0,
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.gray[500],
    marginRight: 24,
    paddingBottom: 8,
  },
  activeTabText: {
    color: colors.primary[600],
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[600],
  },
  formContainer: {
    padding: 16,
  },
});