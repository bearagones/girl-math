import React, { useState, useEffect } from 'react';
import ReceiptCarousel from './components/ReceiptCarousel';

const friends = ['beatrice', 'farin', 'tiffany', 'monica', 'andrew', 'marisa'];

function App() {
  const [receipts, setReceipts] = useState([]);
  const [currentReceiptIndex, setCurrentReceiptIndex] = useState(0);

  // Initialize with one empty receipt
  useEffect(() => {
    if (receipts.length === 0) {
      addNewReceipt();
    }
  }, []);

  // Load saved receipts from localStorage
  useEffect(() => {
    const savedReceipts = localStorage.getItem('girlMathReceipts');
    if (savedReceipts) {
      try {
        const parsed = JSON.parse(savedReceipts);
        if (parsed.length > 0) {
          setReceipts(parsed);
          setCurrentReceiptIndex(parsed.length - 1);
        }
      } catch (e) {
        console.log('Could not load saved receipts');
      }
    }
  }, []);

  // Save receipts to localStorage whenever receipts change
  useEffect(() => {
    if (receipts.length > 0) {
      localStorage.setItem('girlMathReceipts', JSON.stringify(receipts));
    }
  }, [receipts]);

  const createEmptyReceipt = () => ({
    id: Date.now(),
    subject: '',
    activeFriends: [...friends], // Start with all friends active
    individualItems: friends.reduce((acc, friend) => {
      acc[friend] = [];
      return acc;
    }, {}),
    sharedItems: [],
    subtotal: 0,
    tip: 0,
    total: 0,
    payer: '',
    splits: {},
    timestamp: new Date().toISOString(),
    isCompleted: false
  });

  const addNewReceipt = () => {
    const newReceipt = createEmptyReceipt();
    setReceipts(prev => [...prev, newReceipt]);
    setCurrentReceiptIndex(receipts.length);
  };

  const updateReceipt = (index, updatedReceipt) => {
    setReceipts(prev => prev.map((receipt, i) => 
      i === index ? updatedReceipt : receipt
    ));
  };

  const deleteReceipt = (index) => {
    if (receipts.length <= 1) return; // Keep at least one receipt
    
    setReceipts(prev => prev.filter((_, i) => i !== index));
    
    // Adjust current index if necessary
    if (currentReceiptIndex >= receipts.length - 1) {
      setCurrentReceiptIndex(Math.max(0, receipts.length - 2));
    } else if (currentReceiptIndex > index) {
      setCurrentReceiptIndex(currentReceiptIndex - 1);
    }
  };

  const navigateToReceipt = (index) => {
    setCurrentReceiptIndex(index);
  };

  const calculateOverallBalance = () => {
    const completedReceipts = receipts.filter(receipt => receipt.isCompleted);
    
    if (completedReceipts.length === 0) {
      return {};
    }

    const netBalances = friends.reduce((acc, friend) => {
      acc[friend] = 0;
      return acc;
    }, {});

    completedReceipts.forEach(receipt => {
      const payer = receipt.payer;
      const payerOwes = receipt.splits[payer] || 0;
      const payerPaid = receipt.total;

      // Payer gets credit for what they paid minus what they owe
      netBalances[payer] += payerPaid - payerOwes;

      // Everyone else owes their share
      friends.forEach(friend => {
        if (friend !== payer) {
          const friendOwes = receipt.splits[friend] || 0;
          netBalances[friend] -= friendOwes;
        }
      });
    });

    return netBalances;
  };

  const completedReceiptsCount = receipts.filter(receipt => receipt.isCompleted).length;
  const completedReceipts = receipts.filter(receipt => receipt.isCompleted);

  // Prepare overall balance data
  const overallBalanceData = completedReceiptsCount > 0 ? {
    balances: calculateOverallBalance(),
    completedReceipts: completedReceipts
  } : null;

  // Calculate total cards (receipts + overall balance if applicable)
  const totalCards = receipts.length + (overallBalanceData ? 1 : 0);

  return (
    <div className="app">
      <ReceiptCarousel
        receipts={receipts}
        currentIndex={currentReceiptIndex}
        onUpdateReceipt={updateReceipt}
        onDeleteReceipt={deleteReceipt}
        onNavigate={navigateToReceipt}
        friends={friends}
        overallBalanceData={overallBalanceData}
      />
      
      <button 
        className="add-receipt-btn"
        onClick={addNewReceipt}
        title="Add New Receipt"
      >
        +
      </button>

      <div className="receipt-counter">
        {currentReceiptIndex + 1} / {totalCards}
        {completedReceiptsCount > 0 && (
          <span> • {completedReceiptsCount} completed</span>
        )}
      </div>
    </div>
  );
}

export default App;
