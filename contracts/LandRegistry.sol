// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandRegistry {
    struct Land {
        uint landId;
        string location;
        address owner;
        bool isRegistered;
    }

    mapping(uint => Land) public lands;
    uint public landCount;

    event LandRegistered(uint landId, address owner);
    event LandTransferred(uint landId, address from, address to);

    function registerLand(uint _landId, string memory _location) public {
        require(!lands[_landId].isRegistered, "Land already registered");
        lands[_landId] = Land(_landId, _location, msg.sender, true);
        landCount++;
        emit LandRegistered(_landId, msg.sender);
    }

    function transferLand(uint _landId, address _newOwner) public {
        require(lands[_landId].isRegistered, "Land not registered");
        require(lands[_landId].owner == msg.sender, "Only owner can transfer");
        lands[_landId].owner = _newOwner;
        emit LandTransferred(_landId, msg.sender, _newOwner);
    }

    function getLand(uint _landId) public view returns (Land memory) {
        return lands[_landId];
    }
}