import React from 'react';

function ReceiptHistory({ receipts, friends, onViewReceipt, onClose }) {
  const completedReceipts = receipts.filter(r => r.isCompleted);
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatus = (receipt) => {
    if (!receipt.payments) return { paid: 0, total: 0 };
    
    const friendsWhichOwe = friends.filter(f => 
      f !== receipt.payer && (receipt.splits?.[f] || 0) > 0.01
    );
    
    const paid = friendsWhichOwe.filter(f => receipt.payments[f]).length;
    const total = friendsWhichOwe.length;
    
    return { paid, total };
  };

  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h2>📚 Receipt History</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="history-body">
          {completedReceipts.length === 0 ? (
            <div className="no-history">
              <p>No completed receipts yet!</p>
              <p>Save a receipt to see it here.</p>
            </div>
          ) : (
            <div className="history-list">
              {completedReceipts.map((receipt, index) => {
                const paymentStatus = getPaymentStatus(receipt);
                const allPaid = paymentStatus.paid === paymentStatus.total && paymentStatus.total > 0;
                
                return (
                  <div 
                    key={receipt.id} 
                    className={`history-item ${allPaid ? 'all-paid' : ''}`}
                    onClick={() => onViewReceipt(index)}
                  >
                    <div className="history-item-header">
                      <h3>{receipt.subject || 'Untitled Receipt'}</h3>
                      {allPaid && <span className="all-paid-badge">✓ All Paid</span>}
                    </div>
                    
                    <div className="history-item-details">
                      <div className="history-detail">
                        <span className="detail-label">Date:</span>
                        <span>{formatDate(receipt.timestamp)}</span>
                      </div>
                      <div className="history-detail">
                        <span className="detail-label">Total:</span>
                        <span className="detail-value">${receipt.total?.toFixed(2)}</span>
                      </div>
                      <div className="history-detail">
                        <span className="detail-label">Paid by:</span>
                        <span>{receipt.payer?.charAt(0).toUpperCase() + receipt.payer?.slice(1)}</span>
                      </div>
                      <div className="history-detail">
                        <span className="detail-label">Payment Status:</span>
                        <span className={`payment-status ${allPaid ? 'complete' : 'pending'}`}>
                          {paymentStatus.paid} / {paymentStatus.total} paid
                        </span>
                      </div>
                    </div>
                    
                    <div className="history-item-footer">
                      <span className="view-receipt-link">Click to view details →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReceiptHistory;
