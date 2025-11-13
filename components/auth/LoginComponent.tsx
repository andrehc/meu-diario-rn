import PinVerification from '@/components/ui/PinVerification';
import { useAuth } from '@/src/contexts/AuthContext';
import * as googleAuthService from '@/src/services/googleAuthService';
import { ProfileService } from '@/src/services/profileService';
import { type Profile } from '@/src/types/database';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginComponent() {
    const router = useRouter();
    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });
    
    // Estados para verificação de PIN
    const [showPinVerification, setShowPinVerification] = useState(false);
    const [userAwaitingPinVerification, setUserAwaitingPinVerification] = useState<Profile | null>(null);



    // Função para cancelar verificação de PIN
    const handlePinCancel = () => {
        setShowPinVerification(false);
        setUserAwaitingPinVerification(null);
        setIsLoading(false);
    };

    // Login por email/senha (busca usuário existente)
    const handleEmailLogin = async () => {
        if (!formData.email.trim()) {
            Alert.alert('Erro', 'Por favor, digite seu email');
            return;
        }

        try {
            setIsLoading(true);
            console.log('🔍 [LOGIN] Buscando usuário por email:', formData.email);

            // Busca usuário existente por email
            const existingUser = await ProfileService.getProfileByEmail(formData.email);

            if (!existingUser) {
                Alert.alert(
                    'Usuário não encontrado',
                    'Este email não está cadastrado. Deseja se registrar?',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                            text: 'Registrar',
                            onPress: () => router.push('/auth/register')
                        }
                    ]
                );
                return;
            }

            console.log('✅ [LOGIN] Usuário encontrado:', existingUser.email);
            
            // Verifica se o usuário tem PIN habilitado
            if (existingUser.pin_enabled === 1 && existingUser.pin_hash) {
                console.log('🔐 [LOGIN] Usuário tem PIN habilitado, solicitando verificação...');
                
                // Armazena o usuário e mostra tela de verificação de PIN
                setUserAwaitingPinVerification(existingUser);
                setShowPinVerification(true);
                
                // Não prosseguir com login ainda - aguardar verificação de PIN
                return;
            } else {
                // Usuário sem PIN, fazer login direto
                console.log('✅ [LOGIN] Usuário sem PIN, fazendo login direto...');
                await login(existingUser);
                
                console.log('🏠 [LOGIN] Navegando para home...');
                router.replace('/(tabs)');
            }

        } catch (error) {
            console.error('❌ [LOGIN] Erro:', error);
            Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Login com Google
    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            console.log('🔍 [GOOGLE] Iniciando login com Google...');

            await googleAuthService.configureGoogleSignIn();
            console.log('📲 [GOOGLE] Fazendo login...');

            const result = await googleAuthService.loginWithGoogle();

            console.log('✅ [GOOGLE] Login realizado:', result);

            // Faz login no contexto da aplicação
            console.log('🔐 [GOOGLE] Logando no contexto da aplicação...');
            await login(result.profile);

            console.log('🏠 [GOOGLE] Navegando para home...');
            router.replace('/(tabs)');

        } catch (error: any) {
            console.error('❌ [GOOGLE] Erro detalhado:', error);
            Alert.alert('Erro no login', error.message || 'Erro ao fazer login com Google');
        } finally {
            setIsLoading(false);
        }
    };

    // Função para quando PIN for verificado com sucesso
    const handlePinSuccess = async () => {
        if (!userAwaitingPinVerification) return;
        
        try {
            console.log('✅ [PIN] PIN válido, fazendo login...');
            
            // PIN válido, prosseguir com o login
            await login(userAwaitingPinVerification);
            
            // Fechar tela de PIN e navegar para home
            setShowPinVerification(false);
            setUserAwaitingPinVerification(null);
            console.log('🏠 [LOGIN] Navegando para home...');
            router.replace('/(tabs)');
        } catch (error) {
            console.error('❌ [LOGIN] Erro ao fazer login após PIN:', error);
            Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Entrar</Text>
                <Text style={styles.subtitle}>Entre com sua conta existente</Text>
            </View>

            <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder="Seu email"
                        placeholderTextColor="#999"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    style={[styles.button, styles.loginButton]}
                    onPress={handleEmailLogin}
                    disabled={isLoading}
                >
                    <Ionicons name="log-in-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>ou</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Google Login Button */}
                <TouchableOpacity
                    style={[styles.button, styles.googleButton]}
                    onPress={handleGoogleLogin}
                    disabled={true}
                >
                    <Ionicons name="logo-google" size={20} color="#4285f4" />
                    <Text style={[styles.buttonText, styles.googleButtonText]}>
                        Continuar com Google
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Não tem uma conta? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                    <Text style={styles.linkText}>Registrar-se</Text>
                </TouchableOpacity>
            </View>
            
            {/* PIN Verification Modal */}
            <PinVerification
                visible={showPinVerification}
                storedPinHash={userAwaitingPinVerification?.pin_hash || ''}
                onSuccess={handlePinSuccess}
                onCancel={handlePinCancel}
                title="Digite seu PIN"
                description="Digite o PIN de 4 dígitos para acessar sua conta"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        marginBottom: 32,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 12,
        marginBottom: 16,
    },
    loginButton: {
        backgroundColor: '#4c6ef5',
    },
    googleButton: {
        backgroundColor: '#eee',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    testButton: {
        backgroundColor: '#FF6B6B',
        marginTop: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        color: '#fff',
    },
    googleButtonText: {
        color: 'grey',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e9ecef',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#666',
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    linkText: {
        color: '#4c6ef5',
        fontSize: 14,
        fontWeight: '600',
    },
});