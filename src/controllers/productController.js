const productModel = require("../models/productModel");
const {isValidObjectId} = require("mongoose");
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

      // valid size

     const isValidateSize = function (value)  { 
      return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(value) !== -1 
    }
    
    if (availableSizes) {
      let size = availableSizes.toUpperCase().split(",")
      data.availableSizes = size;


      for (let i = 0; i < size.length; i++) {
        if (!isValidateSize(size[i])) {
          return res.status(400).send({ status: false, message: `${size[i]} size is not available` })
        }
      }
    }

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
              if (!["S", "XS","M","X", "L","XXL", "XL"].includes(size)) {
                  return res.status(400).send({ status: false, message: "Size is not valid" })
              }
              filter['availableSizes'] = { $in: size }
          }

          if (name) {
              filter['title'] = { $regex: name }  
          }

          if (priceLessThan) {
              if (!validatePrice(priceLessThan)) {
                  return res.status(400).send({ status: false, message: "Price is not valid" })
              }
              filter['price'] = { $lt: priceLessThan }
          }

          if (priceGreaterThan) {
              if (!validatePrice(priceGreaterThan)) {
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

      if (!isValidObjectId(productId)) return res.status(404).send({ status: false, message: `Please Enter Valid ProductId: ${productId}.` })

     

      let getProduct = await productModel.findOne({ _id: productId, isDeleted: false })  

      if (!getProduct) return res.status(404).send({ status: false, message: "Product data not found , it might be deleted." })

      return res.status(200).send({ status: true, message: "Success", data: getProduct })

  } catch (error) {

      return res.status(500).send({ status: false, message: error.message })
  }
}
   


//===========================================                     =============================================//
//                                            Update Product Data
//===========================================                     =============================================//


const updateProduct = async function ( req , res ) {
  try{ 
    let productId = req.params.productId;

    if (!isValidObjectId(productId))
        return res
            .status(404)
            .send({ status: false, message: "Product Id is invalid." });

    let getproductId = await productModel.findOne({ _id: productId });
    if (!getproductId)
        return res.status(404).send({ status: false, message: "Product Id not found." });

    let data = req.body
    
    let files = req.files
    
    let { title , description , price , isFreeShipping , style , availableSizes , installments } = data


    if (Object.keys(data).length == 0 && (!files || files.length == 0))
        return res
            .status(400)
            .send({ status: false, message: "At least one field is mendatory." });

    let updatedData = {}
    if (title) {
      if(!validateName(title)){
          return res.status(400).send({ status: false, message: "Product title must be string." });
     }
      if ( !title ) {
          return res.status(400).send({ status: false, message: "Product title can not be empty." });
      }
      let checkTitle = await productModel.findOne({ title : title })
      if (checkTitle) {
          return res.status(400).send({ status: false, message: "This product title is already used ,please provide another product title." })    
      }    
      title = title.trim();
      updatedData.title = title;
  }
  if (description) {
  //   if(!validateName(description)){
  //       return res.status(400).send({ status: false, message: "Product description must be string." });
  //  }
    if (!description.trim()) {
        return res.status(400).send({ status: false, message: "Product description can not be empty." });
    }
    description = description.trim();
    updatedData.description = description;
  }
  if (price) {
      if(!validatePrice(price)){
          return res.status(400).send({ status: false, message: "Product price must be number." });
     }
      if (!price.trim()) {
          return res.status(400).send({ status: false, message: "Product price can not be empty." });
      }
      price = price.trim();
      updatedData.price = price;
    } 

    
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

        if (!isFreeShipping.trim()) {
            return res.status(400).send({ status: false, message: "Product is free shipping can not be empty." });
        }
        isFreeShipping = isFreeShipping.trim();
        updatedData.isFreeShipping = isFreeShipping;
      
      if (style) {
      //   if(!validateName(style)){
      //       return res.status(400).send({ status: false, message: "Product style must be number." });
      //  }
        if (!style) {
            return res.status(400).send({ status: false, message: "Product style can not be empty." });
        }
        updatedData.style = style;
      } 
      if (availableSizes) {
        if(!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes)){
            return res.status(400).send({ status: false, message: `Product sizes must be from these["S", "XS", "M", "X", "L", "XXL", "XL"].` });
       }
        if (!availableSizes.trim()) {
            return res.status(400).send({ status: false, message: "Product sizes can not be empty." });
        }
        availableSizes = availableSizes.trim();
        updatedData.availableSizes = availableSizes;
      } 
      if (installments) {
          if(!validatePincode(installments)){
              return res.status(400).send({ status: false, message: "Product installments must be number." });
         }
          if (!installments.trim()) {
              return res.status(400).send({ status: false, message: "Product installments can not be empty." });
          }
          installments = installments.trim();
          updatedData.installments = installments;
        } 
        updatedData.deletedAt = Date.now()
   
        let updatedProductData = await productModel.findOneAndUpdate(
          { _id :productId , isDeleted : false },
          updatedData , 
          { new :true })

          if( !updatedProductData ) {
            return res.status(404).send({ status : false , message : "Product is not exist either it is deleted."})
          }
          return res.status(200).send({ status : true , message : "Success" , data : updatedProductData})
  }catch( error ) {
    return res.status(500).send({ status : false , message : error.message })
  }
}



const deleteProduct=async function (req,res){
    try{
        let productId=req.params.productId 

        if(!isValidObjectId(productId)){
           return res.status(404).send({status:false,message:"please provide valid productid"})
        }

    let checkProductId = await productModel.findOneAndUpdate(
      {_id:productId , isDelete:false},
      {isDelete:true , deletedAt:Date.now()})

    if(checkProductId){
         return res.status(404).send({ status : false , message :" Product already deleted."})
    }
    return res.status(200).send({ status : true , message :"Product successsfully deleted."})
}catch(error){
    return res.status(500).send({ status : false , message : error.message })
}
}

module.exports = { createProduct , getProductById ,getProducts,updateProduct,deleteProduct};