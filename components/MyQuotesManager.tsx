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
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';

interface MyQuotesManagerProps {
  visible: boolean;
  onClose: () => void;
  onQuotesChange: (quotes: Quote[]) => void;
}

export function MyQuotesManager({ visible, onClose, onQuotesChange }: MyQuotesManagerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
        <Animated.View
          entering={SlideInRight.springify()}
          exiting={SlideOutRight.springify()}
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
              <Text style={[styles.backButtonText, { color: colors.primary }]}>رجوع</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]}>اقتباساتي</Text>
              <Text style={styles.subtitle}>{customQuotes.length} اقتباس</Text>
            </View>

            {/* Add New Quote Button */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddQuote(true)}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>أضف اقتباس جديد</Text>
            </TouchableOpacity>

            {/* Add Quote Form */}
            {showAddQuote && (
              <View style={styles.addQuoteForm}>
                <TextInput
                  style={[styles.quoteInput, { backgroundColor: colors.cardBackground, color: colors.text }]}
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
                    style={[styles.formBtn, { backgroundColor: colors.primary }]}
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
                    <Text style={[styles.formBtnText, { color: colors.text }]}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Quotes List */}
            {customQuotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={colors.primary} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  لا توجد اقتباسات بعد
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.text }]}>
                  أضف اقتباسك الأول!
                </Text>
              </View>
            ) : (
              <View style={styles.quotesList}>
                {customQuotes.map((quote) => (
                  <View 
                    key={quote.id} 
                    style={[styles.quoteItem, { backgroundColor: colors.cardBackground }]}
                  >
                    {editingQuoteId === quote.id ? (
                      // Edit Mode
                      <View style={styles.editContainer}>
                        <TextInput
                          style={[styles.editInput, { color: colors.text }]}
                          value={editingQuoteText}
                          onChangeText={setEditingQuoteText}
                          multiline
                          textAlign="right"
                          autoFocus
                        />
                        <View style={styles.editButtons}>
                          <TouchableOpacity
                            style={[styles.iconBtn, { backgroundColor: colors.primary }]}
                            onPress={handleSaveEdit}
                          >
                            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.iconBtn, { backgroundColor: '#E5E7EB' }]}
                            onPress={handleCancelEdit}
                          >
                            <Ionicons name="close" size={20} color={colors.text} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      // View Mode
                      <>
                        <Text style={[styles.quoteText, { color: colors.text }]}>
                          {quote.text}
                        </Text>
                        <View style={styles.quoteActions}>
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleEditQuote(quote)}
                          >
                            <Ionicons name="pencil-outline" size={20} color={colors.primary} />
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
  modalContent: {
    backgroundColor: '#FEF7ED',
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
  formBtnText: {
    color: '#FFFFFF',
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
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
  },
  quotesList: {
    gap: 12,
    paddingBottom: 32,
  },
  quoteItem: {
    padding: 16,
    borderRadius: 12,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 12,
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
});

