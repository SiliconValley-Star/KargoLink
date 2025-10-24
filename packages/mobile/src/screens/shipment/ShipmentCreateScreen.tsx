import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {useAuth} from '../../contexts/AuthContext';
import {shipmentService, ShipmentQuote} from '../../services/api/shipment';

interface ShipmentCreateScreenProps {
  navigation: any;
}

interface StepData {
  title: string;
  description: string;
  isCompleted: boolean;
}

interface Address {
  name: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
}

interface PackageDetails {
  type: string;
  description: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  value: string;
  specialRequirements: string[];
}

interface CarrierQuote {
  id: string;
  name: string;
  logo: string;
  price: number;
  estimatedDays: number;
  features: string[];
  rating: number;
  isRecommended?: boolean;
}

const ShipmentCreateScreen: React.FC<ShipmentCreateScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const {user} = useAuth();

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [senderAddress, setSenderAddress] = useState<Address>({
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone || '',
    email: user?.email || '',
    street: '',
    city: '',
    district: '',
    postalCode: '',
  });

  const [receiverAddress, setReceiverAddress] = useState<Address>({
    name: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    district: '',
    postalCode: '',
  });

  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    type: '',
    description: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
    value: '',
    specialRequirements: [],
  });

  const [quotes, setQuotes] = useState<CarrierQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<CarrierQuote | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Form steps
  const steps: StepData[] = [
    {
      title: 'Gönderici Bilgileri',
      description: 'Gönderen adres ve iletişim bilgileri',
      isCompleted: false,
    },
    {
      title: 'Alıcı Bilgileri',
      description: 'Teslim alacak kişi bilgileri',
      isCompleted: false,
    },
    {
      title: 'Paket Detayları',
      description: 'Gönderilecek paketin özellikleri',
      isCompleted: false,
    },
    {
      title: 'Fiyat Karşılaştırma',
      description: 'En uygun taşıyıcıyı seçin',
      isCompleted: false,
    },
    {
      title: 'Onay',
      description: 'Gönderi bilgilerini kontrol edin',
      isCompleted: false,
    },
  ];

  // Package types
  const packageTypes = [
    {id: 'DOCUMENT', label: 'Evrak', emoji: '📄'},
    {id: 'PARCEL', label: 'Koli', emoji: '📦'},
    {id: 'FOOD', label: 'Gıda', emoji: '🍎'},
    {id: 'ELECTRONICS', label: 'Elektronik', emoji: '📱'},
    {id: 'TEXTILE', label: 'Tekstil', emoji: '👕'},
    {id: 'FRAGILE', label: 'Kırılabilir', emoji: '🍷'},
  ];

  // Special requirements
  const specialRequirements = [
    {id: 'COLD_CHAIN', label: 'Soğuk Zincir', emoji: '❄️'},
    {id: 'FRAGILE_HANDLING', label: 'Özel Dikkat', emoji: '⚠️'},
    {id: 'EXPRESS_DELIVERY', label: 'Hızlı Teslimat', emoji: '⚡'},
    {id: 'INSURANCE_REQUIRED', label: 'Sigorta Gerekli', emoji: '🛡️'},
    {id: 'SIGNATURE_REQUIRED', label: 'İmzalı Teslim', emoji: '✍️'},
    {id: 'WEEKEND_DELIVERY', label: 'Hafta Sonu Teslim', emoji: '🏠'},
  ];

  // Mock quotes data
  const mockQuotes: CarrierQuote[] = [
    {
      id: '1',
      name: 'Yurtiçi Kargo',
      logo: '🚚',
      price: 28.50,
      estimatedDays: 2,
      features: ['Kapıdan Kapıya', 'SMS Bilgilendirme', 'Online Takip'],
      rating: 4.5,
      isRecommended: true,
    },
    {
      id: '2',
      name: 'Aras Kargo',
      logo: '📦',
      price: 25.00,
      estimatedDays: 3,
      features: ['Ekonomik', 'SMS Bilgilendirme', 'Online Takip'],
      rating: 4.2,
    },
    {
      id: '3',
      name: 'MNG Kargo',
      logo: '🚛',
      price: 32.00,
      estimatedDays: 1,
      features: ['Aynı Gün', 'Sigorta Dahil', 'Öncelikli İşleme'],
      rating: 4.7,
    },
  ];

  // Validation functions
  const validateSenderAddress = (): boolean => {
    return Boolean(senderAddress.name.trim()) &&
           Boolean(senderAddress.phone.trim()) &&
           Boolean(senderAddress.street.trim()) &&
           Boolean(senderAddress.city.trim());
  };

  const validateReceiverAddress = (): boolean => {
    return Boolean(receiverAddress.name.trim()) &&
           Boolean(receiverAddress.phone.trim()) &&
           Boolean(receiverAddress.street.trim()) &&
           Boolean(receiverAddress.city.trim());
  };

  const validatePackageDetails = () => {
    return packageDetails.type && 
           packageDetails.description.trim() && 
           packageDetails.weight.trim() && 
           parseFloat(packageDetails.weight) > 0;
  };

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 0:
        isValid = validateSenderAddress();
        if (!isValid) {
          Alert.alert('Hata', 'Lütfen tüm gerekli gönderici bilgilerini doldurun.');
          return;
        }
        break;
      case 1:
        isValid = validateReceiverAddress();
        if (!isValid) {
          Alert.alert('Hata', 'Lütfen tüm gerekli alıcı bilgilerini doldurun.');
          return;
        }
        break;
      case 2:
        isValid = validatePackageDetails();
        if (!isValid) {
          Alert.alert('Hata', 'Lütfen paket detaylarını eksiksiz doldurun.');
          return;
        }
        // Quotes fetch etme işlemi
        await fetchQuotes();
        break;
      case 3:
        if (!selectedQuote) {
          Alert.alert('Hata', 'Lütfen bir taşıyıcı seçin.');
          return;
        }
        isValid = true;
        break;
      case 4:
        // Final submission
        await handleSubmit();
        return;
    }

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      // Gerçek API çağrısı
      const response = await shipmentService.getQuotes(
        senderAddress,
        receiverAddress,
        {
          type: packageDetails.type,
          description: packageDetails.description,
          weight: parseFloat(packageDetails.weight),
          dimensions: {
            length: parseFloat(packageDetails.dimensions.length) || 10,
            width: parseFloat(packageDetails.dimensions.width) || 10,
            height: parseFloat(packageDetails.dimensions.height) || 10,
          },
          value: parseFloat(packageDetails.value) || 0,
          specialRequirements: packageDetails.specialRequirements,
        }
      );
      
      if (response.success) {
        // Type conversion for quotes
        const convertedQuotes: CarrierQuote[] = response.data.map((quote: ShipmentQuote) => ({
          id: quote.carrierId || quote.id,
          name: quote.carrierName || 'Unknown',
          logo: '🚚',
          price: quote.price || 0,
          estimatedDays: quote.estimatedDays || 1,
          features: quote.features || ['Standart Teslimat'],
          rating: 4.0,
          isRecommended: false,
        }));
        setQuotes(convertedQuotes);
      } else {
        // Fallback to mock data if API fails
        setQuotes(mockQuotes);
      }
    } catch (error) {
      console.error('Quote fetch error:', error);
      // Fallback to mock data
      setQuotes(mockQuotes);
      Alert.alert('Bilgi', 'Gerçek fiyat teklifleri alınamadı, demo veriler gösteriliyor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedQuote) return;

    setIsLoading(true);
    try {
      // Gerçek API çağrısı
      const response = await shipmentService.createShipment({
        senderAddress,
        receiverAddress,
        packageDetails: {
          type: packageDetails.type,
          description: packageDetails.description,
          weight: parseFloat(packageDetails.weight),
          dimensions: {
            length: parseFloat(packageDetails.dimensions.length) || 10,
            width: parseFloat(packageDetails.dimensions.width) || 10,
            height: parseFloat(packageDetails.dimensions.height) || 10,
          },
          value: parseFloat(packageDetails.value) || 0,
          specialRequirements: packageDetails.specialRequirements,
        },
        selectedQuoteId: selectedQuote.id,
        notes: 'Mobile app\'den oluşturuldu',
      });

      if (response.success) {
        Alert.alert(
          'Başarılı!',
          `Gönderiniz başarıyla oluşturuldu. Takip numaranız: ${response.data.trackingNumber}`,
          [
            {
              text: 'Gönderileri Görüntüle',
              onPress: () => navigation.navigate('Shipments')
            }
          ]
        );
      } else {
        Alert.alert('Hata', response.message || 'Gönderi oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Shipment creation error:', error);
      Alert.alert('Hata', 'Gönderi oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            {
              backgroundColor: index <= currentStep 
                ? theme.colors.primary 
                : theme.colors.surfaceVariant,
            }
          ]}>
            <Text style={[
              styles.stepNumber,
              {
                color: index <= currentStep 
                  ? theme.colors.onPrimary 
                  : theme.colors.onSurfaceVariant,
              }
            ]}>
              {index + 1}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              {
                backgroundColor: index < currentStep 
                  ? theme.colors.primary 
                  : theme.colors.surfaceVariant,
              }
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderSenderForm = () => (
    <View style={styles.formContainer}>
      <Text style={[styles.stepTitle, {color: theme.colors.onBackground}]}>
        {steps[0].title}
      </Text>
      <Text style={[styles.stepDescription, {color: theme.colors.onSurfaceVariant}]}>
        {steps[0].description}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
          Ad Soyad *
        </Text>
        <TextInput
          style={[styles.textInput, {
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          }]}
          value={senderAddress.name}
          onChangeText={(text) => setSenderAddress({...senderAddress, name: text})}
          placeholder="Gönderen kişi adı"
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
          Telefon *
        </Text>
        <TextInput
          style={[styles.textInput, {
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          }]}
          value={senderAddress.phone}
          onChangeText={(text) => setSenderAddress({...senderAddress, phone: text})}
          placeholder="05XX XXX XX XX"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
          E-posta
        </Text>
        <TextInput
          style={[styles.textInput, {
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          }]}
          value={senderAddress.email}
          onChangeText={(text) => setSenderAddress({...senderAddress, email: text})}
          placeholder="ornek@email.com"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
          Adres *
        </Text>
        <TextInput
          style={[styles.textInput, styles.textArea, {
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          }]}
          value={senderAddress.street}
          onChangeText={(text) => setSenderAddress({...senderAddress, street: text})}
          placeholder="Sokak, Mahalle, Bina No, Daire"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
          <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
            İl *
          </Text>
          <TextInput
            style={[styles.textInput, {
              borderColor: theme.colors.outline,
              backgroundColor: theme.colors.surface,
              color: theme.colors.onSurface,
            }]}
            value={senderAddress.city}
            onChangeText={(text) => setSenderAddress({...senderAddress, city: text})}
            placeholder="İstanbul"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>
        <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
          <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
            İlçe
          </Text>
          <TextInput
            style={[styles.textInput, {
              borderColor: theme.colors.outline,
              backgroundColor: theme.colors.surface,
              color: theme.colors.onSurface,
            }]}
            value={senderAddress.district}
            onChangeText={(text) => setSenderAddress({...senderAddress, district: text})}
            placeholder="Kadıköy"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </View>
    </View>
  );

  const renderReceiverForm = () => (
    <View style={styles.formContainer}>
      <Text style={[styles.stepTitle, {color: theme.colors.onBackground}]}>
        {steps[1].title}
      </Text>
      <Text style={[styles.stepDescription, {color: theme.colors.onSurfaceVariant}]}>
        {steps[1].description}
      </Text>

      {/* Receiver form fields similar to sender */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
          Ad Soyad *
        </Text>
        <TextInput
          style={[styles.textInput, {
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          }]}
          value={receiverAddress.name}
          onChangeText={(text) => setReceiverAddress({...receiverAddress, name: text})}
          placeholder="Alıcı kişi adı"
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
          Telefon *
        </Text>
        <TextInput
          style={[styles.textInput, {
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          }]}
          value={receiverAddress.phone}
          onChangeText={(text) => setReceiverAddress({...receiverAddress, phone: text})}
          placeholder="05XX XXX XX XX"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
          Adres *
        </Text>
        <TextInput
          style={[styles.textInput, styles.textArea, {
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          }]}
          value={receiverAddress.street}
          onChangeText={(text) => setReceiverAddress({...receiverAddress, street: text})}
          placeholder="Teslimat adresi detayları"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
          <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
            İl *
          </Text>
          <TextInput
            style={[styles.textInput, {
              borderColor: theme.colors.outline,
              backgroundColor: theme.colors.surface,
              color: theme.colors.onSurface,
            }]}
            value={receiverAddress.city}
            onChangeText={(text) => setReceiverAddress({...receiverAddress, city: text})}
            placeholder="Ankara"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>
        <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
          <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
            İlçe
          </Text>
          <TextInput
            style={[styles.textInput, {
              borderColor: theme.colors.outline,
              backgroundColor: theme.colors.surface,
              color: theme.colors.onSurface,
            }]}
            value={receiverAddress.district}
            onChangeText={(text) => setReceiverAddress({...receiverAddress, district: text})}
            placeholder="Çankaya"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </View>
    </View>
  );

  const renderPackageForm = () => (
    <View style={styles.formContainer}>
      <Text style={[styles.stepTitle, {color: theme.colors.onBackground}]}>
        {steps[2].title}
      </Text>
      <Text style={[styles.stepDescription, {color: theme.colors.onSurfaceVariant}]}>
        {steps[2].description}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
          Paket Türü *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
          {packageTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionChip,
                {
                  backgroundColor: packageDetails.type === type.id 
                    ? theme.colors.primaryContainer 
                    : theme.colors.surface,
                  borderColor: packageDetails.type === type.id 
                    ? theme.colors.primary 
                    : theme.colors.outline,
                }
              ]}
              onPress={() => setPackageDetails({...packageDetails, type: type.id})}
            >
              <Text style={styles.optionEmoji}>{type.emoji}</Text>
              <Text style={[
                styles.optionText,
                {
                  color: packageDetails.type === type.id 
                    ? theme.colors.onPrimaryContainer 
                    : theme.colors.onSurface,
                }
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
          Paket Açıklaması *
        </Text>
        <TextInput
          style={[styles.textInput, {
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          }]}
          value={packageDetails.description}
          onChangeText={(text) => setPackageDetails({...packageDetails, description: text})}
          placeholder="Örn: Laptop, Kitap, Giysi"
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
          <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
            Ağırlık (kg) *
          </Text>
          <TextInput
            style={[styles.textInput, {
              borderColor: theme.colors.outline,
              backgroundColor: theme.colors.surface,
              color: theme.colors.onSurface,
            }]}
            value={packageDetails.weight}
            onChangeText={(text) => setPackageDetails({...packageDetails, weight: text})}
            placeholder="2.5"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
          <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
            Değer (₺)
          </Text>
          <TextInput
            style={[styles.textInput, {
              borderColor: theme.colors.outline,
              backgroundColor: theme.colors.surface,
              color: theme.colors.onSurface,
            }]}
            value={packageDetails.value}
            onChangeText={(text) => setPackageDetails({...packageDetails, value: text})}
            placeholder="500"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.onSurface}]}>
          Özel Gereksinimler
        </Text>
        <View style={styles.requirementsContainer}>
          {specialRequirements.map((req) => (
            <TouchableOpacity
              key={req.id}
              style={[
                styles.requirementChip,
                {
                  backgroundColor: packageDetails.specialRequirements.includes(req.id)
                    ? theme.colors.secondaryContainer
                    : theme.colors.surface,
                  borderColor: packageDetails.specialRequirements.includes(req.id)
                    ? theme.colors.secondary
                    : theme.colors.outline,
                }
              ]}
              onPress={() => {
                const requirements = packageDetails.specialRequirements.includes(req.id)
                  ? packageDetails.specialRequirements.filter(r => r !== req.id)
                  : [...packageDetails.specialRequirements, req.id];
                setPackageDetails({...packageDetails, specialRequirements: requirements});
              }}
            >
              <Text style={styles.requirementEmoji}>{req.emoji}</Text>
              <Text style={[
                styles.requirementText,
                {
                  color: packageDetails.specialRequirements.includes(req.id)
                    ? theme.colors.onSecondaryContainer
                    : theme.colors.onSurface,
                }
              ]}>
                {req.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderQuotes = () => (
    <View style={styles.formContainer}>
      <Text style={[styles.stepTitle, {color: theme.colors.onBackground}]}>
        {steps[3].title}
      </Text>
      <Text style={[styles.stepDescription, {color: theme.colors.onSurfaceVariant}]}>
        {steps[3].description}
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, {color: theme.colors.onSurface}]}>
            Fiyat teklifleri alınıyor...
          </Text>
        </View>
      ) : (
        <View style={styles.quotesContainer}>
          {quotes.map((quote) => (
            <TouchableOpacity
              key={quote.id}
              style={[
                styles.quoteCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: selectedQuote?.id === quote.id 
                    ? theme.colors.primary 
                    : theme.colors.outline,
                  borderWidth: selectedQuote?.id === quote.id ? 2 : 1,
                }
              ]}
              onPress={() => setSelectedQuote(quote)}
            >
              {quote.isRecommended && (
                <View style={[styles.recommendedBadge, {backgroundColor: theme.colors.secondary}]}>
                  <Text style={[styles.recommendedText, {color: theme.colors.onSecondary}]}>
                    Önerilen
                  </Text>
                </View>
              )}
              
              <View style={styles.quoteHeader}>
                <View style={styles.carrierInfo}>
                  <Text style={styles.carrierLogo}>{quote.logo}</Text>
                  <View>
                    <Text style={[styles.carrierName, {color: theme.colors.onSurface}]}>
                      {quote.name}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingEmoji}>⭐</Text>
                      <Text style={[styles.ratingText, {color: theme.colors.onSurfaceVariant}]}>
                        {quote.rating}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={[styles.price, {color: theme.colors.primary}]}>
                    ₺{quote.price.toFixed(2)}
                  </Text>
                  <Text style={[styles.deliveryTime, {color: theme.colors.onSurfaceVariant}]}>
                    {quote.estimatedDays} gün
                  </Text>
                </View>
              </View>

              <View style={styles.featuresContainer}>
                {quote.features.map((feature, index) => (
                  <View key={index} style={[styles.featureChip, {backgroundColor: theme.colors.surfaceVariant}]}>
                    <Text style={[styles.featureText, {color: theme.colors.onSurfaceVariant}]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.formContainer}>
      <Text style={[styles.stepTitle, {color: theme.colors.onBackground}]}>
        {steps[4].title}
      </Text>
      <Text style={[styles.stepDescription, {color: theme.colors.onSurfaceVariant}]}>
        {steps[4].description}
      </Text>

      <View style={[styles.summaryCard, {backgroundColor: theme.colors.surface}]}>
        <Text style={[styles.summaryTitle, {color: theme.colors.onSurface}]}>
          Gönderi Özeti
        </Text>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, {color: theme.colors.onSurfaceVariant}]}>
            Güzergah:
          </Text>
          <Text style={[styles.summaryValue, {color: theme.colors.onSurface}]}>
            {senderAddress.city} → {receiverAddress.city}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, {color: theme.colors.onSurfaceVariant}]}>
            Paket:
          </Text>
          <Text style={[styles.summaryValue, {color: theme.colors.onSurface}]}>
            {packageDetails.description} ({packageDetails.weight}kg)
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, {color: theme.colors.onSurfaceVariant}]}>
            Taşıyıcı:
          </Text>
          <Text style={[styles.summaryValue, {color: theme.colors.onSurface}]}>
            {selectedQuote?.name}
          </Text>
        </View>

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, {color: theme.colors.onSurface}]}>
            Toplam:
          </Text>
          <Text style={[styles.totalValue, {color: theme.colors.primary}]}>
            ₺{selectedQuote?.price.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderSenderForm();
      case 1: return renderReceiverForm();
      case 2: return renderPackageForm();
      case 3: return renderQuotes();
      case 4: return renderConfirmation();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderStepIndicator()}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>

      <View style={[styles.bottomActions, {backgroundColor: theme.colors.surface}]}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.backButton, {borderColor: theme.colors.outline}]}
            onPress={handleBack}
            disabled={isLoading}
          >
            <Text style={[styles.backButtonText, {color: theme.colors.onSurface}]}>
              Geri
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: isLoading ? 0.7 : 1,
              flex: currentStep > 0 ? 1 : undefined,
              marginLeft: currentStep > 0 ? 12 : 0,
            }
          ]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={[styles.nextButtonText, {color: theme.colors.onPrimary}]}>
              {currentStep === steps.length - 1 ? 'Gönder' : 'Devam'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepLine: {
    width: 24,
    height: 2,
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  optionsScroll: {
    marginTop: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  optionEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  requirementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  requirementChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  requirementEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  quotesContainer: {
    gap: 12,
  },
  quoteCard: {
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carrierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carrierLogo: {
    fontSize: 32,
    marginRight: 12,
  },
  carrierName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  deliveryTime: {
    fontSize: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 11,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShipmentCreateScreen;