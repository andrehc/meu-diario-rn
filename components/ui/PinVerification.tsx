import { comparePin } from '@/src/utils/pinService';
import { Ionicons } from '@expo/vector-icons';
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
  storedPinHash: string;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export default function PinVerification({ 
  visible, 
  storedPinHash,
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
        } catch (error) {
          console.error('Erro ao verificar PIN:', error);
          setError('Erro ao verificar PIN');
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
              index < pin.length && styles.dotFilled,
              error && styles.dotError
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
                style={[styles.keyButton, styles.backspaceButton]}
                onPress={handleBackspace}
                disabled={isVerifying}
              >
                <Ionicons name="backspace-outline" size={24} color="#666" />
              </TouchableOpacity>
            );
          }
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.keyButton}
              onPress={() => handlePinInput(num)}
              disabled={isVerifying}
            >
              <Text style={styles.keyText}>{num}</Text>
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
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Ionicons name="lock-closed" size={32} color="#4c6ef5" />
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>{description}</Text>
            </View>
          </View>

          {/* PIN Dots */}
          <View style={styles.pinsContainer}>
            {renderPinDots()}
            
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : isVerifying ? (
              <Text style={styles.verifyingText}>Verificando...</Text>
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
    backgroundColor: '#fff',
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
    borderBottomColor: '#f0f0f0',
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
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#e9ecef',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  dotFilled: {
    backgroundColor: '#4c6ef5',
    borderColor: '#4c6ef5',
  },
  dotError: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  verifyingText: {
    color: '#4c6ef5',
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
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  backspaceButton: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
});