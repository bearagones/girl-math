import React, { useState, useEffect } from 'react';
import ReceiptCarousel from './components/ReceiptCarousel';
import ReceiptHistory from './components/ReceiptHistory';
import { database, isFirebaseConfigured } from './firebase';
import { ref, set, get } from 'firebase/database';

const friends = ['beatrice', 'farin', 'tiffany', 'monica', 'andrew', 'marisa'];

// Generate a unique shareable ID (6 characters)
const generateShareId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

function App() {
  const [stacks, setStacks] = useState([]); // Array of receipt stacks
  const [currentStackIndex, setCurrentStackIndex] = useState(0);
  const [currentReceiptIndex, setCurrentReceiptIndex] = useState(0);
  const [sharedStack, setSharedStack] = useState(null);
  const [sharedReceiptIndex, setSharedReceiptIndex] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showStackManager, setShowStackManager] = useState(false);
  const [loadingShared, setLoadingShared] = useState(false);
  const [shareError, setShareError] = useState(null);

  // Check for shared stack ID in URL path (e.g., /ABC123)
  useEffect(() => {
    const checkForSharedStack = async () => {
      const path = window.location.pathname;
      const shareIdMatch = path.match(/^\/([A-Z0-9]{6})$/);
      
      if (shareIdMatch) {
        if (!isFirebaseConfigured || !database) {
          alert('Firebase is not configured. Unable to load shared receipts.\n\nThe app owner needs to add Firebase environment variables.');
          window.location.href = '/';
          return;
        }

        const shareId = shareIdMatch[1];
        setLoadingShared(true);
        
        try {
          console.log('Loading shared stack:', shareId);
          // Load from Firebase
          const stackRef = ref(database, `shared-stacks/${shareId}`);
          const snapshot = await get(stackRef);
          
          console.log('Snapshot exists:', snapshot.exists());
          
          if (snapshot.exists()) {
            const sharedStackData = snapshot.val();
            console.log('Loaded shared stack:', sharedStackData);
            setSharedStack(sharedStackData);
            // Set initial index to last card (Overall Dues)
            setSharedReceiptIndex(sharedStackData.receipts.length);
          } else {
            console.error('Share ID not found:', shareId);
            alert('This shared link is not valid or has expired.');
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Error loading shared stack:', error);
          console.error('Error details:', error.message, error.code);
          alert(`Failed to load shared receipt: ${error.message}\n\nPlease check that Firebase Realtime Database is enabled.`);
          window.location.href = '/';
        } finally {
          setLoadingShared(false);
        }
      }
    };
    
    checkForSharedStack();
  }, []);


  // Load saved stacks from localStorage
  useEffect(() => {
    const savedStacks = localStorage.getItem('girlMathStacks');
    if (savedStacks) {
      try {
        const parsed = JSON.parse(savedStacks);
        if (parsed.length > 0) {
          setStacks(parsed);
          setCurrentStackIndex(parsed.length - 1);
        } else {
          createDefaultStack();
        }
      } catch (e) {
        console.log('Could not load saved stacks');
        createDefaultStack();
      }
    } else {
      // Migrate old receipts data if it exists
      const oldReceipts = localStorage.getItem('girlMathReceipts');
      if (oldReceipts) {
        try {
          const parsed = JSON.parse(oldReceipts);
          if (parsed.length > 0) {
            const migratedStack = createStack('My Receipts', new Date().toISOString());
            migratedStack.receipts = parsed;
            setStacks([migratedStack]);
            localStorage.setItem('girlMathStacks', JSON.stringify([migratedStack]));
            localStorage.removeItem('girlMathReceipts'); // Clean up old data
            return;
          }
        } catch (e) {
          console.log('Could not migrate old receipts');
        }
      }
      createDefaultStack();
    }
  }, []);

  // Save stacks to localStorage whenever they change
  useEffect(() => {
    if (stacks.length > 0) {
      localStorage.setItem('girlMathStacks', JSON.stringify(stacks));
    }
  }, [stacks]);

  const createStack = (name, date) => ({
    id: Date.now(),
    name: name || 'New Hangout',
    date: date || new Date().toISOString(),
    receipts: [],
    createdAt: new Date().toISOString(),
    shareId: null // Store the share ID for this stack
  });

  const createDefaultStack = () => {
    const defaultStack = createStack('My Receipts', new Date().toISOString());
    defaultStack.receipts = [createEmptyReceipt()];
    setStacks([defaultStack]);
  };

  const createEmptyReceipt = () => ({
    id: Date.now(),
    subject: '',
    activeFriends: [...friends],
    individualItems: friends.reduce((acc, friend) => {
      acc[friend] = [];
      return acc;
    }, {}),
    sharedItems: [],
    subtotal: 0,
    taxes: 0,
    tip: 0,
    total: 0,
    payer: '',
    splits: {},
    payments: {},
    timestamp: new Date().toISOString(),
    isCompleted: false
  });

  const getCurrentStack = () => stacks[currentStackIndex];
  const getCurrentReceipts = () => getCurrentStack()?.receipts || [];

  const addNewStack = (name, date) => {
    const newStack = createStack(name, date);
    newStack.receipts = [createEmptyReceipt()];
    setStacks(prev => [...prev, newStack]);
    setCurrentStackIndex(stacks.length);
    setCurrentReceiptIndex(0);
  };

  const updateStackInfo = (stackIndex, updates) => {
    setStacks(prev => prev.map((stack, i) => 
      i === stackIndex ? { ...stack, ...updates } : stack
    ));
  };

  const deleteStack = (stackIndex) => {
    if (stacks.length <= 1) {
      alert('You must have at least one receipt stack.');
      return;
    }
    
    if (window.confirm(`Delete "${stacks[stackIndex].name}"? All receipts in this stack will be deleted.`)) {
      setStacks(prev => prev.filter((_, i) => i !== stackIndex));
      if (currentStackIndex >= stacks.length - 1) {
        setCurrentStackIndex(Math.max(0, stacks.length - 2));
      }
      setCurrentReceiptIndex(0);
    }
  };

  const addNewReceipt = () => {
    const newReceipt = createEmptyReceipt();
    setStacks(prev => prev.map((stack, i) => 
      i === currentStackIndex 
        ? { ...stack, receipts: [...stack.receipts, newReceipt] }
        : stack
    ));
    setCurrentReceiptIndex(getCurrentReceipts().length);
  };

  const updateReceipt = (receiptIndex, updatedReceipt) => {
    setStacks(prev => prev.map((stack, i) => 
      i === currentStackIndex 
        ? {
            ...stack,
            receipts: stack.receipts.map((receipt, ri) => 
              ri === receiptIndex ? updatedReceipt : receipt
            )
          }
        : stack
    ));
  };

  const deleteReceipt = (receiptIndex) => {
    const currentReceipts = getCurrentReceipts();
    
    // Always allow deletion, but keep at least one receipt in the stack
    if (currentReceipts.length <= 1) {
      // Replace with empty receipt instead of deleting
      if (window.confirm('This is the last receipt. Replace it with a new empty receipt?')) {
        const emptyReceipt = createEmptyReceipt();
        setStacks(prev => prev.map((stack, i) => 
          i === currentStackIndex 
            ? { ...stack, receipts: [emptyReceipt] }
            : stack
        ));
        setCurrentReceiptIndex(0);
      }
      return;
    }
    
    setStacks(prev => prev.map((stack, i) => 
      i === currentStackIndex 
        ? {
            ...stack,
            receipts: stack.receipts.filter((_, ri) => ri !== receiptIndex)
          }
        : stack
    ));
    
    // Adjust current index
    if (currentReceiptIndex >= currentReceipts.length - 1) {
      setCurrentReceiptIndex(Math.max(0, currentReceipts.length - 2));
    } else if (currentReceiptIndex > receiptIndex) {
      setCurrentReceiptIndex(currentReceiptIndex - 1);
    }
  };

  const navigateToReceipt = (index) => {
    setCurrentReceiptIndex(index);
  };

  const switchStack = (stackIndex) => {
    setCurrentStackIndex(stackIndex);
    setCurrentReceiptIndex(0);
    setShowStackManager(false);
  };

  const calculateOverallBalance = () => {
    const currentReceipts = getCurrentReceipts();
    const completedReceipts = currentReceipts.filter(receipt => receipt.isCompleted);
    
    if (completedReceipts.length === 0) {
      return {};
    }

    const netBalances = friends.reduce((acc, friend) => {
      acc[friend] = 0;
      return acc;
    }, {});

    completedReceipts.forEach(receipt => {
      const payer = receipt.payer;
      // Safety check: ensure splits exists
      const splits = receipt.splits || {};
      const payerOwes = splits[payer] || 0;
      const payerPaid = receipt.total;

      netBalances[payer] += payerPaid - payerOwes;

      friends.forEach(friend => {
        if (friend !== payer) {
          const friendOwes = splits[friend] || 0;
          netBalances[friend] -= friendOwes;
        }
      });
    });

    return netBalances;
  };

  // Function to share current stack to Firebase
  const shareCurrentStack = async () => {
    if (!isFirebaseConfigured || !database) {
      alert('Firebase is not configured. Sharing features are not available.\n\nPlease configure Firebase environment variables to enable sharing.');
      return null;
    }

    const stack = getCurrentStack();
    const completedReceipts = stack.receipts.filter(r => r.isCompleted);
    
    if (completedReceipts.length === 0) {
      alert('Please complete at least one receipt before sharing.');
      return null;
    }
    
    try {
      // Reuse existing share ID if available, otherwise generate new one
      let shareId = stack.shareId;
      if (!shareId) {
        shareId = generateShareId();
        // Save the share ID to the stack
        updateStackInfo(currentStackIndex, { shareId });
      }
      
      // Prepare data for sharing (only completed receipts and overall balance)
      const shareData = {
        stackName: stack.name,
        stackDate: stack.date,
        receipts: completedReceipts,
        sharedAt: new Date().toISOString()
      };
      
      // Save/Update in Firebase
      const stackRef = ref(database, `shared-stacks/${shareId}`);
      await set(stackRef, shareData);
      
      // Return the share URL
      const shareUrl = `${window.location.origin}/${shareId}`;
      return shareUrl;
    } catch (error) {
      console.error('Error sharing stack:', error);
      alert('Failed to share. Please make sure you have configured Firebase correctly.');
      return null;
    }
  };

  // If viewing a shared stack
  if (loadingShared) {
    return (
      <div className="app">
        <div style={{ textAlign: 'center', padding: '100px 20px', color: 'white' }}>
          <h2>Loading shared receipt...</h2>
          <p>Please wait...</p>
        </div>
      </div>
    );
  }

  if (sharedStack) {
    // Calculate overall balance for shared stack
    const sharedBalances = friends.reduce((acc, friend) => {
      acc[friend] = 0;
      return acc;
    }, {});

    sharedStack.receipts.forEach(receipt => {
      const payer = receipt.payer;
      // Safety check: ensure splits exists
      const splits = receipt.splits || {};
      const payerOwes = splits[payer] || 0;
      const payerPaid = receipt.total;

      sharedBalances[payer] += payerPaid - payerOwes;

      friends.forEach(friend => {
        if (friend !== payer) {
          const friendOwes = splits[friend] || 0;
          sharedBalances[friend] -= friendOwes;
        }
      });
    });

    const sharedOverallData = {
      balances: sharedBalances,
      completedReceipts: sharedStack.receipts
    };

    const sharedTotalCards = sharedStack.receipts.length + 1; // receipts + overall balance

    return (
      <div className="app">
        <ReceiptCarousel
          receipts={sharedStack.receipts}
          currentIndex={sharedReceiptIndex}
          onUpdateReceipt={() => {}}
          onDeleteReceipt={() => {}}
          onNavigate={(index) => setSharedReceiptIndex(index)}
          friends={friends}
          overallBalanceData={sharedOverallData}
          isReadOnly={true}
          stackName={sharedStack.stackName}
        />
        
        <div className="receipt-counter">
          {sharedStack.stackName || 'Shared Receipt'}
          <br />
          {sharedReceiptIndex + 1} / {sharedTotalCards}
        </div>

        <button 
          className="back-to-app-btn"
          onClick={() => {
            window.location.href = window.location.origin;
          }}
          title="Back to Home"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  const currentReceipts = getCurrentReceipts();
  const currentStack = getCurrentStack();
  const completedReceipts = currentReceipts.filter(r => r.isCompleted);
  const overallBalanceData = completedReceipts.length > 0 ? {
    balances: calculateOverallBalance(),
    completedReceipts: completedReceipts
  } : null;

  const totalCards = currentReceipts.length + (overallBalanceData ? 1 : 0);

  return (
    <div className="app">
      <ReceiptCarousel
        receipts={currentReceipts}
        currentIndex={currentReceiptIndex}
        onUpdateReceipt={updateReceipt}
        onDeleteReceipt={deleteReceipt}
        onNavigate={navigateToReceipt}
        friends={friends}
        overallBalanceData={overallBalanceData}
        isReadOnly={false}
        onShareStack={shareCurrentStack}
      />
      
      <button 
        className="add-receipt-btn"
        onClick={addNewReceipt}
        title="Add New Receipt"
      >
        +
      </button>

      <button 
        className="history-btn"
        onClick={() => setShowHistory(true)}
        title="View Receipt History"
      >
        📚
      </button>

      <button 
        className="stack-manager-btn"
        onClick={() => setShowStackManager(true)}
        title="Manage Receipt Stacks"
      >
        📁
      </button>

      <div className="receipt-counter">
        {currentStack?.name || 'Loading...'}
        <br />
        {currentReceiptIndex + 1} / {totalCards}
        {completedReceipts.length > 0 && (
          <span> • {completedReceipts.length} completed</span>
        )}
      </div>

      {showHistory && (
        <ReceiptHistory
          receipts={currentReceipts}
          friends={friends}
          onViewReceipt={(index) => {
            const completedIdx = currentReceipts.filter(r => r.isCompleted);
            const actualIndex = currentReceipts.findIndex(r => r.id === completedIdx[index].id);
            navigateToReceipt(actualIndex);
            setShowHistory(false);
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showStackManager && (
        <StackManager
          stacks={stacks}
          currentStackIndex={currentStackIndex}
          onSwitchStack={switchStack}
          onCreateStack={addNewStack}
          onUpdateStack={updateStackInfo}
          onDeleteStack={deleteStack}
          onClose={() => setShowStackManager(false)}
        />
      )}
    </div>
  );
}

// Stack Manager Component
function StackManager({ stacks, currentStackIndex, onSwitchStack, onCreateStack, onUpdateStack, onDeleteStack, onClose }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newStackName, setNewStackName] = useState('');
  const [newStackDate, setNewStackDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingStack, setEditingStack] = useState(null);

  const handleCreateStack = () => {
    if (!newStackName.trim()) {
      alert('Please enter a name for the hangout');
      return;
    }
    const dateISO = new Date(newStackDate).toISOString();
    onCreateStack(newStackName, dateISO);
    setNewStackName('');
    setNewStackDate(new Date().toISOString().split('T')[0]);
    setShowNewForm(false);
  };

  const handleUpdateStack = (stackIndex) => {
    if (!editingStack.name.trim()) {
      alert('Name cannot be empty');
      return;
    }
    onUpdateStack(stackIndex, {
      name: editingStack.name,
      date: new Date(editingStack.date).toISOString()
    });
    setEditingStack(null);
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-modal stack-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h2>📁 Receipt Stacks</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="history-body">
          <button 
            className="create-stack-btn"
            onClick={() => setShowNewForm(!showNewForm)}
          >
            + New Hangout
          </button>

          {showNewForm && (
            <div className="new-stack-form">
              <input
                type="text"
                placeholder="Hangout name (e.g., Norcal Trip)"
                value={newStackName}
                onChange={(e) => setNewStackName(e.target.value)}
                className="stack-name-input"
              />
              <input
                type="date"
                value={newStackDate}
                onChange={(e) => setNewStackDate(e.target.value)}
                className="stack-date-input"
              />
              <div className="form-actions">
                <button onClick={handleCreateStack} className="save-stack-btn">Create</button>
                <button onClick={() => setShowNewForm(false)} className="cancel-stack-btn">Cancel</button>
              </div>
            </div>
          )}

          <div className="stack-list">
            {stacks.map((stack, index) => (
              <div 
                key={stack.id} 
                className={`stack-item ${index === currentStackIndex ? 'active-stack' : ''}`}
              >
                {editingStack?.index === index ? (
                  <div className="edit-stack-form">
                    <input
                      type="text"
                      value={editingStack.name}
                      onChange={(e) => setEditingStack({ ...editingStack, name: e.target.value })}
                      className="stack-name-input"
                    />
                    <input
                      type="date"
                      value={editingStack.date}
                      onChange={(e) => setEditingStack({ ...editingStack, date: e.target.value })}
                      className="stack-date-input"
                    />
                    <div className="form-actions">
                      <button onClick={() => handleUpdateStack(index)} className="save-stack-btn">Save</button>
                      <button onClick={() => setEditingStack(null)} className="cancel-stack-btn">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="stack-info" onClick={() => onSwitchStack(index)}>
                      <h3>{stack.name}</h3>
                      <div className="stack-meta">
                        <span className="stack-date">📅 {formatDate(stack.date)}</span>
                        <span className="stack-receipts">
                          {stack.receipts.length} receipt{stack.receipts.length !== 1 ? 's' : ''}
                        </span>
                        <span className="stack-completed">
                          {stack.receipts.filter(r => r.isCompleted).length} completed
                        </span>
                      </div>
                    </div>
                    <div className="stack-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStack({
                            index,
                            name: stack.name,
                            date: new Date(stack.date).toISOString().split('T')[0]
                          });
                        }}
                        className="edit-stack-btn"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStack(index);
                        }}
                        className="delete-stack-btn"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
