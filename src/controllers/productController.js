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




const getProducts= async function (req, res) {
  try {
      let obj = req.query
      let filter = { isDeleted: false }
      let { size, name, priceLessThan, priceGreaterThan, priceSort } = obj

      if(!obj){
      if (Object.keys(obj).length === 0) {
          return res.status(400).send({ status: false, message: "Please give some parameters." })
      }
  }
      if (Object.keys(obj).length != 0) {

          if (size) {
              if (!isValidAvailableSizes(size)) {
                  return res.status(400).send({ status: false, message: "Size is not valid" })
              }
              filter['availableSizes'] = { $in: size }
          }

          if (name) {
              filter['title'] = { $regex: name }  
          }

          if (priceLessThan) {
              if (!isValidPrice(priceLessThan)) {
                  return res.status(400).send({ status: false, message: "Price is not valid" })
              }
              filter['price'] = { $lt: priceLessThan }
          }

          if (priceGreaterThan) {
              if (!isValidPrice(priceGreaterThan)) {
                  return res.status(400).send({ status: false, message: "Not a valid Price" })
              }
              filter['price'] = { $gt: priceGreaterThan }
          }

          if (priceSort) {
              if (!(priceSort == 1 || priceSort == -1)) {
                  return res.status(400).send({ status: false, message: "Price can be sorted with the value 1 or -1 only" })
              }
          }
      }

      let productDetails = await productModel.find(filter).sort({ price: priceSort })
      if (productDetails.length === 0) {
          return res.status(404).send({ status: false, message: "no data found" })
      }
      return res.status(200).send({ status: true, message: 'Success', data: productDetails })


  } catch (error) {
      return res.status(500).send({ error: error.message })
  }
}




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

const productdelete=async function (req,res){
    try{
        let productid=req.params.productId
        if(!mongoose.isValidObjectId(productid)) return res.status(400).send({status:false,message:"please provide valid productid"})
    let findid=await productmodel.findOneAndUpdate({_id:productid,isDelete:false},{isDelete:true,Atdeleted:Date.now()})
    if(!findid) return res.status(400).send({status:false,message:"product already deleted"})
    res.status(200).send({status:true,message:"product successsfully deleted"})
}catch(error){
    res.status(500).send({status:false,message:error.message})
}
}

module.exports = { createProduct , getProductById ,getProducts,productdelete};