import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';

function LandDetails({ web3, contract, account }) {
  const { id } = useParams();
  const [land, setLand] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLandDetails = async () => {
      try {
        if (!contract) {
          setError('Contract not loaded');
          setLoading(false);
          return;
        }
        
        const landData = await contract.methods.getLandDetails(id).call();
        setLand(landData);
        
        // Fetch owner details
        const ownerData = await contract.methods.users(landData.owner).call();
        setOwner(ownerData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching land details:', error);
        setError('Error fetching land details. The land ID may be invalid.');
        setLoading(false);
      }
    };
    
    if (contract && id) {
      fetchLandDetails();
    }
  }, [contract, id]);
  
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading land details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <div className="mt-3">
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }
  
  if (!land) {
    return (
      <div className="alert alert-info" role="alert">
        Land not found. The ID may be invalid.
        <div className="mt-3">
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="land-details my-4">
      <h2 className="text-center mb-4">Land Details</h2>
      <Card className="shadow-sm">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          Property ID: {land.propertyPID.toString()}
          <Badge bg={land.isVerified ? "success" : "warning"}>
            {land.isVerified ? "Verified" : "Pending Verification"}
          </Badge>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Land Information</h6>
              <ul className="list-unstyled">
                <li><strong>Land ID:</strong> {land.landId.toString()}</li>
                <li><strong>Area:</strong> {land.area}</li>
                <li><strong>City:</strong> {land.city}</li>
                <li><strong>State:</strong> {land.state}</li>
                <li><strong>Price:</strong> {web3.utils.fromWei(land.landPrice.toString(), 'ether')} ETH</li>
              </ul>
            </Col>
            <Col md={6}>
              <h6>Owner Information</h6>
              {owner ? (
                <ul className="list-unstyled">
                  <li><strong>Name:</strong> {owner.name}</li>
                  <li><strong>City:</strong> {owner.city}</li>
                  <li><strong>Address:</strong> {land.owner}</li>
                  <li>
                    <strong>Verification Status:</strong> {' '}
                    <Badge bg={owner.isUserVerified ? "success" : "warning"}>
                      {owner.isUserVerified ? "Verified" : "Pending"}
                    </Badge>
                  </li>
                </ul>
              ) : (
                <p>Loading owner details...</p>
              )}
            </Col>
          </Row>
          
          {land.document && (
            <div className="mt-3">
              <h6>Documents</h6>
              <a 
                href={`https://ipfs.io/ipfs/${land.document}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline-info btn-sm"
              >
                View Document on IPFS
              </a>
            </div>
          )}
          
          <div className="mt-4 d-flex justify-content-between">
            <Link to="/" className="btn btn-secondary">
              Back to All Lands
            </Link>
            
            {account === land.owner && land.isVerified && (
              <Link to={`/transfer-land/${land.landId}`} className="btn btn-primary">
                Transfer Ownership
              </Link>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LandDetails;