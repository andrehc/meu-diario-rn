import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface PinToggleProps {
  value: boolean;
  onToggle: (enabled: boolean) => void;
  onPinSet: (pin: string) => void;
  title?: string;
  description?: string;
}

export default function PinToggle({ 
  value, 
  onToggle, 
  onPinSet, 
  title = "Ativar PIN de Segurança",
  description = "Proteja seus dados com um PIN de 4 dígitos" 
}: PinToggleProps) {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Animar entrada do modal
  useEffect(() => {
    if (showPinModal) {
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
  }, [showPinModal]);

  const handleToggle = () => {
    if (!value) {
      // Ativando PIN - abrir modal para criar
      setShowPinModal(true);
      setPin('');
      setConfirmPin('');
      setStep('enter');
      setError('');
    } else {
      // Desativando PIN
      Alert.alert(
        'Desativar PIN',
        'Tem certeza que deseja desativar o PIN de segurança?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Desativar', 
            style: 'destructive',
            onPress: () => {
              onToggle(false);
              onPinSet('');
            }
          }
        ]
      );
    }
  };

  const handlePinInput = (digit: string) => {
    if (step === 'enter') {
      if (pin.length < 4) {
        const newPin = pin + digit;
        setPin(newPin);
        setError('');
        
        if (newPin.length === 4) {
          setTimeout(() => {
            setStep('confirm');
          }, 200);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + digit;
        setConfirmPin(newConfirmPin);
        setError('');
        
        if (newConfirmPin.length === 4) {
          setTimeout(() => {
            if (pin === newConfirmPin) {
              // PIN confirmado com sucesso
              onToggle(true);
              onPinSet(pin);
              setShowPinModal(false);
              Alert.alert('Sucesso', 'PIN de segurança ativado!');
            } else {
              setError('PINs não coincidem');
              setTimeout(() => {
                setPin('');
                setConfirmPin('');
                setStep('enter');
                setError('');
              }, 1500);
            }
          }, 200);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'enter') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
    setError('');
  };

  const handleCancel = () => {
    setShowPinModal(false);
    setPin('');
    setConfirmPin('');
    setStep('enter');
    setError('');
  };

  const renderPinDots = (currentPin: string) => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map(index => (
          <View 
            key={index} 
            style={[
              styles.dot,
              index < currentPin.length && styles.dotFilled,
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
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <>
      {/* Toggle Switch */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleContent}>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>{title}</Text>
            <Text style={styles.toggleDescription}>{description}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.toggle, value && styles.toggleActive]}
            onPress={handleToggle}
          >
            <Animated.View
              style={[
                styles.toggleThumb,
                value && styles.toggleThumbActive,
                {
                  transform: [{
                    translateX: value ? 24 : 2
                  }]
                }
              ]}
            />
          </TouchableOpacity>
        </View>
        
        {value && (
          <View style={styles.activePinInfo}>
            <Ionicons name="shield-checkmark" size={16} color="#28a745" />
            <Text style={styles.activePinText}>PIN ativo - Dados protegidos</Text>
          </View>
        )}
      </View>

      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="none"
        onRequestClose={handleCancel}
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
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <Ionicons name="shield-outline" size={32} color="#4c6ef5" />
                <Text style={styles.modalTitle}>
                  {step === 'enter' ? 'Criar PIN' : 'Confirmar PIN'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {step === 'enter' 
                    ? 'Digite um PIN de 4 dígitos'
                    : 'Digite o PIN novamente para confirmar'
                  }
                </Text>
              </View>
            </View>

            {/* PIN Dots */}
            <View style={styles.pinsContainer}>
              {renderPinDots(step === 'enter' ? pin : confirmPin)}
              
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}
            </View>

            {/* Keypad */}
            {renderKeypad()}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Toggle Switch Styles
  toggleContainer: {
    marginBottom: 20,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  toggle: {
    width: 50,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#4c6ef5',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleThumbActive: {
    // Animação já é tratada pela transform
  },
  activePinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 20,
  },
  activePinText: {
    fontSize: 12,
    color: '#28a745',
    marginLeft: 4,
    fontWeight: '500',
  },

  // Modal Styles
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

  // Keypad Styles
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