import React, { useState, useEffect } from 'react';
import FriendSection from './FriendSection';
import SharedItems from './SharedItems';
import ReceiptTotals from './ReceiptTotals';

function Receipt({ receipt, friends, onUpdate, onDelete, isActive }) {
  const [localReceipt, setLocalReceipt] = useState(receipt);
  const [showResults, setShowResults] = useState(false);
  const [splits, setSplits] = useState({});
  const [showFriendManager, setShowFriendManager] = useState(false);

  useEffect(() => {
    setLocalReceipt(receipt);
  }, [receipt]);

  // Ensure activeFriends and individualItems exist for backward compatibility
  useEffect(() => {
    const updates = {};
    
    if (!localReceipt.activeFriends) {
      updates.activeFriends = [...friends];
    }
    
    // Ensure all friends have individualItems entries
    const currentItems = localReceipt.individualItems || {};
    const needsItemsUpdate = friends.some(friend => !Array.isArray(currentItems[friend]));
    
    if (needsItemsUpdate) {
      updates.individualItems = friends.reduce((acc, friend) => {
        acc[friend] = Array.isArray(currentItems[friend]) ? currentItems[friend] : [];
        return acc;
      }, {});
    }
    
    if (Object.keys(updates).length > 0) {
      updateLocalReceipt(updates);
    }
  }, [localReceipt, friends]);

  const updateLocalReceipt = (updates) => {
    const updatedReceipt = { ...localReceipt, ...updates };
    setLocalReceipt(updatedReceipt);
    onUpdate(updatedReceipt);
  };

  // Auto-calculate subtotal from all items
  const calculateSubtotal = () => {
    const activeFriends = getActiveFriends();
    
    // Calculate individual items total
    const individualTotal = activeFriends.reduce((sum, friend) => {
      return sum + localReceipt.individualItems[friend].reduce((friendSum, item) => friendSum + item.price, 0);
    }, 0);

    // Calculate shared items total
    const sharedTotal = localReceipt.sharedItems.reduce((sum, item) => sum + item.price, 0);

    return individualTotal + sharedTotal;
  };

  // Auto-calculate total from subtotal, taxes, and tip
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxes = localReceipt.taxes || 0;
    const tip = localReceipt.tip || 0;
    return subtotal + taxes + tip;
  };

  // Update subtotal and total whenever items change
  useEffect(() => {
    const newSubtotal = calculateSubtotal();
    const newTotal = calculateTotal();
    
    if (newSubtotal !== localReceipt.subtotal || newTotal !== localReceipt.total) {
      const updates = { subtotal: newSubtotal, total: newTotal };
      const updatedReceipt = { ...localReceipt, ...updates };
      setLocalReceipt(updatedReceipt);
      onUpdate(updatedReceipt);
    }
  }, [localReceipt.individualItems, localReceipt.sharedItems, localReceipt.taxes, localReceipt.tip, localReceipt.activeFriends]);

  const addIndividualItem = (friendName, item) => {
    const updatedItems = {
      ...localReceipt.individualItems,
      [friendName]: [...localReceipt.individualItems[friendName], item]
    };
    updateLocalReceipt({ individualItems: updatedItems });
  };

  const removeIndividualItem = (friendName, itemIndex) => {
    const updatedItems = {
      ...localReceipt.individualItems,
      [friendName]: localReceipt.individualItems[friendName].filter((_, i) => i !== itemIndex)
    };
    updateLocalReceipt({ individualItems: updatedItems });
  };

  const addSharedItem = (item) => {
    const updatedSharedItems = [...localReceipt.sharedItems, item];
    updateLocalReceipt({ sharedItems: updatedSharedItems });
  };

  const removeSharedItem = (itemIndex) => {
    const updatedSharedItems = localReceipt.sharedItems.filter((_, i) => i !== itemIndex);
    updateLocalReceipt({ sharedItems: updatedSharedItems });
  };

  const calculateSplit = () => {
    if (!localReceipt.subject || !localReceipt.payer || localReceipt.total <= 0) {
      alert('Please fill in all required fields (subject, who paid, and total).');
      return;
    }

    const calculatedSplits = {};
    const activeFriends = getActiveFriends();
    
    // Initialize splits for active friends only
    activeFriends.forEach(friend => {
      calculatedSplits[friend] = 0;
    });

    // Add individual items for active friends only
    activeFriends.forEach(friend => {
      const individualTotal = localReceipt.individualItems[friend].reduce((sum, item) => sum + item.price, 0);
      calculatedSplits[friend] += individualTotal;
    });

    // Add shared items (only active friends can participate)
    localReceipt.sharedItems.forEach(item => {
      const sharePerPerson = item.price / item.participants.length;
      item.participants.forEach(participant => {
        if (activeFriends.includes(participant)) {
          calculatedSplits[participant] += sharePerPerson;
        }
      });
    });

    // Calculate tax rate and apply to each person's subtotal
    const subtotal = localReceipt.subtotal || 0;
    const taxes = localReceipt.taxes || 0;
    const tip = localReceipt.tip || 0;

    if (subtotal > 0 && taxes > 0) {
      // Calculate tax rate: (Total Tax ÷ Subtotal) + 1
      const taxRate = (taxes / subtotal) + 1;
      
      // Apply tax rate to each person's subtotal
      activeFriends.forEach(friend => {
        if (calculatedSplits[friend] > 0) {
          calculatedSplits[friend] = calculatedSplits[friend] * taxRate;
        }
      });
    }

    // Add tip split evenly among active friends
    if (tip > 0 && activeFriends.length > 0) {
      const tipPerPerson = tip / activeFriends.length;
      activeFriends.forEach(friend => {
        calculatedSplits[friend] += tipPerPerson;
      });
    }

    // Round up all amounts to the nearest cent
    activeFriends.forEach(friend => {
      if (calculatedSplits[friend] > 0) {
        calculatedSplits[friend] = Math.ceil(calculatedSplits[friend] * 100) / 100;
      }
    });

    setSplits(calculatedSplits);
    setShowResults(true);
  };

  const saveReceipt = () => {
    if (!localReceipt.subject || !localReceipt.payer || localReceipt.total <= 0) {
      alert('Please fill in all required fields and calculate the split first.');
      return;
    }

    const updatedReceipt = {
      ...localReceipt,
      splits: splits,
      isCompleted: true,
      timestamp: new Date().toISOString()
    };

    updateLocalReceipt(updatedReceipt);
    alert('Receipt saved successfully!');
  };

  const clearForm = () => {
    if (window.confirm('Are you sure you want to clear the current form?')) {
      const clearedReceipt = {
        ...localReceipt,
        subject: '',
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
        isCompleted: false
      };
      
      setLocalReceipt(clearedReceipt);
      onUpdate(clearedReceipt);
      setShowResults(false);
      setSplits({});
    }
  };

  const getFriendTotal = (friendName) => {
    return localReceipt.individualItems[friendName].reduce((sum, item) => sum + item.price, 0);
  };

  const toggleFriend = (friendName) => {
    const activeFriends = localReceipt.activeFriends || [...friends];
    const isActive = activeFriends.includes(friendName);
    
    if (isActive) {
      // Remove friend - but keep at least one friend active
      if (activeFriends.length > 1) {
        const updatedActiveFriends = activeFriends.filter(f => f !== friendName);
        // Clear their individual items when removing
        const updatedItems = {
          ...localReceipt.individualItems,
          [friendName]: []
        };
        // Remove them from shared items
        const updatedSharedItems = localReceipt.sharedItems.map(item => ({
          ...item,
          participants: item.participants.filter(p => p !== friendName)
        })).filter(item => item.participants.length > 0);
        
        updateLocalReceipt({ 
          activeFriends: updatedActiveFriends,
          individualItems: updatedItems,
          sharedItems: updatedSharedItems,
          payer: localReceipt.payer === friendName ? '' : localReceipt.payer
        });
      } else {
        alert('At least one friend must be active for the receipt.');
      }
    } else {
      // Add friend - ensure they have an individualItems entry
      const updatedActiveFriends = [...activeFriends, friendName];
      const updatedItems = {
        ...localReceipt.individualItems,
        [friendName]: localReceipt.individualItems[friendName] || []
      };
      updateLocalReceipt({ 
        activeFriends: updatedActiveFriends,
        individualItems: updatedItems
      });
    }
  };

  const getActiveFriends = () => {
    return localReceipt.activeFriends || friends;
  };

  return (
    <div className="receipt-card-content">
      {/* Receipt Header */}
      <div className="receipt-header">
        <h1>🫚 Girl Math 🫚</h1>
        <p>Because regular math is ✨hard✨</p>
      </div>

      {/* Receipt Body */}
      <div className="receipt-body">
        {/* Subject Section */}
        <div className="subject-section">
          <input
            type="text"
            className="subject-input"
            placeholder="Subject"
            value={localReceipt.subject}
            onChange={(e) => updateLocalReceipt({ subject: e.target.value })}
          />
        </div>

        {/* Friend Management Section */}
        <div className="friend-management-section">
          <button 
            className="friend-manager-toggle"
            onClick={() => setShowFriendManager(!showFriendManager)}
          >
            👥 Manage Friends ({getActiveFriends().length}/{friends.length})
          </button>
          
          {showFriendManager && (
            <div className="friend-manager">
              <div className="friend-manager-title">Select friends for this hangout:</div>
              <div className="friend-checkboxes">
                {friends.map(friend => (
                  <label key={friend} className="friend-checkbox">
                    <input
                      type="checkbox"
                      checked={getActiveFriends().includes(friend)}
                      onChange={() => toggleFriend(friend)}
                    />
                    <span className={`friend-checkbox-label ${friend}`}>
                      {friend.charAt(0).toUpperCase() + friend.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Friends Section */}
        <div className="friends-section">
          <div className="section-title">Individual Items</div>
          {getActiveFriends().map(friend => (
            <FriendSection
              key={friend}
              friendName={friend}
              items={localReceipt.individualItems[friend]}
              total={getFriendTotal(friend)}
              onAddItem={(item) => addIndividualItem(friend, item)}
              onRemoveItem={(itemIndex) => removeIndividualItem(friend, itemIndex)}
              isActive={isActive}
            />
          ))}
        </div>

        {/* Shared Items Section */}
        <SharedItems
          items={localReceipt.sharedItems}
          friends={getActiveFriends()}
          onAddItem={addSharedItem}
          onRemoveItem={removeSharedItem}
          isActive={isActive}
        />

        {/* Totals Section */}
        <ReceiptTotals
          subtotal={localReceipt.subtotal}
          taxes={localReceipt.taxes}
          tip={localReceipt.tip}
          total={localReceipt.total}
          payer={localReceipt.payer}
          friends={getActiveFriends()}
          onUpdate={updateLocalReceipt}
        />

        {/* Action Buttons */}
        <div className="actions">
          <button 
            className="action-btn calculate-btn" 
            onClick={calculateSplit}
          >
            Calculate Split
          </button>
          <button 
            className="action-btn save-btn" 
            onClick={saveReceipt}
          >
            Save Receipt
          </button>
          <button 
            className="action-btn clear-btn" 
            onClick={clearForm}
          >
            Clear Form
          </button>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="results-section">
            <div className="section-title">Split Calculation</div>
            {friends.map(friend => {
              const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
              const amount = splits[friend] || 0;
              
              if (amount <= 0) return null;
              
              if (friend === localReceipt.payer) {
                const amountOwedToThem = localReceipt.total - amount;
                return (
                  <div key={friend} className="split-result gets-paid">
                    <span><strong>{friendName}</strong> paid and should receive:</span>
                    <span><strong>${amountOwedToThem.toFixed(2)}</strong></span>
                  </div>
                );
              } else {
                return (
                  <div key={friend} className="split-result owes">
                    <span><strong>{friendName}</strong> owes {localReceipt.payer.charAt(0).toUpperCase() + localReceipt.payer.slice(1)}:</span>
                    <span><strong>${amount.toFixed(2)}</strong></span>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Receipt;
