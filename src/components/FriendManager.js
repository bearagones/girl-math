import React, { useState } from 'react';
import { COLOR_PALETTE } from '../FriendsContext';

function FriendManager({ friends, onSave, onClose }) {
  const [draft, setDraft] = useState(friends.map((f) => ({ ...f })));

  const updateFriend = (id, updates) => {
    setDraft((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const addFriend = () => {
    const [colorA, colorB] = COLOR_PALETTE[draft.length % COLOR_PALETTE.length];
    const id = `f_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setDraft((prev) => [...prev, { id, name: '', colorA, colorB }]);
  };

  const removeFriend = (id) => {
    const f = draft.find((x) => x.id === id);
    const label = f && f.name ? f.name : 'this person';
    if (window.confirm(`Remove ${label}? Receipts that already include them will show "Removed friend".`)) {
      setDraft((prev) => prev.filter((x) => x.id !== id));
    }
  };

  const handleSave = () => {
    const cleaned = draft
      .map((f) => ({ ...f, name: f.name.trim() }))
      .filter((f) => f.name.length > 0);
    onSave(cleaned);
    onClose();
  };

  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h2>👯 Your Friends</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        <div className="history-body">
          <p className="friend-manager-help">
            Add the people you split bills with and pick two colors for each. Saved on this device.
          </p>

          {draft.length === 0 && (
            <div className="no-history">
              <p>No friends yet!</p>
              <p>Tap "Add person" to get started.</p>
            </div>
          )}

          {draft.map((f) => (
            <div
              key={f.id}
              className="friend-edit-row"
              style={{
                borderLeft: '4px solid',
                borderImage: `linear-gradient(to bottom, ${f.colorA}, ${f.colorB}) 1`
              }}
            >
              <input
                type="text"
                className="friend-edit-name"
                placeholder="Name"
                value={f.name}
                maxLength={24}
                onChange={(e) => updateFriend(f.id, { name: e.target.value })}
              />
              <div className="friend-edit-colors">
                <label>
                  <input
                    type="color"
                    value={f.colorA}
                    onChange={(e) => updateFriend(f.id, { colorA: e.target.value })}
                  />
                </label>
                <label>
                  <input
                    type="color"
                    value={f.colorB}
                    onChange={(e) => updateFriend(f.id, { colorB: e.target.value })}
                  />
                </label>
                <button className="delete-stack-btn" onClick={() => removeFriend(f.id)} title="Remove">
                  🗑️
                </button>
              </div>
            </div>
          ))}

          <button className="create-stack-btn" onClick={addFriend}>+ Add person</button>

          <div className="form-actions">
            <button className="save-stack-btn" onClick={handleSave}>Save</button>
            <button className="cancel-stack-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FriendManager;
