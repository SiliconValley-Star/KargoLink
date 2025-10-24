import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Switch,
  Platform,
  Linking,
  SafeAreaView,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiClient } from '../../services/api/client';

interface PaymentProvider {
  id: string;
  name: string;
  description: string;
  fees: string;
  processingTime: string;
  features: string[];
  rating: number;
}

interface InstallmentOption {
  count: number;
  interestRate: number;
  installmentPrice: number;
  totalPrice: number;
}

interface PaymentFormData {
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  provider: string;
  installmentCount?: number;
  customerInfo: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
}

const PaymentScreen: React.FC = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [installments, setInstallments] = useState<InstallmentOption[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
  const [saveCard, setSaveCard] = useState(false);
  
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: route.params?.amount || 150.00,
    currency: 'TRY',
    description: route.params?.description || 'Kargo Gönderim Ücreti',
    paymentMethod: 'credit_card',
    provider: '',
    customerInfo: {
      email: user?.email || '',
      phone: user?.phone || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || ''
    }
  });

  const [cardData, setCardData] = useState({
    number: '',
    holderName: '',
    expiry: '',
    cvv: ''
  });

  // Mock data
  const mockProviders: PaymentProvider[] = [
    {
      id: 'iyzico',
      name: 'İyzico',
      description: 'Türkiye\'nin önde gelen ödeme altyapısı',
      fees: '%2.9 + 0.25₺',
      processingTime: 'Anında',
      features: ['3D Secure', 'Anında Ödeme', 'Taksit Seçenekleri'],
      rating: 4.8
    },
    {
      id: 'paytr',
      name: 'PayTR',
      description: 'Güvenilir Türk ödeme sistemi',
      fees: '%2.7 + 0.30₺',
      processingTime: 'Anında',
      features: ['SSL Güvenliği', 'Hızlı İşlem'],
      rating: 4.6
    }
  ];

  const mockInstallments: InstallmentOption[] = [
    { count: 1, interestRate: 0, installmentPrice: 150.00, totalPrice: 150.00 },
    { count: 2, interestRate: 0, installmentPrice: 75.00, totalPrice: 150.00 },
    { count: 3, interestRate: 1.5, installmentPrice: 51.13, totalPrice: 153.38 },
    { count: 6, interestRate: 3.5, installmentPrice: 26.06, totalPrice: 156.38 },
    { count: 9, interestRate: 5.5, installmentPrice: 18.04, totalPrice: 162.38 },
    { count: 12, interestRate: 7.5, installmentPrice: 13.78, totalPrice: 165.38 }
  ];

  useEffect(() => {
    setProviders(mockProviders);
    setInstallments(mockInstallments);
    setSelectedProvider('iyzico');
  }, []);

  const formatCardNumber = (text: string): string => {
    return text.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (text: string): string => {
    return text.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
  };

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    switch (field) {
      case 'number':
        formattedValue = formatCardNumber(value.replace(/\D/g, ''));
        if (formattedValue.replace(/\s/g, '').length > 16) return;
        break;
      case 'expiry':
        formattedValue = formatExpiry(value);
        if (formattedValue.length > 5) return;
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '');
        if (formattedValue.length > 3) return;
        break;
      case 'holderName':
        formattedValue = value.toUpperCase();
        break;
    }
    
    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateForm = (): boolean => {
    if (!selectedProvider) {
      Alert.alert('Hata', 'Lütfen bir ödeme sağlayıcısı seçin');
      return false;
    }

    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 16) {
      Alert.alert('Hata', 'Lütfen geçerli bir kart numarası girin');
      return false;
    }

    if (!cardData.holderName) {
      Alert.alert('Hata', 'Lütfen kart sahibi adını girin');
      return false;
    }

    if (!cardData.expiry || cardData.expiry.length < 5) {
      Alert.alert('Hata', 'Lütfen geçerli bir son kullanma tarihi girin');
      return false;
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      Alert.alert('Hata', 'Lütfen geçerli bir CVV kodu girin');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock payment result
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        navigation.navigate('PaymentSuccess', {
          paymentId: 'payment_12345',
          amount: formData.amount,
          provider: selectedProvider
        });
      } else {
        navigation.navigate('PaymentFailure', {
          errorCode: 'PAYMENT_FAILED',
          errorMessage: 'Ödeme işlemi başarısız oldu',
          provider: selectedProvider
        });
      }
    } catch (error) {
      Alert.alert('Hata', 'Ödeme işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      paddingTop: Platform.OS === 'ios' ? 20 : 0,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    providerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    providerCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight + '20',
    },
    providerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    providerName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    providerRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    providerDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    providerFeatures: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    featureBadge: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
      marginBottom: 4,
    },
    featureText: {
      fontSize: 12,
      color: theme.colors.primary,
    },
    providerInfo: {
      flexDirection: 'row',
      justifiContent: 'space-between',
      alignItems: 'center',
    },
    infoText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
    },
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    inputHalf: {
      width: '48%',
    },
    installmentCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    installmentCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight + '10',
    },
    installmentHeader: {
      flexDirection: 'row',
      justifiContent: 'space-between',
      alignItems: 'center',
    },
    installmentCount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    installmentDetails: {
      alignItems: 'flex-end',
    },
    installmentPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    installmentTotal: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    summaryTotal: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    saveCardContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
    },
    saveCardText: {
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
      marginRight: 16,
    },
    payButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    payButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
    },
    payButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    securityInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    securityText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginLeft: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Güvenli Ödeme</Text>
          </View>

          {/* Payment Providers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ödeme Sağlayıcısı</Text>
            {providers.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerCard,
                  selectedProvider === provider.id && styles.providerCardSelected
                ]}
                onPress={() => {
                  setSelectedProvider(provider.id);
                  setFormData(prev => ({ ...prev, provider: provider.id }));
                }}
              >
                <View style={styles.providerHeader}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <View style={styles.providerRating}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{provider.rating}</Text>
                  </View>
                </View>
                <Text style={styles.providerDescription}>{provider.description}</Text>
                <View style={styles.providerFeatures}>
                  {provider.features.slice(0, 2).map((feature) => (
                    <View key={feature} style={styles.featureBadge}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.infoText}>{provider.processingTime}</Text>
                  <Text style={styles.infoText}>{provider.fees}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Card Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kart Bilgileri</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kart Numarası</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChangeText={(text) => handleCardInputChange('number', text)}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kart Sahibi</Text>
              <TextInput
                style={styles.input}
                placeholder="ADI SOYADI"
                value={cardData.holderName}
                onChangeText={(text) => handleCardInputChange('holderName', text)}
                autoCapitalize="characters"
              />
            </View>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text style={styles.inputLabel}>Son Kullanma</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChangeText={(text) => handleCardInputChange('expiry', text)}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cardData.cvv}
                  onChangeText={(text) => handleCardInputChange('cvv', text)}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* Installments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Taksit Seçenekleri</Text>
            {installments.slice(0, 4).map((option) => (
              <TouchableOpacity
                key={option.count}
                style={[
                  styles.installmentCard,
                  selectedInstallment === option.count && styles.installmentCardSelected
                ]}
                onPress={() => setSelectedInstallment(option.count)}
              >
                <View style={styles.installmentHeader}>
                  <Text style={styles.installmentCount}>
                    {option.count} Taksit
                  </Text>
                  <View style={styles.installmentDetails}>
                    <Text style={styles.installmentPrice}>
                      {option.installmentPrice.toFixed(2)} ₺ x {option.count}
                    </Text>
                    <Text style={styles.installmentTotal}>
                      Toplam: {option.totalPrice.toFixed(2)} ₺
                      {option.interestRate > 0 && ` (%${option.interestRate} faiz)`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Sipariş Özeti</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Kargo Ücreti</Text>
              <Text style={styles.summaryValue}>₺{formData.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Hizmet Bedeli</Text>
              <Text style={styles.summaryValue}>₺5.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>KDV</Text>
              <Text style={styles.summaryValue}>₺{((formData.amount + 5) * 0.18).toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 8, marginTop: 8 }]}>
              <Text style={[styles.summaryLabel, { fontSize: 16, fontWeight: 'bold', color: theme.colors.text }]}>Toplam</Text>
              <Text style={styles.summaryTotal}>₺{((formData.amount + 5) * 1.18).toFixed(2)}</Text>
            </View>
          </View>

          {/* Save Card Option */}
          <View style={styles.saveCardContainer}>
            <Text style={styles.saveCardText}>
              Kart bilgilerimi gelecek ödemeler için kaydet
            </Text>
            <Switch
              value={saveCard}
              onValueChange={setSaveCard}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
              thumbColor={saveCard ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>

          {/* Payment Button */}
          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.payButtonText}>
                <MaterialIcons name="security" size={16} color="white" />
                {' '}Güvenli Ödeme Yap
              </Text>
            )}
          </TouchableOpacity>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <MaterialIcons name="security" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.securityText}>
              Ödemeniz SSL ile şifrelenmiş güvenli bağlantı üzerinden işlenir.{'\n'}
              Kart bilgileriniz saklanmaz.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PaymentScreen;