import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import { useApp } from '@/hooks/useApp';
import { useCustomAlert, CustomAlert } from '@/components/ui/CustomAlert';
import { PasswordReset } from '@/components/ui/PasswordReset';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const { signIn, signUp } = useApp();
  const { alertConfig, setAlertConfig, showAlert } = useCustomAlert();
  const captchaRef = useRef(null);

  const handleAuth = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedPassword) {
      showAlert('Erro', 'Por favor, preencha email e senha.');
      return;
    }

    if (isSignUp && !trimmedName) {
      showAlert('Erro', 'Por favor, preencha seu nome.');
      return;
    }

    if (trimmedPassword.length < 6) {
      showAlert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔄 Starting authentication process...');
      
      // Prepare captcha token if available
      let captchaToken = null;
      if (captchaRef.current) {
        try {
          captchaToken = await captchaRef.current.executeAsync();
        } catch (captchaError) {
          console.log('ℹ️ Captcha not required or failed:', captchaError.message);
        }
      }

      const result = isSignUp 
        ? await signUp(trimmedEmail, trimmedPassword, trimmedName, captchaToken)
        : await signIn(trimmedEmail, trimmedPassword, captchaToken);

      if (!result.success) {
        console.error('❌ Authentication failed:', result.error);
        
        // Handle captcha-specific errors
        if (result.error?.includes('captcha')) {
          showAlert('Verificação Necessária', 'Por favor, complete a verificação de segurança e tente novamente.');
        } else {
          showAlert('Erro de Autenticação', result.error || 'Erro na autenticação');
        }
      } else if (isSignUp) {
        console.log('✅ Sign up successful');
        showAlert('Sucesso', 'Conta criada com sucesso! Você pode fazer login imediatamente.');
        setIsSignUp(false);
        setName('');
        setPassword('');
      } else {
        console.log('✅ Sign in successful');
      }
    } catch (error) {
      console.error('❌ Unexpected auth error:', error);
      
      let errorMessage = 'Erro de conexão desconhecido';
      if (error instanceof Error) {
        if (error.message.includes('captcha')) {
          errorMessage = 'Verificação de segurança necessária. Tente novamente.';
        } else if (error.message.includes('fetch') || error.message.includes('Network')) {
          errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showAlert('Erro de Conexão', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setName('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.formContainer}>
        <View style={styles.header}>
          <MaterialIcons name="event" size={48} color={COLORS.primary} />
          <Text style={styles.title}>Gestor de Congresso</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Criar nova conta' : 'Faça login para continuar'}
          </Text>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Digite seu nome completo"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.authButtonText}>
              {loading ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              {isSignUp 
                ? 'Já tem uma conta? Faça login' 
                : 'Não tem conta? Cadastre-se'
              }
            </Text>
          </TouchableOpacity>

          {!isSignUp && (
            <TouchableOpacity 
              onPress={() => setShowPasswordReset(true)} 
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>
                Esqueceu sua senha?
              </Text>
            </TouchableOpacity>
          )}

          <ConnectionStatus />

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Contas de Teste:</Text>
            <Text style={styles.infoText}>
              • Admin: admin@congresso.org / 123456
            </Text>
            <Text style={styles.infoText}>
              • Voluntário: voluntario@teste.com / 123456
            </Text>
          </View>

          <View style={styles.captchaInfo}>
            <MaterialIcons name="security" size={16} color={COLORS.textSecondary} />
            <Text style={styles.captchaText}>
              Protegido por verificação de segurança
            </Text>
          </View>
        </View>
      </View>

      <CustomAlert alertConfig={alertConfig} setAlertConfig={setAlertConfig} />
      <PasswordReset 
        visible={showPasswordReset} 
        onClose={() => setShowPasswordReset(false)} 
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  formContainer: {
    margin: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  authButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonDisabled: {
    backgroundColor: COLORS.secondary,
  },
  authButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
    padding: 8,
  },
  toggleText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    padding: 8,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  captchaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
  },
  captchaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});