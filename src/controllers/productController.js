const productModel = require("../models/productModel");
const mongoose = require("mongoose");
const uploadFile= require('../AWS/awsConfig')
const { validateName, validateEmail, validatePassword, validateMobileNo, validatePincode, validatePlace,validatePrice,ValidateStyle,ValidateFile,validateShipping  } = require("../validation/validator");

let createProduct = async function (req, res) {
    try {
      let data = req.body;
  
      if (Object.keys(data).length == 0) {
        return res
          .status(400)
          .send({
            status: "false",
            message: "Please enter the data in request body",
          });
      }
  
      let {
        title,
        description,
        price,
        currencyId,
        currencyFormat,
        isFreeShipping,
        style,
        availableSizes,
        installments,
        productImage,
      } = data;
      // Title valid..
      if (!title || title == "") {
        return res
          .status(400)
          .send({
            status: false,
            message: "Title is mandatory and title Should not be Empty",
          });
      }
  
      if (!validateName(title.trim())) {
        return res
          .status(400)
          .send({ status: false, message: " Invalid Title " });
      }
      const checkTitle = await productModel.findOne({ title });
      if (checkTitle) {
        return res
          .status(400)
          .send({
            status: false,
            message: "This title already exist, provide a new title",
          });
      }
      //description valid
      if (!description || description == "") {
        return res
          .status(400)
          .send({
            status: false,
            message:
              "Description is mandatory and description Should not be Empty",
          });
      }
  
      if (!validateName(description.trim())) {
        return res
          .status(400)
          .send({ status: false, message: " Invalid description " });
      }
      // price valid..
      if (!price) {
        return res
          .status(400)
          .send({ status: false, message: "Price is mandatory " });
      }
  
      if (!validatePrice(price.trim())) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Price is not present in correct format",
          });
      }
      // currencyId valid..
      if (!currencyId) {
        return res
          .status(400)
          .send({ status: false, message: "Currency Id is mandatory " });
      }
  
      if (currencyId.trim() != "INR") {
        return res
          .status(400)
          .send({
            status: false,
            msg: " Please provide the currencyId as INR ",
          });
      }
      // currencyFormat valid..
      if (!currencyFormat) {
        return res
          .status(400)
          .send({ status: false, message: "Currency Format is mandatory " });
      }
  
      if (currencyFormat.trim() != "₹") {
        return res
          .status(400)
          .send({
            status: false,
            message: "Please provide the currencyformat as `₹` ",
          });
      }
      // isFreeShipping valid..
     
      if (isFreeShipping) {
        
        if (!(isFreeShipping.trim() == "true" || isFreeShipping.trim() == "false" )) {
          return res
            .status(400)
            .send({
              status: false,
              message: "isFreeShipping should either be True, or False.",
            });
        }
      }
  
      // files valid..
      let files = req.files
      if (files && files.length > 0) {
        if (!ValidateFile(files[0].originalname))
          return res
            .status(400)
            .send({ status: false, message: `Enter format jpeg/jpg/png only.` });
  
        let uploadedFileURL = await uploadFile.uploadFile(files[0]);
        data.productImage = uploadedFileURL;
      } else {
        return res.status(400).send({ message: "Files are required " });
      }
      // style valid..
      if (!ValidateStyle(style.trim())) {
        return res
          .status(400)
          .send({ status: false, message: "Style is not in correct format" });
      }
      let availableSizesEnum = productModel.schema.obj.availableSizes.enum;
      if (!availableSizesEnum.includes(data.availableSizes.trim()))
        return res
          .status(400)
          .send({ status: false, msg: "availableSizes should be [S, XS, M, X, L, XXL, XL]" });
  
      // installements valid..
      if (installments) {
        if (!(installments.trim() || typeof installments.trim() == Number)) {
          return res
            .status(400)
            .send({
              status: false,
              message: "Installments should be in correct format",
            });
        }
      }
  
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