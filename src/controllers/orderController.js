const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel")
const { isValidObjectId } = require("mongoose");

const createOrder = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body
    let {cartId,cancellable} = data

    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid User Id" });

    let userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).send({ status: false, message: "User Not Found" });
    }
    
    if(cancellable !== "true" && cancellable !== "false"){
      return res.status(400).send({ status: false, message: "cancellable data always either true or false" });
    }

    if (!cartId)
      return res.status(400).send({ status: false, message: "Enter cartId" });

    const cart = await cartModel.findById(cartId);

    if (!cart)
      return res.status(404).send({ status: false, message: "Cart Not Found" });

    if (req.token.userId != cart.userId.toString())
      return res
        .status(403)
        .send({ status: false, message: "Unauthorised User" });

let {items,totalPrice,totalItems} = cart

    if (items.length == 0)
      return res.status(404).send({
        status: false,
        message: "Cart is empty. Please add Product to Cart.",
      });

    let totalQuantity = 0;

    for (let i = 0; i < items.length; i++) {
      totalQuantity += items[i].quantity;
    }
    data.userId = userId
    data.items = items
    data.totalPrice= totalPrice
    data.totalItems= totalItems
    data.totalQuantity = totalQuantity;
    


  

    let order = await orderModel.create(data);

    if (order) {
      let cartUpdate = await cartModel.findOneAndUpdate(
        { _id: cartId },
        { totalPrice: 0, totalItems: 0, items: [] },
        { new: true }
      );
    }

    return res
      .status(200)
      .send({ status: true, message: "Success", data: order });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// const updateOrder = async function (req, res) {
//   try {
//     let userId = req.params.userId;
//     let data = req.body;
//     let { orderId, status } = data;

//     if (!orderId)
//       return res
//         .status(400)
//         .send({ status: false, message: "please enter orderId" });
//     if (!isValidObjectId(orderId))
//       return res
//         .status(400)
//         .send({ status: false, message: "please enter valid oredrId" });

//     if (!isValidateStatus(status))
//       return res.status(400).send({
//         status: false,
//         message:
//           "Please enter existing status(i.e 'pending', 'completed', 'cancled' )",
//       });

//     let checkorder = await orderModel.findOne({ _id: orderId, userId: userId });
//     if (!checkorder)
//       return res.status(400).send({
//         status: false,
//         message: "order does m=not not exits with this userId",
//       });

//     if (checkorder.status == "completed")
//       res
//         .status(200)
//         .send({ status: true, Message: "Your Order have been placed" });
//     if (checkorder.status == "cancelled")
//       res.status(400).send({ status: false, message: "your order Cancelled " });

//     if (checkorder.cancellable == false && status == "cancelled")
//       return res
//         .status(400)
//         .send({ status: false, message: "your order can't be cancelled" });

//     let checkcard = await cartModel.findOne({ userId: userId });
//     if (!checkcard)
//       return res
//         .status(400)
//         .send({ status: false, message: "cart does not exit" });

//     let orderupdate = await ordermodel.findByOneUpdate(
//       { _id: orderId, userId: userId },
//       { status: status },
//       { nes: true }
//     );

//     return res
//       .status(200)
//       .send({ status: true, message: "succes", data: orderupdate });
//   } catch (error) {
//     return res.status(500).send({ status: false, message: error.message });
//   }
// };



const updateOrder = async function(req,res){
  try{

      let userId=req.params.userId
      let data=req.body
      let {orderId,status}=data

      if(!isValidObjectId(orderId))return res.status(400).send({status:false,message:'Please enter a valid order id'})
      if(!isValidStatus(status.trim()))return res.status(400).send({status:false,message:'Please enter a valid status'})

      let order=await orderModel.findById(orderId)

      if(!order)return res.status(400).send({status:false,message:"can't find any order with this order Id"})
      if(order.userId!=userId)return res.status(404).send({status:false,message:"This order doesn't belongs to this user"})
      if(order.status==status)return res.status(400).send({status:false,message:`the order is already in ${status} condition`})

      if(order.cancellable == false){
      if(data.status.trim() =="canceled")return res.status(400).send({status:false,message:"This order is not cancellable"})}

      let updatedOrder=await orderModel.findOneAndUpdate({_id:orderId},{status:status},{new:true})
      res.status(200).send({status:true,message:"Updated",data:updatedOrder})
  }
  catch(err){
      res.status(500).send({status:false,message:err.message})
  }
}



module.exports = { createOrder, updateOrder };
