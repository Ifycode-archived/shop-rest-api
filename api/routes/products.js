const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
    .exec()
    .then(docs => {
        console.log(docs);
        console.log('Docs length: ', docs.length);
        res.status(200).json(docs);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Handling POST requests to /products',
            createdProduct: result
        });
    })
    .catch(err => {
        console.log('Show this error: ', err);
        res.status(500).json({
            error: err
        });
    });
});


router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .exec()
    .then(doc => {
        console.log('From database: ', doc);
        if (doc) {
            res.status(200).json(doc);
        }else {
            res.status(404).json({
                message: 'No valid entry found for the ID provided'
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

//Note: patch is for changing/updating data in the database
router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for  (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({_id: id}, { $set: updateOps })
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });

    /* how it looked like before using loop to check
        what property you'd like to change
    Product.updateOne({_id: id}, { $set: {
            name: req.body.newName,
            price: req.body.newPrice
        } 
    });*/
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({_id: id})
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

module.exports = router;


/*
.reomove() is depreciated though it still works

methods you can use now:
.deleteOne(), .findByIdAndDelete() etc.
*/


/*
I think what caused the return of more than one objects 
in the document is because the the number of items in the 
overall object/documents increases each time i use POST to
add something.

I used this to delete all objects with this particular name
in postman using a delete request on localhost:3000/products/

router.delete('/', (req, res, next) => {
    Product.deleteMany({"name": "My product's name"})
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});
*/