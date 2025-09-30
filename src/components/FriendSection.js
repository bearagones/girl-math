import React, { useState } from 'react';

function FriendSection({ friendName, items, total, onAddItem, onRemoveItem, isActive }) {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    
    if (itemName.trim() && itemPrice && parseFloat(itemPrice) > 0) {
      onAddItem({
        name: itemName.trim(),
        price: parseFloat(itemPrice)
      });
      
      setItemName('');
      setItemPrice('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddItem(e);
    }
  };

  return (
    <div className={`friend-item ${friendName}`}>
      <div className={`friend-name ${friendName}`}>
        {friendName.charAt(0).toUpperCase() + friendName.slice(1)}
      </div>
      
      <div className="items-list">
        {items.map((item, index) => (
          <div key={index} className="item-row">
            <span className="item-name">{item.name}</span>
            <span className="item-price">${item.price.toFixed(2)}</span>
            <button 
              className="item-remove"
              onClick={() => onRemoveItem(index)}
              title="Remove item"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {isActive && (
        <form className="add-item-form" onSubmit={handleAddItem}>
          <input
            type="text"
            placeholder="Item name"
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
          />
          <button type="submit">Add</button>
        </form>
      )}

      <div className="friend-total">
        Total: ${total.toFixed(2)}
      </div>
    </div>
  );
}

export default FriendSection;
