App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  loading: false,
  tokenPrice: 1000000000000000,
  tokenSold: 0,
  tokensAvailable: 750000,

  init: function () {
    console.log("App initialized...");
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== "undefined") {
      //If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      //Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function () {
    $.getJSON("HexaTokenSale.json", function (hexaTokenSale) {
      App.contracts.HexaTokenSale = TruffleContract(hexaTokenSale);
      App.contracts.HexaTokenSale.setProvider(App.web3Provider);
      App.contracts.HexaTokenSale.deployed().then(function (hexaTokenSale) {
        console.log("Token Sale Address", hexaTokenSale.address);
      });
    }).done(function () {
      $.getJSON("HexaToken.json", function (hexaToken) {
        App.contracts.HexaToken = TruffleContract(hexaToken);
        App.contracts.HexaToken.setProvider(App.web3Provider);
        App.contracts.HexaToken.deployed().then(function (hexaToken) {
          console.log("Token Address", hexaToken.address);
        });
        App.listenForEvents();
         return App.render();
      });
    });
  },

  listenForEvents: function() {
    App.contracts.HexaTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: "latest"
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  buyTokens: function () {
    $("#content").hide();
    $("#loader").show();
    var numberOfToken = $("#numberOfTokens").val();
    App.contracts.HexaTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfToken, {
        from: App.account,
        value: numberOfToken * App.tokenPrice,
        gas: 500000
      })
    }).then(function(result) {
      console.log("tokens bougth.....")
      $("form").trigger("reset")
      // $("#loader").hide();
      // $("#content").show();
    })
  },

  render: function () {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load token sale contract
    App.contracts.HexaTokenSale.deployed()
      .then(function (instance) {
        HexaTokenSaleInstance = instance;
        return HexaTokenSaleInstance.tokenPrice();
      })
      .then(function (tokenPrice) {
        App.tokenPrice = tokenPrice;
        $(".token-price").html(web3.fromWei(App.tokenPrice, "ether").toNumber());
        return HexaTokenSaleInstance.tokensSold();
      }).then(function(tokenSold) {
        App.tokenSold = tokenSold.toNumber();
        $(".tokens-sold").html(App.tokenSold);
        $(".tokens-available").html(App.tokensAvailable);

        var progressPercent = ((App.tokenSold / App.tokensAvailable) * 100);
        $("#progress").css("width", progressPercent + "%");

        // Load token contract
        App.contracts.HexaToken.deployed().then(function(instance) {
          HexaTokenInstance = instance;
          return HexaTokenInstance.balanceOf(App.account)
        }).then(function(balance) {
          $(".hexa-balance").html(balance.toNumber());

          App.loading = false;
          loader.hide();
          content.show();
        })
      })
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
