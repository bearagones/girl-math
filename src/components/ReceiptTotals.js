import React from 'react';

function ReceiptTotals({ subtotal, tip, total, taxes, payer, friends, onUpdate }) {
  const handleInputChange = (field, value) => {
    onUpdate({ [field]: parseFloat(value) || 0 });
  };

  const handlePayerChange = (selectedPayer) => {
    onUpdate({ payer: selectedPayer });
  };

  return (
    <div className="totals-section">
      <div className="section-title">Bill Totals</div>
      
      <div className="totals-grid">
        <div className="total-input-group">
          <label>Subtotal</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={subtotal ? subtotal.toFixed(2) : '0.00'}
            readOnly
            className="readonly-input"
            title="Auto-calculated from individual and shared items"
          />
        </div>
        
        <div className="total-input-group">
          <label>Taxes</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={taxes || ''}
            onChange={(e) => handleInputChange('taxes', e.target.value)}
          />
        </div>
        
        <div className="total-input-group">
          <label>Tip</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={tip || ''}
            onChange={(e) => handleInputChange('tip', e.target.value)}
          />
        </div>
        
        <div className="total-input-group">
          <label>Total</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={total ? total.toFixed(2) : '0.00'}
            readOnly
            className="readonly-input"
            title="Auto-calculated: Subtotal + Taxes + Tip"
          />
        </div>
      </div>
      
      <div className="total-input-group" style={{ marginTop: '15px' }}>
        <label>Who Paid?</label>
        <select
          value={payer}
          onChange={(e) => handlePayerChange(e.target.value)}
        >
          <option value="">Select who paid</option>
          {friends.map(friend => (
            <option key={friend} value={friend}>
              {friend.charAt(0).toUpperCase() + friend.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ReceiptTotals;
