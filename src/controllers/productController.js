const productModel = require("../models/productModel");
const mongoose = require("mongoose");

let createProduct = async function (req, res) {
  try {

    let savedProduct = await productModel.create(data);

    return res
      .status(201)
      .send({ status: true, message: "Success", data: savedProduct });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};




const getProductById = async function (req, res){

  try {

      let productId = req.params.productId

      if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: `Please Enter Valid ProductId: ${productId}.` })

     

      let getProduct = await productModel.findOne({ _id: productId, isDeleted: false })  

      if (!getProduct) return res.status(404).send({ status: false, message: "Product Data is Not Found!" })

      return res.status(200).send({ status: true, message: "Success", data: getProduct })

  } catch (error) {

      return res.status(500).send({ status: false, message: error.message })
  }
}

module.exports = { createProduct , getProductById };