import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Web3 from 'web3';
import LandRegistrationContract from './contracts/LandRegistration.json';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Profile from './components/Profile';
import RegisterLand from './components/RegisterLand';
import TransferLand from './components/TransferLand';
import AdminPanel from './components/AdminPanel';
import LandDetails from './components/LandDetails';
import UserRegistration from './components/UserRegistration';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [isGovtAuthority, setIsGovtAuthority] = useState(false);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        // Modern dapp browsers
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            setWeb3(web3Instance);
            
            // Get accounts
            const accounts = await web3Instance.eth.getAccounts();
            setAccounts(accounts);
            
            // Get the contract instance
            const networkId = await web3Instance.eth.net.getId();
            const deployedNetwork = LandRegistrationContract.networks[networkId];
            
            if (!deployedNetwork) {
              console.error("Contract not deployed on the detected network");
              alert("Please connect to the correct Ethereum network");
              setLoading(false);
              return;
            }
            
            const instance = new web3Instance.eth.Contract(
              LandRegistrationContract.abi,
              deployedNetwork && deployedNetwork.address,
            );
            
            setContract(instance);
            
            // Check if current user is govt authority
            const govtAuthority = await instance.methods.govtAuthority().call();
            setIsGovtAuthority(accounts[0].toLowerCase() === govtAuthority.toLowerCase());
            
            // Check if user is verified
            if (accounts[0]) {
              try {
                const user = await instance.methods.users(accounts[0]).call();
                setIsUserVerified(user.isUserVerified);
              } catch (error) {
                console.error("Error checking user verification:", error);
              }
            }
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
              setAccounts(accounts);
              window.location.reload();
            });
            
            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
              window.location.reload();
            });
            
          } catch (error) {
            console.error("User denied account access");
          }
        }
        // Legacy dapp browsers
        else if (window.web3) {
          const web3Instance = new Web3(window.web3.currentProvider);
          setWeb3(web3Instance);
          // Similar steps as above...
        }
        // Non-dapp browsers
        else {
          console.log('Non-Ethereum browser detected. Consider installing MetaMask!');
          alert("Please install MetaMask to use this application");
        }
      } catch (error) {
        console.error("Error initializing Web3:", error);
        alert("Error connecting to blockchain. Please check console for details.");
      }
      
      setLoading(false);
    };

    initWeb3();
  }, []);

  if (loading) {
    return <div className="loading">Loading blockchain data...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar 
          account={accounts[0]} 
          isGovtAuthority={isGovtAuthority} 
          isUserVerified={isUserVerified} 
        />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home 
              web3={web3} 
              contract={contract} 
              account={accounts[0]} 
            />} />
            <Route path="/profile" element={<Profile 
              web3={web3} 
              contract={contract} 
              account={accounts[0]} 
              isUserVerified={isUserVerified}
            />} />
            <Route path="/register-land" element={
              isUserVerified ? 
                <RegisterLand 
                  web3={web3} 
                  contract={contract} 
                  account={accounts[0]} 
                /> : 
                <Navigate to="/profile" />
            } />
            <Route path="/transfer-land/:id" element={
              isUserVerified ? 
                <TransferLand 
                  web3={web3} 
                  contract={contract} 
                  account={accounts[0]} 
                /> : 
                <Navigate to="/profile" />
            } />
            <Route path="/admin" element={
              isGovtAuthority ? 
                <AdminPanel 
                  web3={web3} 
                  contract={contract} 
                  account={accounts[0]} 
                /> : 
                <Navigate to="/" />
            } />
            <Route path="/land/:id" element={<LandDetails 
              web3={web3} 
              contract={contract} 
              account={accounts[0]} 
            />} />
            <Route path="/register-user" element={<UserRegistration 
              web3={web3} 
              contract={contract} 
              account={accounts[0]} 
            />} />
          </Routes>
        </div>
        <footer className="mt-5 py-3 text-center">
          <p>© 2025 Blockchain Land Registry System | All Rights Reserved</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;