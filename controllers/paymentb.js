const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "ys5kcf74423vgcf4",
  publicKey: "kccdz2pmzhd8dk9d",
  privateKey: "6e96aa4555b6af6eb4006a5380f79c68"
});

exports.getToken = (req, res) => {
  gateway.clientToken.generate({}, (err, response) => {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json(response);
      }
    });
  };
  
  exports.processPayment = (req, res) => {
    let nonceFromTheClient = req.body.paymentMethodNonce;
  
    let amountFromTheClient = req.body.amount;
    gateway.transaction.sale(
      {
        amount: amountFromTheClient,
        paymentMethodNonce: nonceFromTheClient,
  
        options: {
          submitForSettlement: true
        }
      },
      (err, result) =>{
        if (err) {
          res.status(500).json(error);
        } else {
          res.json(result);
        }
      }
    );
  };
  