const stripe = require("stripe")("sk_test_51ImtoZSGJH9SquyNaasz2nr7OdqC9u7ZuWqxHHeIoq2uuUlbV0QxjjR2i8Az0KhQ2zI7mWH6IxoEISCLV3CVUvU900RMVNUslB");
const uuid = require("uuid/v4");

exports.makepayment = (req, res) => {
    const { products, token } = req.body;
    console.log("PRODUCTS ", products)
    let amount = 0;
    products.map(p => {
        amount = amount + p.price;
    });

    const idempotencyKey = uuid();

    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then(customer => {
        stripe.charges.create({
            amount: amount,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description:"a test account",
            shipping: {
                name: token.card.name,
                address: {
                    line1: token.card.address_line1,
                    line2: token.card.address_line2,
                    city: token.card.address_city,
                    country: token.card.address_country,
                    postal_code:token.card.address_zip
                }
            }
        }, { idempotencyKey })
            .then(result => res.status(200).json(result))
            .catch(err => console.log(err))
    });
    
};