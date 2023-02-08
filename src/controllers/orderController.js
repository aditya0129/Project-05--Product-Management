const orderModel = require('../models/orderModel')
const cartModel = require('../models/cartModel')
const { isValidateStatus } = require("../validation/validator")


const createOrder = async function (req, res) {
    try {
      let userId = req.params.userId;
      if (!isValidObjectId(userId))
        return res
          .status(400)
          .send({ status: false, message: "Invalid User Id" });
      let userData = await userModel.findById(userId);
      if (!userData) {
        return res.status(404).send({ status: false, message: "User not found" });
      }
      let cartId = req.body.cartId;
      let status = req.body.status;
      if (!cartId)
        return res.status(400).send({ status: false, message: "Enter cartId" });
      const cart = await cartModel
        .findById(cartId)
        .populate({ path: "items.productId" })
        .lean();
      if (!cart)
        return res.status(404).send({ status: false, message: "Cart Not Found" });
      if (req.token.userId != cart.userId.toString())
        return res
          .status(403)
          .send({ status: false, message: "Unauthorised User" });
      if (cart.items.length == 0)
        return res.status(404).send({
          status: false,
          message: "Cart is empty. Please add Product to Cart.",
        });
      delete cart["_id"];
      let quantity = 0;
      for (let i = 0; i < cart.items.length; i++) {
        quantity += cart.items[i].quantity;
      }
      cart.totalQuantity = quantity;
      if (status) {
        if (!isValidStatus(status))
          return res
            .status(400)
            .send({ status: false, message: "invalid status" });
      }
      let order = await orderModel.create(cart);
      if (order) {
        let cartUpdate = await cartModel.findOneAndUpdate(
          { _id: cartId },
          { totalPrice: 0, totalItems: 0, items: [] },
          { new: true }
        );
      }
      return res
        .status(201)
        .send({ status: true, message: "Success", data: order });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };
  


  

const updateOrder=async function(req,res){
   try{
    
    let userId=req.params.userId
    let data=req.body
    let {orderId,status}=data

    if(!orderId) return res.status(400).send({status:false,message:"please enter orderId"})
    if(!isValidObjectId(orderId)) return res.status(400).send({status:false,message:"please enter valid oredrId"})

    if(!isValidateStatus(status)) return res.status(400).send({status:false,message:"Please enter existing status(i.e 'pending', 'completed', 'cancled' )"})

    let checkorder= await orderModel.findOne({_id:orderId,userId:userId})
    if(!checkorder) return res.status(400).send({status:false,message:"order does m=not not exits with this userId"})

    if(checkorder.status=="completed") res.status(200).send({status:true,Message:"Your Order have been placed"})
    if(checkorder.status=="cancelled") res.status(400).send({status:false,message:"your order Cancelled "})

    if(checkorder.cancellable==false && status == "cancelled")
    return res.status(400).send({status:false,message:"your order can't be cancelled"})

    let checkcard=await cartModel.findOne({userId:userId})
    if(!checkcard) return res.status(400).send({ status:false,message:"cart does not exit"})

    let orderupdate =await ordermodel.findByOneUpdate({_id:orderId,userId:userId},{status:status},{nes:true})

    return res.status(200).send({status:true,message:"succes",data:orderupdate})
 }catch(error){
    return res.status(500).send({status:false,message:error.message})
 }
}

module.exports = { createOrder , updateOrder };
