import React from 'react';

function OverallBalanceCard({ balances, friends, completedReceipts }) {
  // Calculate consolidated debts between pairs of people
  const calculateConsolidatedDebts = () => {
    // First, collect all debts from all receipts using the saved splits
    const rawDebts = {};
    
    completedReceipts.forEach(receipt => {
      const payer = receipt.payer;
      
      // Use the saved splits from the receipt (which include rounding)
      friends.forEach(friend => {
        if (friend !== payer && receipt.splits && receipt.splits[friend]) {
          const amountOwed = receipt.splits[friend];
          if (amountOwed > 0.01) {
            const key = `${friend}->${payer}`;
            rawDebts[key] = (rawDebts[key] || 0) + amountOwed;
          }
        }
      });
    });
    
    // Now consolidate debts between pairs
    const consolidatedDebts = [];
    const processed = new Set();
    
    Object.keys(rawDebts).forEach(key => {
      if (processed.has(key)) return;
      
      const [from, to] = key.split('->');
      const reverseKey = `${to}->${from}`;
      
      const debtAtoB = rawDebts[key] || 0;
      const debtBtoA = rawDebts[reverseKey] || 0;
      
      // Mark both directions as processed
      processed.add(key);
      processed.add(reverseKey);
      
      // Calculate net debt
      const netDebt = debtAtoB - debtBtoA;
      
      if (Math.abs(netDebt) > 0.01) {
        if (netDebt > 0) {
          // from owes to
          consolidatedDebts.push({
            from: from,
            to: to,
            amount: netDebt
          });
        } else {
          // to owes from
          consolidatedDebts.push({
            from: to,
            to: from,
            amount: Math.abs(netDebt)
          });
        }
      }
    });
    
    return consolidatedDebts;
  };

  const consolidatedDebts = calculateConsolidatedDebts();
  
  // Get friends who actually participated in receipts
  const participatingFriends = friends.filter(friend => {
    const balance = balances[friend] || 0;
    return Math.abs(balance) > 0.01;
  });
  const totalCompleted = completedReceipts.length;

  return (
    <div className="receipt-card-content">
      {/* Receipt Header */}
      <div className="receipt-header">
        <h1>💰 Overall Dues 💰</h1>
        <p>Who owes what to whom</p>
      </div>

      {/* Receipt Body */}
      <div className="receipt-body">
        {/* Summary Section */}
        <div className="subject-section">
          <div className="balance-summary">
            Based on {totalCompleted} completed receipt{totalCompleted !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Individual Balances Section - Only show participating friends */}
        {participatingFriends.length > 0 && (
          <div className="friends-section">
            <div className="section-title">Individual Net Balances</div>
            {participatingFriends.map(friend => {
              const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
              const balance = balances[friend] || 0;
              
              return (
                <div key={friend} className="balance-result">
                  <span><strong>{friendName}</strong></span>
                  {balance > 0 ? (
                    <span style={{ color: '#28a745', fontWeight: '600' }}>
                      +${balance.toFixed(2)}
                    </span>
                  ) : (
                    <span style={{ color: '#dc3545', fontWeight: '600' }}>
                      -${Math.abs(balance).toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Consolidated Debts Section - Show net debts between people */}
        {consolidatedDebts.length > 0 && (
          <div className="shared-items-section">
            <div className="section-title">💸 Who Owes What to Whom</div>
            <div className="settlement-instructions">
              {consolidatedDebts.map((debt, index) => {
                const fromName = debt.from.charAt(0).toUpperCase() + debt.from.slice(1);
                const toName = debt.to.charAt(0).toUpperCase() + debt.to.slice(1);
                
                return (
                  <div key={index} className="transaction-item">
                    <div className="transaction-details">
                      <span className="transaction-from">{fromName}</span>
                      <span className="transaction-arrow">→</span>
                      <span className="transaction-to">{toName}</span>
                    </div>
                    <span className="transaction-amount">
                      ${debt.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {consolidatedDebts.length === 0 && totalCompleted > 0 && (
          <div className="settled-message">
            <div className="section-title">🎉 All Settled Up!</div>
            <p>Everyone has paid their fair share. No money needs to change hands!</p>
          </div>
        )}

        {totalCompleted === 0 && (
          <div className="no-receipts-message">
            <div className="section-title">📝 No Completed Receipts</div>
            <p>Complete some receipts to see the overall balance calculation.</p>
          </div>
        )}

        {/* Summary Stats */}
        {totalCompleted > 0 && (
          <div className="balance-stats">
            <div className="stat-item">
              <span>Total Receipts:</span>
              <span>{totalCompleted}</span>
            </div>
            <div className="stat-item">
              <span>Net Transactions:</span>
              <span>{consolidatedDebts.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OverallBalanceCard;
