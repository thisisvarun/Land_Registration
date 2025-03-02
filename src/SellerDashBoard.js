import React, { useState } from 'react';

function SellerDashboard() {
  const [landId, setLandId] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState(''); // For stamp duty calculation

  const handleRegisterLand = async (e) => {
    e.preventDefault();
    const landData = { landId, location, price, seller: localStorage.getItem('userId') };

    try {
      const response = await fetch('http://localhost:5000/api/land/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(landData),
      });
      const data = await response.json();
      console.log('Land Registered:', data);
      alert('Land submitted for approval!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Seller Dashboard</h2>
      <form onSubmit={handleRegisterLand}>
        <input
          type="number"
          placeholder="Land ID"
          value={landId}
          onChange={(e) => setLandId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price (INR)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <button type="submit">Register Land</button>
      </form>
    </div>
  );
}

export default SellerDashboard;