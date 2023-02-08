const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const { isValidObjectId } = require("mongoose");
const { validatePrice } = require("../validation/validator.js")





const createCart = async function (  req , res ) {
  // try {
    let userId = req.params.userId;

    if( !isValidObjectId( userId ) ) {
      return res.status(400).send({ status : false , message : "UserId is invalid , please provide valid userId."})
    }

    let checkUserId = await userModel.findById(userId)

      if( !checkUserId ) {
        return res.status(404).send({ status : false , message : " This user is not exsit or it might be deleted."})
      }

    let data = req.body;
    let { productId , quantity , cartId } = data;

    if( Object.keys( data ).length == 0 ) {
      return res.status(400).send({ status : false , message : "You can not create cart with empty body,please provide required credentals."})
    }

     if( !productId ) {
      return res.status(400).send({ status : false , message : " Please provide productId."})
    }

    if ( !isValidObjectId(productId) ) {
      return res.status(400).send({ status : false,
          message: "Please provide a Valid product Id.",
        })
      };
       
  let checkProductExist = await productModel.findOne(
    { _id: productId , isDeleted: false }); 

  if ( !checkProductExist) {
    return res.status(400).send({ status: false , message: "Product does not  Exists of this Id." })
  };

  if ( !quantity ) {
    return res.status(400).send({ status : false, message : "Please enter some quantity of the products." })
 }
// if ( !validatePrice( quantity ) ) {
//     return res.status(404).send({ status : false, message: "Enter a valid quantity number." })
// }


     let checkUserExist = await cartModel.findOne(
        { userId : userId });

      if ( !checkUserExist ) {
        // take some ceentals for create a cart
        let addNewCart =  {    
          userId : userId ,
          items : [{
            productId : productId,
            quantity : quantity
          }] , 
          totalItems : 1 ,
          totalPrice : checkProductExist.price * quantity
      }

        let createCart = await cartModel.create( addNewCart );
      
      return res.status(201).send({ status : true , message : "Success" , data : createCart })
      }else{
        if( !cartId ) {
          return res.status(400).send({ status : false , message: " Please provide CartId."})
        }
      
        
        if ( !isValidObjectId( cartId ) ) {
          return res.status(400).send({ status: false, message: "Please provide a Valid CartId" })
        }

        let checkCartExist = await cartModel.findById(cartId)

        if( !checkCartExist ) {
          return res.status(404).send({ status : false , message : "Cart is not found with this CartId" })
        }
        if ( cartId != checkUserExist._id ) {
          return res.status(401).send({ status : false , message : " This cart does not belong to that user." })
      }

      // let totalItmes = checkCartExist.items

      for( i = 0 ; i < checkCartExist.items.length ; i++ ) {
        
        if( checkCartExist.items[i].productId == productId ) {
 
          checkCartExist.items[i].quantity = checkCartExist.items[i].quantity + parseInt( quantity )

          checkCartExist.totalPrice = checkCartExist.totalPrice + ( quantity * checkProductExist.price )

          checkCartExist.save()   

          return res.status(201).send({ status : true , message : "Success" , data : checkCartExist })
        }    

        if( checkCartExist.items[i].productId != productId ){

          checkCartExist.items = ({ productId : productId , quantity : quantity })

          checkCartExist.totalPrice = ( checkCartExist.totalPrice +
            (( quantity ) * checkProductExist.price ))

            checkCartExist.totalItems = (( checkCartExist.items.productId.length ) + checkCartExist.totalItems )

            checkCartExist.save() 

            return res.status(201).send({ status : true , message : "Success" , data : checkCartExist })
        }
      }
    }  

  //   }catch (error) {
  //   return res.status(500).send({ status: false, message: error.message });
  // }
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






const updateCart = async function ( req , res ) {
  try{
    let userId = req.param.userId

    if( !isValidObjectId (userId) ) {
      return res.status(400).send({ status :false , message : "Please provide valid user id."})
    }

    let checkUserId = await userModel.findById(userId)

    if( !checkUserId ) {
      return res.status(404).send({ status : false , message : "This userID does not exsit in your database , check your Id." })
    }

    let body = req.body
    let { cartId , productId , removeProduct } = body

    if( Object.keys( body ).length == 0 ) {
      return res.status(400).send({ status : false , message : "You can not update empty body,please provide required credentals."})
    }


      if( !cartId ) {
        return res.status(400).sedn({ status : false , message : "Please provide cartId."})
      }

      if( !isValidObjectId (cartId.trim()) ) {
        return res.status(400).send({ status :false , message : "Please provide valid cart id."})
      }
      
    let checkcartId = await cartModel.findOne(
      { _id : cartId })
 
    if( !checkcartId ) {
      return res.status(404).send({ status : false , message : "This cartID does not exsit in your database , check your Id." })
    }

    if( !checkUserId.userId == userId) {
      return res.status(401).send({ status : false , message : "This is not your cartId enter your own cart Id."})
    }
    
    if (checkcartId.items.length == 0) {
      return res.status(400).send({ status : false , message : "There are no items left in the cart" })
  }

    if( !productId ) {
      return res.status(400).send({ status : false , message : "Please provide productId"})
    
    }
    
      if( !isValidObjectId (productId) ) {
        return res.status(400).send({ status :false , message : "Please provide valid product id."})
      }
      
    let checkproductId = await productModel.findOne({ _id : productId , isDeleted : false })

    if( !checkproductId ) {
      return res.status(404).send({ status : false , message : "This productID does not exsit in your database , it migth be deleted." })
    }
    
    if( !removeProduct ) {
      return res.status(400).send({ status : false , message : "Please provide remove product data."})
    }
      
      if ((removeProduct != 0) && (removeProduct != 1)) {
        return res.status(400).send({ status: false, message
          : "Enter 0 for remove Product or 1 for decrement Product quantity." })
        }  

     for ( i = 0 ; i < checkcartId.items.length ; i++ ) {
      if ( checkcartId.items[i].productId == productId ){
        if( removeProduct == 1 && checkcartId.items[i].quantity > 1 ) {
          checkcartId.items[i].quantity = (checkcartId.items[i].quantity - 1)
           checkcartId.save()
           

        }
        if ( removeProduct == 0 && checkcartId.items[i].quantity >= 1 ){

        }
      }//id not match vala msg
     }

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


module.exports = { createCart , getCart , updateCart ,deleteCart };
