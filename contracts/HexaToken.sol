pragma solidity ^0.8.9;

contract HexaToken {
string public name = "HexaToken";
string public symbol = "HEXA";
string public standard = "HEXA Token v1.0";
uint public totalSupply;

event Transfer(
    address indexed _from,
    address indexed _to,
    uint _value
);

event Approval(
    address indexed _owner,
    address indexed _spender,
    uint _value
);

mapping(address => uint256) public balanceOf;
mapping(address => mapping(address => uint)) public allowance;

    constructor (uint _initialSupply) {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint _value) public returns (bool success) {
       //// if balanceOf(sender) is grater than the value
       require(balanceOf[msg.sender] >= _value);

      ////deducts balance from sender
       balanceOf[msg.sender] -= _value;
      ///add balance to the person transfer is initialized
       balanceOf[_to] += _value;

       emit Transfer(msg.sender, _to, _value);

       return true;
    }


    function approve(address _spender, uint _value) public returns (bool success) {

        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        //Change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }
}