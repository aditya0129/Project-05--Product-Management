const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");

const createCart = async function (req, res) {
  try {
    let data = req.body
    let userId = req.params.userId
    let {cartId, productId} =data

    let saveCart = await cartModel.findOne({_id:cartId,_id:userId})
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {createCart}