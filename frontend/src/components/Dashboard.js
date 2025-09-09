import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import ImpactTracker from './ImpactTracker';

const Dashboard = ({ items, refreshItems }) => {
  // Show only items that have quantity > 0 and are not picked up
  const activeItems = items.filter(item => !item.picked_up && item.quantity > 0);
  const [pickedQuantities, setPickedQuantities] = useState({});
  const { token, userRole } = useContext(AuthContext);

  const handleQtyChange = (id, value) => {
    setPickedQuantities(prev => ({ ...prev, [id]: value }));
  };

  const pickUpItems = async (id) => {
    if (!token || userRole !== 'volunteer') {
      return alert('Login as volunteer to pick up.');
    }
    const qty = parseInt(pickedQuantities[id]);
    if (!qty || qty <= 0) return alert('Invalid quantity');
    try {
      await axios.patch(`http://localhost:8000/api/surplus/${id}/pick_up/`, { quantity: qty }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshItems();
      setPickedQuantities(prev => ({ ...prev, [id]: '' }));
    } catch (error) {
      alert(error.response?.data?.error || 'Error picking up');
    }
  };

  return (
    <div>
      <h2>Available Surplus</h2>
      {activeItems.length === 0 ? (
        <p>No items available.</p>
      ) : (
        <ul className="surplus-list">
          {activeItems.map(item => (
            <li key={item.id}>
              <h3>{item.restaurant}</h3>
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>Address:</strong> {item.address}</p>
              <p><strong>Available:</strong> {item.quantity}</p>
              {userRole === 'volunteer' && (
                <>
                  <input
                    type="number"
                    value={pickedQuantities[item.id] || ''}
                    onChange={e => handleQtyChange(item.id, e.target.value)}
                    placeholder="Quantity to pick up"
                    min="1"
                    max={item.quantity}
                  />
                  <button onClick={() => pickUpItems(item.id)}>Pick Up</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {(!userRole || userRole !== 'volunteer') && activeItems.length > 0 && (
        <p><em>Login as a volunteer to pick up surplus food.</em></p>
      )}
    </div>
  );
};

export default Dashboard;
