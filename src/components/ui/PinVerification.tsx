import { comparePin } from '../../utils/pinService';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/useTheme';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface PinVerificationProps {
  visible: boolean;
  storedPinHash?: string;
  mode?: 'create' | 'confirm' | 'verify';
  onSuccess: (pin?: string) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export function PinVerification({ 
  visible, 
  storedPinHash,
  mode = 'verify',
  onSuccess, 
  onCancel, 
  title = "Digite seu PIN",
  description = "Digite o PIN de 4 dígitos para continuar" 
}: PinVerificationProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textPrimary = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  const borderColor = useThemeColor({}, 'textSecondary'); // Usando textSecondary como border
  const cardBackground = useThemeColor({}, 'cardBackground');

  // Animar entrada do modal
  useEffect(() => {
    if (visible) {
      setPin('');
      setError('');
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(0);
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const handlePinInput = async (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      
      if (newPin.length === 4) {
        setIsVerifying(true);
        
        try {
          if (mode === 'verify' && storedPinHash) {
            // Modo verificação: compara com hash armazenado
            const isValid = await comparePin(newPin, storedPinHash);
            
            if (isValid) {
              setTimeout(() => {
                onSuccess();
                setPin('');
              }, 200);
            } else {
              setError('PIN incorreto');
              setTimeout(() => {
                setPin('');
                setError('');
              }, 1500);
            }
          } else {
            // Modos create/confirm: retorna o PIN digitado
            setTimeout(() => {
              onSuccess(newPin);
              setPin('');
            }, 200);
          }
        } catch (error) {
          console.error('Erro ao processar PIN:', error);
          setError('Erro ao processar PIN');
          setTimeout(() => {
            setPin('');
            setError('');
          }, 1500);
        } finally {
          setIsVerifying(false);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const renderPinDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map(index => (
          <View 
            key={index} 
            style={[
              styles.dot,
              {backgroundColor: index < pin.length ? primaryColor : 'transparent',
                borderColor: error ? errorColor : (index < pin.length ? primaryColor : borderColor)
              }
            ]} 
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
    
    return (
      <View style={styles.keypad}>
        {numbers.map((num, index) => {
          if (num === '') {
            return <View key={index} style={styles.keyButton} />;
          }
          
          if (num === '⌫') {
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.keyButton, 
                  styles.backspaceButton,
                  { 
                    backgroundColor: surfaceColor,
                    borderColor: borderColor 
                  }
                ]}
                onPress={handleBackspace}
                disabled={isVerifying}
              >
                <Ionicons name="backspace-outline" size={24} color={textSecondary}/>
              </TouchableOpacity>
            );
          }
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.keyButton,
                { 
                  backgroundColor: cardBackground,
                  borderColor: borderColor 
                }
              ]}
              onPress={() => handlePinInput(num)}
              disabled={isVerifying}
            >
              <Text style={[styles.keyText, { color: textPrimary }]}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: surfaceColor,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0],
                  }),
                },
                { scale: scaleAnim }
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Ionicons name="close" size={24} color={textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Ionicons name="lock-closed" size={32} color={primaryColor} />
              <Text style={[styles.modalTitle, { color: textPrimary }]}>{title}</Text>
              <Text style={[styles.modalSubtitle, { color: textSecondary }]}>{description}</Text>
            </View>
          </View>

          {/* PIN Dots */}
          <View style={styles.pinsContainer}>
            {renderPinDots()}
            
            {error ? (
              <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
            ) : isVerifying ? (
              <Text style={[styles.verifyingText, { color: primaryColor }]}>Verificando...</Text>
            ) : null}
          </View>

          {/* Keypad */}
          {renderKeypad()}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: height * 0.85,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
  },
  cancelButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  pinsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  verifyingText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  keypad: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  keyButton: {
    width: (width - 120) / 3,
    height: 60,
    margin: 10,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  backspaceButton: {
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
  },
});

export default PinVerification;