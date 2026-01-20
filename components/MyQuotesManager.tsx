import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Quote } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { 
  SlideInRight, 
  SlideOutRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface MyQuotesManagerProps {
  visible: boolean;
  onClose: () => void;
  onQuotesChange: (quotes: Quote[]) => void;
  accentColor?: string;
}

export function MyQuotesManager({ visible, onClose, onQuotesChange, accentColor: propAccentColor }: MyQuotesManagerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const accentColor = propAccentColor || colors.primary;
  const [customQuotes, setCustomQuotes] = useState<Quote[]>([]);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editingQuoteText, setEditingQuoteText] = useState('');
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState('');

  useEffect(() => {
    if (visible) {
      loadCustomQuotes();
    }
  }, [visible]);

  const loadCustomQuotes = async () => {
    try {
      const saved = await AsyncStorage.getItem('customQuotes');
      if (saved) {
        const parsed = JSON.parse(saved);
        const quotes: Quote[] = Array.isArray(parsed) 
          ? parsed.map((item: string | Quote, index: number) => {
              if (typeof item === 'string') {
                return {
                  id: `custom-legacy-${index}`,
                  text: item,
                  category: 'my-quotes',
                  isLiked: false,
                  date: new Date().toISOString(),
                };
              }
              return item as Quote;
            }).filter((q): q is Quote => q !== null && 'text' in q)
          : [];
        setCustomQuotes(quotes);
      } else {
        setCustomQuotes([]);
      }
    } catch (error) {
      console.error('Error loading custom quotes:', error);
    }
  };

  const handleAddQuote = async () => {
    if (newQuoteText.trim()) {
      const newQuote: Quote = {
        id: `custom-${Date.now()}`,
        text: newQuoteText.trim(),
        category: 'my-quotes',
        isLiked: false,
        date: new Date().toISOString(),
      };
      
      const updatedQuotes = [...customQuotes, newQuote];
      setCustomQuotes(updatedQuotes);
      
      try {
        await AsyncStorage.setItem('customQuotes', JSON.stringify(updatedQuotes));
        onQuotesChange(updatedQuotes);
      } catch (error) {
        console.error('Error saving quote:', error);
      }
      
      setNewQuoteText('');
      setShowAddQuote(false);
    }
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuoteId(quote.id);
    setEditingQuoteText(quote.text);
  };

  const handleSaveEdit = async () => {
    if (editingQuoteId && editingQuoteText.trim()) {
      const updatedQuotes = customQuotes.map(q => 
        q.id === editingQuoteId 
          ? { ...q, text: editingQuoteText.trim() }
          : q
      );
      setCustomQuotes(updatedQuotes);
      
      try {
        await AsyncStorage.setItem('customQuotes', JSON.stringify(updatedQuotes));
        onQuotesChange(updatedQuotes);
      } catch (error) {
        console.error('Error updating quote:', error);
      }
      
      setEditingQuoteId(null);
      setEditingQuoteText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingQuoteId(null);
    setEditingQuoteText('');
  };

  const handleDeleteQuote = (quoteId: string) => {
    Alert.alert(
      'حذف الاقتباس',
      'هل أنت متأكد من حذف هذا الاقتباس؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const updatedQuotes = customQuotes.filter(q => q.id !== quoteId);
            setCustomQuotes(updatedQuotes);
            
            try {
              await AsyncStorage.setItem('customQuotes', JSON.stringify(updatedQuotes));
              onQuotesChange(updatedQuotes);
            } catch (error) {
              console.error('Error deleting quote:', error);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setEditingQuoteId(null);
    setShowAddQuote(false);
    onClose();
  };

  // Swipe to close gesture (swipe right to close since it slides from right)
  const translateX = useSharedValue(0);
  
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > 100 || event.velocityX > 500) {
        runOnJS(handleClose)();
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <GestureDetector gesture={panGesture}>
          <Animated.View
            entering={SlideInRight.springify()}
            exiting={SlideOutRight.springify()}
            style={[styles.modalContent, animatedStyle]}
          >
            {/* Drag Handle - vertical for horizontal swipe */}
            <View style={styles.dragHandleContainerVertical}>
              <View style={styles.dragHandleVertical} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                <Ionicons name="chevron-forward" size={24} color={accentColor} />
                <Text style={[styles.backButtonTextFixed, { color: accentColor }]}>رجوع</Text>
              </TouchableOpacity>
            </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.titleFixed}>اقتباساتي</Text>
              <Text style={styles.subtitle}>{customQuotes.length} اقتباس</Text>
            </View>

            {/* Add New Quote Button */}
            <TouchableOpacity
              style={[styles.addButtonFixed, { backgroundColor: accentColor }]}
              onPress={() => setShowAddQuote(true)}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>أضف اقتباس جديد</Text>
            </TouchableOpacity>

            {/* Add Quote Form */}
            {showAddQuote && (
              <View style={styles.addQuoteForm}>
                <TextInput
                  style={styles.quoteInputFixed}
                  placeholder="اكتب اقتباسك هنا..."
                  placeholderTextColor="#9CA3AF"
                  value={newQuoteText}
                  onChangeText={setNewQuoteText}
                  multiline
                  textAlign="right"
                  autoFocus
                />
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.formBtnPrimary, { backgroundColor: accentColor }]}
                    onPress={handleAddQuote}
                  >
                    <Text style={styles.formBtnText}>إضافة</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.formBtn, { backgroundColor: '#E5E7EB' }]}
                    onPress={() => {
                      setShowAddQuote(false);
                      setNewQuoteText('');
                    }}
                  >
                    <Text style={styles.formBtnTextDark}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Quotes List */}
            {customQuotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={accentColor} />
                <Text style={styles.emptyTextFixed}>
                  لا توجد اقتباسات بعد
                </Text>
                <Text style={styles.emptySubtextFixed}>
                  أضف اقتباسك الأول!
                </Text>
              </View>
            ) : (
              <View style={styles.quotesList}>
                {customQuotes.map((quote) => (
                  <View 
                    key={quote.id} 
                    style={styles.quoteItemFixed}
                  >
                    {editingQuoteId === quote.id ? (
                      // Edit Mode
                      <View style={styles.editContainer}>
                        <TextInput
                          style={styles.editInputFixed}
                          value={editingQuoteText}
                          onChangeText={setEditingQuoteText}
                          multiline
                          textAlign="right"
                          autoFocus
                        />
                        <View style={styles.editButtons}>
                          <TouchableOpacity
                            style={[styles.iconBtnPrimary, { backgroundColor: accentColor }]}
                            onPress={handleSaveEdit}
                          >
                            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.iconBtn, { backgroundColor: '#E5E7EB' }]}
                            onPress={handleCancelEdit}
                          >
                            <Ionicons name="close" size={20} color="#1B5E20" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      // View Mode
                      <>
                        <Text style={styles.quoteTextFixed}>
                          {quote.text}
                        </Text>
                        <View style={styles.quoteActions}>
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleEditQuote(quote)}
                          >
                            <Ionicons name="pencil-outline" size={20} color={accentColor} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleDeleteQuote(quote.id)}
                          >
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dragHandleContainerVertical: {
    position: 'absolute',
    left: 8,
    top: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dragHandleVertical: {
    width: 4,
    height: 40,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  modalContent: {
    backgroundColor: '#F5F5F0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonTextFixed: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleFixed: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1B5E20',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    marginBottom: 24,
  },
  addButtonFixed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    marginBottom: 24,
    backgroundColor: '#93C5FD',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addQuoteForm: {
    marginBottom: 24,
    gap: 12,
  },
  quoteInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  quoteInputFixed: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    color: '#1B5E20',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  formBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  formBtnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
  },
  formBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  formBtnTextDark: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyTextFixed: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#1B5E20',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
  },
  emptySubtextFixed: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    color: '#6B7280',
  },
  quotesList: {
    gap: 12,
    paddingBottom: 32,
  },
  quoteItem: {
    padding: 16,
    borderRadius: 12,
  },
  quoteItemFixed: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 12,
  },
  quoteTextFixed: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 12,
    color: '#1B5E20',
  },
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  actionBtn: {
    padding: 8,
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
  },
  editInputFixed: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    color: '#1B5E20',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnPrimary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
  },
});

