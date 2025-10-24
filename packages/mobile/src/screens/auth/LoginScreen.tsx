import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {useAuth} from '../../contexts/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const {login, isLoading} = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form validation
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {email: '', password: ''};
    
    if (!email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Şifre gereklidir';
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login({
        email: email.trim().toLowerCase(),
        password: password,
        rememberMe: rememberMe,
      });
    } catch (error: any) {
      Alert.alert(
        'Giriş Hatası',
        error.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol ediniz.',
        [{text: 'Tamam', style: 'default'}]
      );
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[
            styles.title,
            {
              color: theme.colors.onBackground,
              fontSize: theme.typography.h1.fontSize,
              fontWeight: theme.typography.h1.fontWeight,
            }
          ]}>
            CargoLink
          </Text>
          <Text style={[
            styles.subtitle,
            {
              color: theme.colors.onSurfaceVariant,
              fontSize: theme.typography.body1.fontSize,
            }
          ]}>
            Lojistikte yeni dönem başlıyor
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.formContainer, {backgroundColor: theme.colors.surface}]}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[
              styles.label,
              {
                color: theme.colors.onSurface,
                fontSize: theme.typography.subtitle2.fontSize,
                fontWeight: theme.typography.subtitle2.fontWeight,
              }
            ]}>
              E-posta Adresi
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: errors.email ? theme.colors.error : theme.colors.outline,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.onBackground,
                }
              ]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors(prev => ({...prev, email: ''}));
                }
              }}
              placeholder="ornek@email.com"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.email ? (
              <Text style={[styles.errorText, {color: theme.colors.error}]}>
                {errors.email}
              </Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[
              styles.label,
              {
                color: theme.colors.onSurface,
                fontSize: theme.typography.subtitle2.fontSize,
                fontWeight: theme.typography.subtitle2.fontWeight,
              }
            ]}>
              Şifre
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    borderColor: errors.password ? theme.colors.error : theme.colors.outline,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.onBackground,
                  }
                ]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({...prev, password: ''}));
                  }
                }}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                secureTextEntry={!showPassword}
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Text style={[
                  styles.showPasswordText,
                  {color: theme.colors.primary}
                ]}>
                  {showPassword ? 'Gizle' : 'Göster'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={[styles.errorText, {color: theme.colors.error}]}>
                {errors.password}
              </Text>
            ) : null}
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              disabled={isLoading}
            >
              <View style={[
                styles.checkbox,
                {
                  borderColor: theme.colors.outline,
                  backgroundColor: rememberMe ? theme.colors.primary : 'transparent',
                }
              ]}>
                {rememberMe && (
                  <Text style={[styles.checkmark, {color: theme.colors.onPrimary}]}>
                    ✓
                  </Text>
                )}
              </View>
              <Text style={[
                styles.rememberMeText,
                {color: theme.colors.onSurface}
              ]}>
                Beni hatırla
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={[
                styles.forgotPasswordText,
                {color: theme.colors.primary}
              ]}>
                Şifremi unuttum
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: isLoading ? 0.7 : 1,
              }
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={[
              styles.loginButtonText,
              {
                color: theme.colors.onPrimary,
                fontSize: theme.typography.button.fontSize,
                fontWeight: theme.typography.button.fontWeight,
              }
            ]}>
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, {backgroundColor: theme.colors.outline}]} />
            <Text style={[styles.dividerText, {color: theme.colors.onSurfaceVariant}]}>
              veya
            </Text>
            <View style={[styles.divider, {backgroundColor: theme.colors.outline}]} />
          </View>

          {/* Social Login Buttons */}
          <TouchableOpacity
            style={[
              styles.socialButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
              }
            ]}
            disabled={isLoading}
          >
            <Text style={[
              styles.socialButtonText,
              {color: theme.colors.onSurface}
            ]}>
              Google ile devam et
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.socialButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
              }
            ]}
            disabled={isLoading}
          >
            <Text style={[
              styles.socialButtonText,
              {color: theme.colors.onSurface}
            ]}>
              Apple ile devam et
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={[
            styles.registerPrompt,
            {color: theme.colors.onSurfaceVariant}
          ]}>
            Hesabınız yok mu?{' '}
          </Text>
          <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
            <Text style={[
              styles.registerLink,
              {color: theme.colors.primary}
            ]}>
              Kayıt olun
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  formContainer: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 80,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  showPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerPrompt: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;