import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Damage } from '@/types';
import { addDamage } from '@/utils/storage';
import { colors } from '@/utils/colors';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface DamageFormProps {
  onSuccess?: (damage: Damage) => void;
}

export function DamageForm({ onSuccess }: DamageFormProps) {
  const [description, setDescription] = useState('');
  const [affectedHomes, setAffectedHomes] = useState('');
  const [affectedBusinesses, setAffectedBusinesses] = useState('');
  const [otherImpacts, setOtherImpacts] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    description: '',
    affectedHomes: '',
    affectedBusinesses: '',
  });

  const validate = (): boolean => {
    const newErrors = {
      description: '',
      affectedHomes: '',
      affectedBusinesses: '',
    };
    
    if (!description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    
    if (affectedHomes && !/^\d+$/.test(affectedHomes)) {
      newErrors.affectedHomes = 'Deve ser um número';
    }
    
    if (affectedBusinesses && !/^\d+$/.test(affectedBusinesses)) {
      newErrors.affectedBusinesses = 'Deve ser um número';
    }
    
    setErrors(newErrors);
    
    return !newErrors.description && !newErrors.affectedHomes && !newErrors.affectedBusinesses;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const newDamage: Damage = {
        id: uuidv4(),
        description: description.trim(),
        affectedHomes: affectedHomes ? parseInt(affectedHomes, 10) : undefined,
        affectedBusinesses: affectedBusinesses ? parseInt(affectedBusinesses, 10) : undefined,
        otherImpacts: otherImpacts.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      
      const success = await addDamage(newDamage);
      
      if (success) {
        setDescription('');
        setAffectedHomes('');
        setAffectedBusinesses('');
        setOtherImpacts('');
        setErrors({
          description: '',
          affectedHomes: '',
          affectedBusinesses: '',
        });
        
        onSuccess?.(newDamage);
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o registro de prejuízos. Tente novamente.');
      }
    } catch (error) {
      console.error('Error saving damage:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o registro de prejuízos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <Input
        label="Descrição dos Prejuízos"
        placeholder="Descreva os prejuízos observados"
        value={description}
        onChangeText={setDescription}
        error={errors.description}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={styles.textArea}
        leftIcon={<AlertTriangle size={20} color={colors.primary[500]} />}
      />
      
      <Input
        label="Número de Residências Afetadas (opcional)"
        placeholder="Digite o número"
        value={affectedHomes}
        onChangeText={setAffectedHomes}
        error={errors.affectedHomes}
        keyboardType="numeric"
      />
      
      <Input
        label="Número de Estabelecimentos Afetados (opcional)"
        placeholder="Digite o número"
        value={affectedBusinesses}
        onChangeText={setAffectedBusinesses}
        error={errors.affectedBusinesses}
        keyboardType="numeric"
      />
      
      <Input
        label="Outros Impactos (opcional)"
        placeholder="Descreva outros impactos observados"
        value={otherImpacts}
        onChangeText={setOtherImpacts}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={styles.textArea}
      />
      
      <Button
        title="Registrar Prejuízos"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  button: {
    marginTop: 8,
  },
});