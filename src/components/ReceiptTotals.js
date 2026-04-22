import React, { useState } from 'react';

function ReceiptTotals({ subtotal, tip, total, taxes, payer, friends, onUpdate, discount, additionalFee }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleInputChange = (field, value) => {
    onUpdate({ [field]: parseFloat(value) || 0 });
  };

  const handlePayerChange = (selectedPayer) => {
    onUpdate({ payer: selectedPayer });
  };

  const handleDiscountChange = (updates) => {
    onUpdate({ 
      discount: { 
        ...(discount || { enabled: false, amount: 0 }), 
        ...updates 
      } 
    });
  };

  const handleAdditionalFeeChange = (updates) => {
    onUpdate({ 
      additionalFee: { 
        ...(additionalFee || { 
          enabled: false, 
          amount: 0, 
          isPercentage: false, 
          applyAfterTax: false,
          name: '' 
        }), 
        ...updates 
      } 
    });
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

      {/* Advanced Options Toggle */}
      <button 
        className="advanced-toggle-btn"
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{ marginTop: '15px' }}
      >
        {showAdvanced ? '▼' : '▶'} Advanced (Discounts & Fees)
      </button>

      {/* Advanced Section */}
      {showAdvanced && (
        <div className="advanced-section">
          {/* Discount Section */}
          <div className="advanced-subsection">
            <label className="advanced-checkbox">
              <input
                type="checkbox"
                checked={discount?.enabled || false}
                onChange={(e) => handleDiscountChange({ enabled: e.target.checked })}
              />
              <span>Apply Discount</span>
            </label>
            
            {discount?.enabled && (
              <div className="advanced-fields">
                <div className="total-input-group">
                  <label>Discount Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={discount?.amount || ''}
                    onChange={(e) => handleDiscountChange({ amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="advanced-note">
                  💡 Discount is subtracted from the subtotal before tax
                </div>
              </div>
            )}
          </div>

          {/* Additional Fee Section */}
          <div className="advanced-subsection">
            <label className="advanced-checkbox">
              <input
                type="checkbox"
                checked={additionalFee?.enabled || false}
                onChange={(e) => handleAdditionalFeeChange({ enabled: e.target.checked })}
              />
              <span>Apply Additional Fee</span>
            </label>
            
            {additionalFee?.enabled && (
              <div className="advanced-fields">
                <div className="total-input-group">
                  <label>Fee Name (e.g., "SF Mandate")</label>
                  <input
                    type="text"
                    placeholder="Fee name"
                    value={additionalFee?.name || ''}
                    onChange={(e) => handleAdditionalFeeChange({ name: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="fee-type-selector">
                  <label className="fee-radio">
                    <input
                      type="radio"
                      name="feeType"
                      checked={!(additionalFee?.isPercentage)}
                      onChange={() => handleAdditionalFeeChange({ isPercentage: false })}
                    />
                    <span>Flat Amount ($)</span>
                  </label>
                  <label className="fee-radio">
                    <input
                      type="radio"
                      name="feeType"
                      checked={additionalFee?.isPercentage || false}
                      onChange={() => handleAdditionalFeeChange({ isPercentage: true })}
                    />
                    <span>Percentage (%)</span>
                  </label>
                </div>

                <div className="total-input-group">
                  <label>{additionalFee?.isPercentage ? 'Percentage (%)' : 'Amount ($)'}</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={additionalFee?.isPercentage ? '0.00' : '0.00'}
                    value={additionalFee?.amount || ''}
                    onChange={(e) => handleAdditionalFeeChange({ amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="fee-timing-selector">
                  <label className="fee-checkbox">
                    <input
                      type="checkbox"
                      checked={additionalFee?.applyAfterTax || false}
                      onChange={(e) => handleAdditionalFeeChange({ applyAfterTax: e.target.checked })}
                    />
                    <span>Apply fee after tax (instead of before)</span>
                  </label>
                </div>

                <div className="advanced-note">
                  {additionalFee?.isPercentage ? (
                    additionalFee?.applyAfterTax ? 
                      '💡 Fee will be calculated as % of (subtotal + tax)' :
                      '💡 Fee will be calculated as % of subtotal, then tax applied to total'
                  ) : (
                    additionalFee?.applyAfterTax ?
                      '💡 Fee will be split equally and added after tax' :
                      '💡 Fee will be split equally and tax will be applied to it'
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceiptTotals;
