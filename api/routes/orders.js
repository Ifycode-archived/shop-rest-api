const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find()
    .select('product quantity _id')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: `http://localhost:3000/orders/${doc._id}`
                    }
                }
            })
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        if(product) {
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save()
        }
    })
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Order stored',
            createdOrder: {
                _id: result.id,
                product: result.product,
                quantity: result.quantity
            },
            request: {
                type: 'GET',
                url: `http://localhost:3000/orders/${result._id}`
            }
        });
    })
    .catch(err => {
        res.status(404).json({
            message: 'Product not found'
            //error: err
        });
        console.log(err);
    });
});

router.delete('/', (req, res, next) => {
    Order.deleteMany({"quantity": "1"})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Many Orders deleted',
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});


router.get('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
    .select('product quantity _id')
    .exec()
    .then(order => { 
        if (!order) {
            return res.status(404).json({
                message: 'Order not found: some digits in a correct ID may have been changed',
            });
        }
        
        res.status(200).json({
            order: order,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders/'
            }
        });
    })
    .catch((err) => {
        err.reason = 'Number of digits in ID maybe incomplete or more than the usual';
        res.status(500).json({
            message: 'Invalid Id',
            error: err
        });
    });
});


router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;

    Order.deleteOne({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Order deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/orders/',
                body: {
                    productId: 'ID',
                    quantity: 'Number'
                }
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;

//Order.deleteMany({"quantity": "1"})


/*

calling res.status() more than once in the .then() 
methodss caused this error in the console:

UnhandledPromiseRejectionWarning: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client


router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        if(!product) {
            res.status(404).json({
                message: 'Product not found',
            });
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });
        return order.save() 
    })
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Order stored',
            createdOrder: {
                _id: result.id,
                product: result.product,
                quantity: result.quantity
            },
            request: {
                type: 'GET',
                url: `http://localhost:3000/orders${result._id}`
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            message: 'Product not found',
            error: err
        });
        console.log(err);
    });
});
*/
