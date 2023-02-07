const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const { isValidObjectId } = require("mongoose");






const createCart = async function (  req , res ) {
  try {
    let userId = req.params.userId;

    if( !isValidObjectId( userId ) ) {
      return res.status(400).send({ status : false , message : "UserId is invalid , please provide valid userId."})
    }

    let checkUserId = await userModel.findOne(
      { _id : userId , isDeleted : false })

      if( !checkUserId ) {
        return res.status(404).send({ status : false , message : " This user is not exsit or it might be deleted."})
      }

    let data = req.body;
    let { cartId , productId } = data;

    let createdData = {}

    if ( cartId ) {

      if ( !isValidObjectId( cartId ) ) {
        return res.status(400).send({ status: false, message: "Please provide a Valid CartId" })
      }

      let checkCart = await cartModel.findOne({ _id : cartId, userId : userId });

      if ( !checkCart ) {
        // take some ceentals for create a cart

        let createCart = await cartModel.create(
          {
            userId : userId ,
            items : [{
              productId : productId,
              quantity : 1
            }] , 
            totalItems : 1 ,
            totalPrice : productId.price *items.quantity
        });
      }
      createData.cartId = createCart
    }else{
      return res.status(400).sedn({ status : false , message: " Please provide CartId."})
    }

    if( productId ){

        if ( !isValidObjectId(productId) ) {
          return res.status(400).send({ status : false,
              message: "Please provide a Valid product ID!",
            })
          };
           
      let product = await productModel.findOne(
        { _id: productId , isDeleted: false }); 

      if ( !product ) {
        return res.status(400).send({ status: false , message: "Product does not  Exists" })
      };
  
    }else{
      return res.status(400).send({ status : false , message : " Please provide productId."})
    }
  }



   catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};





const getCart = async function (req, res) {
  try {
      let userId = req.params.userId;
      if (userId) {
          if (!isValidObjectIds(userId))
              return res.status(400).send({ status: false, msg: "wrong userId" });
      }
      let checkUserId = await userModel.findOne({ _id: userId });
      if (!checkUserId) {
          return res.status(404).send({ status: false, message: "no user details found" });
      }

      let getData = await cartModel.findOne({ userId });
      if (getData.items.length == 0)
          return res.status(400).send({ status: false, message: "items details not found" });

      if (!getData) {
          return res.status(404).send({ status: false, message: "cart not found" });
      }
      res.status(200).send({ status: true, message: "cart successfully", data: getData });
  } catch (err) {
      return res.status(500).send({ status: false, msg: err.message })
  }
}






const updatedCart = async function ( req , res ) {
  try{
    let userId = req.param.userId

    if( !isValidObjectId (userId) ) {
      return res.status(400).send({ status :false , message : "Please provide valid user id."})
    }

    let checkUserId = await userModel.findOne(
      { _id :userId , isDeleted : false })

    if( !checkUserId ) {
      return res.status(404).send({ status : false , message : "This userID does not exsit in your database , check your Id." })
    }

    let body = req.body
    let { cartId , productId , removeProduct } = body

    if( Object.keys( body ).length == 0 ) {
      return res.status(400).send9({ status : false , message : "You can not update empty body,please provide required credentals."})
    }

    let updatedCart = {}

    updatedCart.userId = userId;

    if( cartId ) {

      if( !isValidObjectId (cartId.trim()) ) {
        return res.status(400).send({ status :false , message : "Please provide valid cart id."})
      }
      
    let checkcartId = await cartModel.findById(cartId)

    if( !checkcartId ) {
      return res.status(404).send({ status : false , message : "This cartID does not exsit in your database , check your Id." })
    }
    updatedCart.cartId = checkcartId
    }

    if( productId ) {
      
      if( !isValidObjectId (productId.trim()) ) {
        return res.status(400).send({ status :false , message : "Please provide valid product id."})
      }
      
    let checkproductId = await productModel.findOne({ _id : productId , isDeleted : false })

    if( !checkproductId ) {
      return res.status(404).send({ status : false , message : "This productID does not exsit in your database , it migth be deleted." })
    }
    }

    if( removeProduct ) {

      if( { removeProduct : 0 }) {

        let deleteProduct = await productModel.findOneAndUpdate(
          { _id : productId , isDeleted : false } ,
          { isDeleted : true } )
    }

    if( { removeProduct : 1 }) {

      let decreaseProduct = await productModel.findOneAndUpdate(
        { _id : productId , isDeleted : false } ,
        { isDeleted : true } , 
        { new : true })

        await cartModel.findOneAndUpdate(
          { _id : productId } , 
          { $inc : { quantity : -1 }} ,
          { new : true }
        )
        
      }
      updatedCart.items = ({ removeProduct : 1 })
  }
  
  return res.status(200).send({ status : true , message : "Success." , data : updatedCart })

  }catch( error ) {
    return res.status(500).send({ status : false , message : error.message })
  }
}


const deleteCart=async function(req,res){
    
  try{
      let id=req.pramas.userId
  if(!id)  return res.status(400).send({status:false,message:"please provide userid in the params"})
  if(isvalidonjectId(id)) return res.status(400).send({status:false,message:"please provide valid id "})
  let cartdelete=await cartmodel.findOneAndUpdat({userId:id},{$set:{items:[], totalprice:0,totalitem:0},},{new:true})
  if(!cartdelete) return res.status(400).send({status:false,message:"this cart is does not exit in data"})
  res.status(200).send({status:true,data:cartdelete})
}catch(error){
  res.status(500).send({status:false,message:error.message})
}

}


module.exports = { createCart , getCart , updatedCart ,deleteCart };
