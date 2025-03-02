import React, { useState } from 'react';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // civilian or government
  const [civilianType, setCivilianType] = useState(''); // seller or buyer

  const handleSignUp = async (e) => {
    e.preventDefault();
    const userData = {
      email,
      password,
      role,
      ...(role === 'civilian' && { civilianType }), // Add civilianType only if civilian
    };

    // Placeholder for backend API call
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      console.log('Sign Up Success:', data);
      alert('Account created! Please sign in.');
    } catch (error) {
      console.error('Sign Up Error:', error);
      alert('Failed to sign up.');
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="">Select Role</option>
          <option value="civilian">Civilian</option>
          <option value="government">Government Authority</option>
        </select>
        {role === 'civilian' && (
          <select
            value={civilianType}
            onChange={(e) => setCivilianType(e.target.value)}
            required
          >
            <option value="">Select Type</option>
            <option value="seller">Seller</option>
            <option value="buyer">Buyer</option>
          </select>
        )}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;