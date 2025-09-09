import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const SurplusForm = ({ onSuccess }) => {
  const { token } = useContext(AuthContext);
  const [form, setForm] = useState({
    restaurant: '',
    description: '',
    address: '',
    quantity: '',
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/surplus/', {
        ...form,
        quantity: parseInt(form.quantity),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setForm({ restaurant: '', description: '', address: '', quantity: '' });
      onSuccess && onSuccess();
    } catch (err) {
      alert('Error submitting surplus.');
    }
    setLoading(false);
  };

  return (
    <>
      <h2 className="form-heading">Surplus Form</h2>
      <form onSubmit={handleSubmit}>
        <input name="restaurant" value={form.restaurant} onChange={handleChange} placeholder="Restaurant Name" required />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
        <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Quantity" required />
        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
        {success && <div className="success-message">Submitted!</div>}
      </form>
    </>
  );
};

export default SurplusForm;
