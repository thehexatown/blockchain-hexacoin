const HexaToken = artifacts.require("./HexaToken.sol");
const HexaTokenSale = artifacts.require("./HexaTokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(HexaToken, 1000000).then(function () {
    // Token Price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(HexaTokenSale, HexaToken.address, tokenPrice);
  });
};
