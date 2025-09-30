import React, { useState } from 'react';

function SharedItems({ items, friends, onAddItem, onRemoveItem, isActive }) {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const handleAddItem = (e) => {
    e.preventDefault();
    
    if (itemName.trim() && itemPrice && parseFloat(itemPrice) > 0 && selectedParticipants.length > 0) {
      onAddItem({
        name: itemName.trim(),
        price: parseFloat(itemPrice),
        participants: [...selectedParticipants]
      });
      
      setItemName('');
      setItemPrice('');
      setSelectedParticipants([]);
    }
  };

  const handleParticipantChange = (friendName, isChecked) => {
    if (isChecked) {
      setSelectedParticipants(prev => [...prev, friendName]);
    } else {
      setSelectedParticipants(prev => prev.filter(name => name !== friendName));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.type !== 'checkbox') {
      handleAddItem(e);
    }
  };

  return (
    <div className="shared-section">
      <div className="section-title">Shared Items</div>
      
      <div className="shared-items">
        {items.map((item, index) => (
          <div key={index} className="shared-item">
            <div className="shared-item-info">
              <div><strong>{item.name}</strong> - ${item.price.toFixed(2)}</div>
              <div className="shared-item-participants">
                Shared by: {item.participants.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                <span> (${(item.price / item.participants.length).toFixed(2)} each)</span>
              </div>
            </div>
            <button 
              className="item-remove"
              onClick={() => onRemoveItem(index)}
              title="Remove shared item"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {isActive && (
        <div className="add-shared-form">
          <input
            type="text"
            placeholder="Shared item name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <input
            type="number"
            placeholder="Price"
            step="0.01"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ width: '80px', display: 'inline-block' }}
          />
          
          <div style={{ marginBottom: '10px', fontSize: '12px', fontWeight: '600' }}>
            Who's sharing?
          </div>
          
          <div className="participants-grid">
            {friends.map(friend => (
              <label key={friend} className="participant-checkbox">
                <input
                  type="checkbox"
                  checked={selectedParticipants.includes(friend)}
                  onChange={(e) => handleParticipantChange(friend, e.target.checked)}
                />
                {friend.charAt(0).toUpperCase() + friend.slice(1)}
              </label>
            ))}
          </div>
          
          <button 
            onClick={handleAddItem}
            style={{
              width: '100%',
              padding: '8px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            Add Shared Item
          </button>
        </div>
      )}
    </div>
  );
}

export default SharedItems;
