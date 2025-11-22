import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';

const ExpensesListScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { logout } = useAuth();

  const fetchExpenses = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      // Build the query params based on any filters they set
      const params = {
        page: pageNum,
        limit: 10,
      };

      if (categoryFilter) {
        params.category = categoryFilter;
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const response = await api.get('/expenses', { params });
      const { expenses: newExpenses, pagination } = response.data;

      // Either replace the list or append to it for pagination
      if (reset) {
        setExpenses(newExpenses);
      } else {
        setExpenses((prev) => [...prev, ...newExpenses]);
      }

      // Check if there are more pages to load
      setHasMore(pageNum < pagination.totalPages);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        logout();
      } else {
        Alert.alert('Error', 'Failed to load expenses');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(1, true);
  }, [categoryFilter, startDate, endDate]);

  // Load the next page when they scroll to the bottom
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchExpenses(nextPage, false);
    }
  };

  // Ask for confirmation before deleting
  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/expenses/${id}`);
              // Remove it from the list immediately
              setExpenses((prev) => prev.filter((exp) => exp.id !== id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const applyFilters = () => {
    setPage(1);
    setShowFilters(false);
    fetchExpenses(1, true);
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setShowFilters(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderExpense = ({ item }) => (
    <TouchableOpacity
      style={styles.expenseCard}
      onPress={() => navigation.navigate('EditExpense', { expense: item })}
    >
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseCategory}>{item.category}</Text>
        <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
      </View>
      <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
      {item.note && <Text style={styles.expenseNote}>{item.note}</Text>}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Expenses</Text>

            <TextInput
              style={styles.input}
              placeholder="Category"
              value={categoryFilter}
              onChangeText={setCategoryFilter}
            />

            <TextInput
              style={styles.input}
              placeholder="Start Date (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
            />

            <TextInput
              style={styles.input}
              placeholder="End Date (YYYY-MM-DD)"
              value={endDate}
              onChangeText={setEndDate}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearButton]}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading && expenses.length === 0 ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses found</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpense}
          keyExtractor={(item) => item.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && expenses.length > 0 ? (
              <ActivityIndicator size="small" />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#6200ee',
    fontWeight: '600',
  },
  addButton: {
    padding: 10,
    backgroundColor: '#6200ee',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  expenseCard: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  expenseCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  expenseNote: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  deleteButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    padding: 5,
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
  },
  clearButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#6200ee',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ExpensesListScreen;

