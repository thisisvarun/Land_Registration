import React, { useState, useEffect } from 'react';

function BuyerDashboard() {
  const [lands, setLands] = useState([]);

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/land/approved', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        setLands(data);
      } catch (error) {
        console.error('Error fetching lands:', error);
      }
    };
    fetchLands();
  }, []);

  const handlePurchase = async (landId) => {
    try {
      const response = await fetch('http://localhost:5000/api/land/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ landId, buyer: localStorage.getItem('userId') }),
      });
      const data = await response.json();
      console.log('Purchase Request:', data);
      alert('Purchase request submitted!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Buyer Dashboard</h2>
      <h3>Available Lands</h3>
      {lands.map((land) => (
        <div key={land.landId}>
          <p>Land ID: {land.landId}</p>
          <p>Location: {land.location}</p>
          <p>Price: ₹{land.price}</p>
          <button onClick={() => handlePurchase(land.landId)}>Purchase</button>
        </div>
      ))}
    </div>
  );
}

export default BuyerDashboard;