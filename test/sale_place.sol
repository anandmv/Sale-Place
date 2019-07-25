pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SalePlace.sol";

contract TestSalePlace {

    address public owner;
    address baseAddress = DeployedAddresses.SalePlace();
    SalePlace salePlace = SalePlace(baseAddress);

    constructor() public{
        // ---- Initialize owner ----
        owner = msg.sender;
    }

    /** @dev Test ownership */ 
    function testOwernshipOfDeployedContract() public {
        Assert.equal(salePlace.owner(), owner, "Contract owner is not expected owner");
    }

    /** @dev Test Pause/Unpause functionality */
    function testInitialPauseOfDeployedContract() public {
        bool _state = false;
        Assert.equal(salePlace.paused(), _state, "Contract state expected to be unpaused");
    }
}