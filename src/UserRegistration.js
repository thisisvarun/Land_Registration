import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Configure IPFS
const projectId = 'YOUR_INFURA_IPFS_PROJECT_ID';
const projectSecret = 'YOUR_INFURA_IPFS_PROJECT_SECRET';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

function UserRegistration({ web3, contract, account }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [document, setDocument] = useState(null);
  const [documentHash, setDocumentHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const checkIfRegistered = async () => {
      if (contract && account) {
        try {
          const user = await contract.methods.users(account).call();
          setIsRegistered(user.id !== '0x0000000000000000000000000000000000000000');
        } catch (error) {
          console.error("Error checking registration status:", error);
        }
      }
    };

    checkIfRegistered();
  }, [contract, account]);

  const handleDocumentChange = (e) => {
    setDocument(e.target.files[0]);
  };

  const uploadToIPFS = async () => {
    try {
      const added = await client.add(document);
      return added.path;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error('IPFS upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!contract) {
        throw new Error('Contract not loaded');
      }

      if (!name || !age || !city || !aadharNumber || !panNumber || !document) {
        throw new Error('Please fill all fields and upload your document');
      }

      // Validate inputs
      if (isNaN(age) || parseInt(age) <= 0) {
        throw new Error('Please enter a valid age');
      }

      if (aadharNumber.length !== 12 || isNaN(aadharNumber)) {
        throw new Error('Aadhar number should be 12 digits');
      }

      if (panNumber.length !== 10) {
        throw new Error('PAN number should be 10 characters');
      }

      // Upload document to IPFS
      const hash = await uploadToIPFS();
      setDocumentHash(hash);

      // Register user on blockchain
      await contract.methods.registerUser(
        name,
        parseInt(age),
        city,
        aadharNumber,
        panNumber,
        hash
      ).send({ from: account });

      setRegistered(true);
      setLoading(false);

    } catch (error) {
      console.error('Error registering user:', error);
      setError(error.message || 'Failed to register user');
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <Alert variant="info" className="mt-4">
        <Alert.Heading>Already Registered!</Alert.Heading>
        <p>
          You have already registered as a user. Please wait for the government authority to verify your account.
        </p>
      </Alert>
    );
  }

  if (registered) {
    return (
      <Alert variant="success" className="mt-4">
        <Alert.Heading>Registration Successful!</Alert.Heading>
        <p>
          Your registration has been submitted successfully. Please wait for verification from the government authority.
        </p>
        <p>
          Your document has been stored securely on IPFS with hash: <code>{documentHash}</code>
        </p>
      </Alert>
    );
  }

  return (
    <div className="my-4">
      <h2 className="text-center mb-4">User Registration</h2>
      <Card className="shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min="18"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Aadhar Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter 12-digit Aadhar number"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value)}
                required
                maxLength="12"
                pattern="[0-9]{12}"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>PAN Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter 10-character PAN number"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                required
                maxLength="10"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Identity Document</Form.Label>
              <Form.Control
                type="file"
                onChange={handleDocumentChange}
                required
              />
              <Form.Text className="text-muted">
                Please upload a scanned copy of your identity document (Aadhar/PAN/Passport)
              </Form.Text>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Register'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default UserRegistration;