import React, { useState, useEffect } from 'react';

function GovernmentDashboard() {
  const [pendingLands, setPendingLands] = useState([]);

  useEffect(() => {
    const fetchPendingLands = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/land/pending', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        setPendingLands(data);
      } catch (error) {
        console.error('Error fetching pending lands:', error);
      }
    };
    fetchPendingLands();
  }, []);

  const handleApprove = async (landId, price) => {
    const stampDuty = price * 0.06; // 6% stamp duty (Indian avg.)
    try {
      const response = await fetch('http://localhost:5000/api/land/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ landId, stampDuty }),
      });
      const data = await response.json();
      console.log('Approved:', data);
      alert(`Land approved! Stamp Duty: ₹${stampDuty}`);
      setPendingLands(pendingLands.filter((land) => land.landId !== landId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Government Dashboard</h2>
      <h3>Pending Approvals</h3>
      {pendingLands.map((land) => (
        <div key={land.landId}>
          <p>Land ID: {land.landId}</p>
          <p>Location: {land.location}</p>
          <p>Price: ₹{land.price}</p>
          <button onClick={() => handleApprove(land.landId, land.price)}>Approve</button>
        </div>
      ))}
    </div>
  );
}

export default GovernmentDashboard;