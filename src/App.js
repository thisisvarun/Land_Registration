import { ethers } from "ethers";
import { useState, useEffect } from "react";
import LandRegistryABI from "./LandRegistry.json";
import './App.css';

const contractAddress = "0xbF836078194Be6797502dbcC85313198379988BF"; // Update if redeployed

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [land, setLand] = useState(null);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAccount = await signer.getAddress();
        setAccount(userAccount);

        const landContract = new ethers.Contract(
          contractAddress,
          LandRegistryABI.abi,
          signer
        );
        setContract(landContract);
      } else {
        alert("Please install MetaMask to use this DApp!");
      }
    };
    loadBlockchainData();
  }, []);

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const registerLand = async () => {
    try {
      const landId = document.getElementById("landId").value;
      const location = document.getElementById("location").value;
      const tx = await contract.registerLand(landId, location);
      await tx.wait();
      alert("Land registered successfully!");
    } catch (error) {
      console.error("Error registering land:", error);
      alert("Failed to register land. Check console for details.");
    }
  };

  const transferLand = async () => {
    try {
      const landId = document.getElementById("transferLandId").value;
      const newOwner = document.getElementById("newOwner").value;
      const tx = await contract.transferLand(landId, newOwner);
      await tx.wait();
      alert("Land transferred successfully!");
    } catch (error) {
      console.error("Error transferring land:", error);
      alert("Failed to transfer land. Check console for details.");
    }
  };

  const getLandDetails = async () => {
    try {
      const landId = document.getElementById("viewLandId").value;
      const landData = await contract.getLand(landId);
      setLand({
        landId: landData.landId.toString(),
        location: landData.location,
        owner: landData.owner,
        isRegistered: landData.isRegistered,
      });
    } catch (error) {
      console.error("Error fetching land details:", error);
      alert("Failed to fetch land details. Check console for details.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Land Registration DApp</h1>
        <p>Connected Account: {account || "Not connected"}</p>
        {!account && (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}

        <h2>Register Land</h2>
        <input id="landId" type="number" placeholder="Land ID" />
        <input id="location" type="text" placeholder="Location" />
        <button onClick={registerLand}>Register</button>

        <h2>Transfer Land</h2>
        <input id="transferLandId" type="number" placeholder="Land ID" />
        <input id="newOwner" type="text" placeholder="New Owner Address" />
        <button onClick={transferLand}>Transfer</button>

        <h2>View Land Details</h2>
        <input id="viewLandId" type="number" placeholder="Land ID" />
        <button onClick={getLandDetails}>View</button>
        {land && (
          <div>
            <p>Land ID: {land.landId}</p>
            <p>Location: {land.location}</p>
            <p>Owner: {land.owner}</p>
            <p>Registered: {land.isRegistered ? "Yes" : "No"}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;