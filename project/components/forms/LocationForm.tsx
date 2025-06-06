import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Location } from '@/types';
import { addLocation } from '@/utils/storage';
import { colors } from '@/utils/colors';
import { MapPin } from 'lucide-react-native';

interface LocationFormProps {
  onSuccess?: (location: Location) => void;
}

export function LocationForm({ onSuccess }: LocationFormProps) {
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    neighborhood: '',
    city: '',
    zipCode: '',
  });

  const validate = (): boolean => {
    const newErrors = {
      neighborhood: '',
      city: '',
      zipCode: '',
    };
    
    if (!neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }
    
    if (!city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }
    
    if (zipCode.trim() && !/^\d{5}-?\d{3}$/.test(zipCode.trim())) {
      newErrors.zipCode = 'CEP deve estar no formato 00000-000';
    }
    
    setErrors(newErrors);
    
    return !newErrors.neighborhood && !newErrors.city && !newErrors.zipCode;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const newLocation: Location = {
        id: uuidv4(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        zipCode: zipCode.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      
      const success = await addLocation(newLocation);
      
      if (success) {
        setNeighborhood('');
        setCity('');
        setZipCode('');
        setErrors({
          neighborhood: '',
          city: '',
          zipCode: '',
        });
        
        onSuccess?.(newLocation);
      } else {
        Alert.alert('Erro', 'Não foi possível salvar a localização. Tente novamente.');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar a localização.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <Input
        label="Bairro"
        placeholder="Digite o bairro afetado"
        value={neighborhood}
        onChangeText={setNeighborhood}
        error={errors.neighborhood}
        leftIcon={<MapPin size={20} color={colors.primary[500]} />}
      />
      
      <Input
        label="Cidade"
        placeholder="Digite a cidade"
        value={city}
        onChangeText={setCity}
        error={errors.city}
      />
      
      <Input
        label="CEP (opcional)"
        placeholder="00000-000"
        value={zipCode}
        onChangeText={setZipCode}
        error={errors.zipCode}
        keyboardType="numeric"
      />
      
      <Button
        title="Registrar Localização"
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
  button: {
    marginTop: 8,
  },
});