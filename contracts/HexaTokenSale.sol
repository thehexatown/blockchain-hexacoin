pragma solidity ^0.8.9;

import "./HexaToken.sol";

contract HexaTokenSale {
    address admin;
    HexaToken public tokenContract;
    uint public tokenPrice;
    uint public tokensSold;

    event Sell(address _buyer, uint _amount);

      constructor (HexaToken _tokenContract, uint _tokenPrice) {
          admin = msg.sender;
          tokenContract = _tokenContract;
          tokenPrice = _tokenPrice;
    }

    //multiply
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y==0 || (z = x * y)/ y==x);
    }


    function buyTokens(uint _numberOfTokens) public payable {
        // Require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // Require that the contract has enough tokens
        // (this) here shows the balance of this contract HexaTokenSale
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // Require that a transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        // Keep track of tokensSold
        tokensSold += _numberOfTokens; 

        // Trigger Sell Event
        emit Sell(msg.sender, _numberOfTokens);
    }

    //End Token Sale
    function endSale() public {
        // Require admin
        require(msg.sender == admin);
        //Transfer remanining hexa tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        //Destroy contract
       selfdestruct(payable(admin));
    }
}