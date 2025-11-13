import PinToggle from '@/components/ui/PinToggle';
import { useAuth } from '@/src/contexts/AuthContext';
import * as googleAuthService from '@/src/services/googleAuthService';
import { ProfileService } from '@/src/services/profileService';
import { type CreateLocalProfileData } from '@/src/types/database';
import { hashPin } from '@/src/utils/pinService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface RegisterFormData {
    name: string;
    email: string;
    phone: string;
    psychologist_name: string;
    psychologist_phone: string;
    pin_enabled: boolean;
    pin_hash: string;
}

function placeholderTelefone(telefone: string) {
    if (!telefone) return '';
    return telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
}

export default function RegisterComponent() {
    const router = useRouter();
    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<RegisterFormData>({
        name: '',
        email: '',
        phone: '',
        psychologist_name: '',
        psychologist_phone: '',
        pin_enabled: false,
        pin_hash: '',
    });

    // Registro local
    const handleLocalRegister = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Erro', 'Por favor, digite seu nome');
            return;
        }

        if (!formData.email.trim()) {
            Alert.alert('Erro', 'Por favor, digite seu email');
            return;
        }

        try {
            setIsLoading(true);
            console.log('🚀 [REGISTER] Iniciando registro local...');

            // Verifica se o email já existe
            const existingUser = await ProfileService.getProfileByEmail(formData.email);
            if (existingUser) {
                Alert.alert(
                    'Email já cadastrado',
                    'Este email já está em uso. Deseja fazer login?',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                            text: 'Fazer Login',
                            onPress: () => router.push('/auth/login')
                        }
                    ]
                );
                return;
            }

            // Validação do PIN: só habilita se tiver hash válido
            const shouldEnablePin = formData.pin_enabled && formData.pin_hash.length > 0;
            
            console.log('🔐 [REGISTER] Estado do PIN:', {
                pin_enabled_form: formData.pin_enabled,
                pin_hash_exists: !!formData.pin_hash,
                pin_hash_length: formData.pin_hash.length,
                final_pin_enabled: shouldEnablePin
            });

            // Cria perfil local
            const localProfileData: CreateLocalProfileData = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim().toLowerCase(),
                profile_image: '',
                psychologist_name: formData.psychologist_name.trim(),
                psychologist_phone: formData.psychologist_phone.trim(),
                pin_enabled: shouldEnablePin ? 1 : 0, // ✅ Só 1 se tiver hash válido
                pin_hash: shouldEnablePin ? formData.pin_hash : '', // ✅ Limpa hash se não habilitado
                login_provider: 'local',
            };

            console.log('📝 [REGISTER] Dados do perfil:', localProfileData);

            const profileId = await ProfileService.createProfile(localProfileData);
            console.log('✅ [REGISTER] Perfil criado com ID:', profileId);

            // Busca o perfil criado
            const newProfile = await ProfileService.getProfile(profileId);
            if (!newProfile) {
                throw new Error('Erro ao recuperar perfil criado');
            }

            console.log('👤 [REGISTER] Perfil recuperado:', newProfile);

            // Faz login automaticamente
            await login(newProfile);

            console.log('🏠 [REGISTER] Navegando para home...');
            router.replace('/(tabs)');

        } catch (error: any) {
            console.error('❌ [REGISTER] Erro:', error);
            Alert.alert('Erro', error.message || 'Erro ao registrar usuário');
        } finally {
            setIsLoading(false);
        }
    };

    // Registro com Google
    const handleGoogleRegister = async () => {
        try {
            setIsLoading(true);
            console.log('🔍 [GOOGLE REGISTER] Iniciando registro com Google...');

            await googleAuthService.configureGoogleSignIn();
            console.log('📲 [GOOGLE REGISTER] Fazendo login...');

            const result = await googleAuthService.loginWithGoogle();

            console.log('✅ [GOOGLE REGISTER] Registro realizado:', result);

            // Faz login no contexto da aplicação
            console.log('🔐 [GOOGLE REGISTER] Logando no contexto da aplicação...');
            await login(result.profile);

            console.log('🏠 [GOOGLE REGISTER] Navegando para home...');
            router.replace('/(tabs)');

        } catch (error: any) {
            console.error('❌ [GOOGLE REGISTER] Erro detalhado:', error);
            Alert.alert('Erro no registro', error.message || 'Erro ao registrar com Google');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Criar Conta</Text>
                <Text style={styles.subtitle}>Registre-se para começar a usar o app</Text>
            </View>

            <View style={styles.form}>
                {/* Nome Input */}
                <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder="Seu nome completo"
                        placeholderTextColor="#999"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        autoCapitalize="words"
                        autoComplete="name"
                    />
                </View>

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

                {/* Telefone Input */}
                <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder="Seu telefone (opcional)"
                        placeholderTextColor="#999"
                        value={placeholderTelefone(formData.phone)}
                        onChangeText={(text) => {
                            const numbers = text.replace(/\D/g, '');
                            setFormData({ ...formData, phone: numbers });
                        }}
                        keyboardType="phone-pad"
                        maxLength={15}
                        autoComplete="tel"
                    />
                </View>

                {/* Nome Input Psicologo */}
                <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder="Nome do psicólogo (opcional)"
                        placeholderTextColor="#999"
                        value={formData.psychologist_name}
                        onChangeText={(text) => setFormData({ ...formData, psychologist_name: text })}
                        autoCapitalize="words"
                        autoComplete="name"
                    />
                </View>

                {/* Telefone Psicologo Input */}
                <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder="Telefone do psicólogo (opcional)"
                        placeholderTextColor="#999"
                        value={placeholderTelefone(formData.psychologist_phone)}
                        onChangeText={(text) => {
                            const numbers = text.replace(/\D/g, '');
                            setFormData({ ...formData, psychologist_phone: numbers });
                        }}
                        keyboardType="phone-pad"
                        maxLength={15}
                        autoComplete="tel"
                    />
                </View>

                {/* PIN Toggle */}
                <PinToggle
                    value={formData.pin_enabled}
                    onToggle={(enabled) => {
                        if (!enabled) {
                            // Se desabilitar, limpa o hash
                            setFormData({ 
                                ...formData, 
                                pin_enabled: enabled,
                                pin_hash: '' 
                            });
                        } else {
                            setFormData({ ...formData, pin_enabled: enabled });
                        }
                    }}
                    onPinSet={async (pin) => {
                        const hashedPin = await hashPin(pin);
                        setFormData({ 
                            ...formData, 
                            pin_hash: hashedPin,
                            pin_enabled: true // ✅ Garante que fica habilitado quando PIN é definido
                        });
                    }}
                    title="Ativar PIN de Segurança"
                    description="Habilita um Código PIN de 4 dígitos"
                />

                {/* Register Button */}
                <TouchableOpacity
                    style={[styles.button, styles.registerButton]}
                    onPress={handleLocalRegister}
                    disabled={isLoading}
                >
                    <Ionicons name="person-add-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Registrando...' : 'Criar Conta'}
                    </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>ou</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Google Register Button */}
                <TouchableOpacity
                    style={[styles.button, styles.googleButton]}
                    onPress={handleGoogleRegister}
                    disabled={true}

                >
                    <Ionicons name="logo-google" size={20} color="#4285f4" />
                    <Text style={[styles.buttonText, styles.googleButtonText]}>
                        Registrar com Google
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                    <Text style={styles.linkText}>Fazer Login</Text>
                </TouchableOpacity>
            </View>

            {/* Terms */}
            <View style={styles.terms}>
                <Text style={styles.termsText}>
                    Ao se registrar, você concorda com nossos termos de uso e política de privacidade
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
        justifyContent: 'center',
        minHeight: '100%',
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
    registerButton: {
        backgroundColor: '#28a745',
    },
    googleButton: {
        backgroundColor: '#eee',
        borderWidth: 1,
        borderColor: '#e9ecef',
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
        marginBottom: 20,
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
    terms: {
        paddingHorizontal: 20,
    },
    termsText: {
        color: '#999',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
});