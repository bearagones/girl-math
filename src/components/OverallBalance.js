import React from 'react';
import { useFriends } from '../FriendsContext';

function OverallBalance({ balances, friends, show, onToggle }) {
  const { getName } = useFriends();
  if (!show) {
    return (
      <div className="overall-balance" style={{ padding: '15px' }}>
        <button className="balance-toggle" onClick={onToggle}>
          Show Overall Balance
        </button>
      </div>
    );
  }

  // Sort friends by balance (creditors first, then debtors)
  const sortedFriends = friends.sort((a, b) => balances[b] - balances[a]);

  return (
    <div className="overall-balance">
      <button className="balance-toggle" onClick={onToggle}>
        Hide Overall Balance
      </button>
      
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
        Overall Balance Summary
      </div>
      
      {sortedFriends.map(friend => {
        const friendName = getName(friend);
        const balance = balances[friend] || 0;
        
        if (Math.abs(balance) <= 0.01) {
          return (
            <div key={friend} className="balance-result settled">
              <span><strong>{friendName}</strong> is settled up</span>
              <span style={{ color: '#28a745' }}>✓</span>
            </div>
          );
        }
        
        return (
          <div key={friend} className="balance-result">
            {balance > 0 ? (
              <>
                <span><strong>{friendName}</strong> should receive:</span>
                <span style={{ color: '#28a745', fontWeight: '600' }}>
                  ${balance.toFixed(2)}
                </span>
              </>
            ) : (
              <>
                <span><strong>{friendName}</strong> owes:</span>
                <span style={{ color: '#dc3545', fontWeight: '600' }}>
                  ${Math.abs(balance).toFixed(2)}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default OverallBalance;
