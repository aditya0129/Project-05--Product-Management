const usermodel=require("../models/userModel")
const { validateName, validateEmail, validatePassword, validateMobileNo, validatePincode, validatePlace }=require("../validation/validation")
const validator=require("validator")


const register=async function(req,res){
   try{ 
    let data=req.body
    
    if(Object.keys(data).length == 0) return res.status(400).send({status:false,message:"please provide fields"}) 

    let {fname,lname,email,profileImage,phone,password,address}=data

    if(!fname) return res.status(400).send({status:false,message:"Please provide fname"})

    if(!validateName(fname).trim()) return res.status(400).send({status:false,message:"Please provide valid  fname"})
    
    if(!lname) return res.status(400).send({status:false,messsage:"please provide lname"})

    if(!validateName(lname).trim()) return res.status(400).send({status:false,message:"Please provide valid  lname"})

    if(!email) return res.status(400).send({status:false,messsage:"please provide email"})

    if(!validateEmail(email).trim()) return res.status(400).send({status:false,messsage:"please provide valid email"})

    if(!profileImage) return res.status(400).send({status:false,messsage:"please provide profileImage"})

    if(!validator.isURL(profileImage).trim()) return res.status(400).send({status:false,messsage:"please provide valid profileImage URL"})

    if(!phone) return res.status(400).send({status:false,messsage:"please provide phone"})

    if(!validateMobileNo(phone).trim()) return res.status(400).send({status:false,messsage:"please provide valid phone Number"})

    if(!password) return res.status(400).send({status:false,messsage:"please provide password"})

    if(!validatePassword(password).trim()) return res.status(400).send({status:false,messsage:"please provide valid password"})


    if(!address) return res.status(400).send({status:false,messsage:"please provide address"})

    if(!address.shipping) return res.status(400).send({status:false,messsage:"please provide shipping"})

    if(!address.shipping.street) return res.status(400).send({status:false,messsage:"please provide street"})

    if(!validateName(address.shipping.street).trim()) return res.status(400).send({status:false,messsage:"please provide valid street"})

    if(!address.shipping.city) return res.status(400).send({status:false,messsage:"please provide city"})

    if(!validateName(address.shipping.city).trim()) return res.status(400).send({status:false,messsage:"please provide city"})

    if(!address.shipping.pincode) return res.status(400).send({status:false,messsage:"please provide pincode"})

    if(!validator.isNumeric(address.shipping.pincode).trim()||address.shipping.pincode.length!=6)
        {
           return res.status(400).send({status:false,message:"make sure pincode should be numeric only and 6 digit number"})
        }

    if(!address.billing) return res.status(400).send({status:false,messsage:"please provide billing"})

    if(!address.billing.street) return res.status(400).send({status:false,messsage:"please provide street"})

    if(!validateName(address.billing.street).trim()) return res.status(400).send({status:false,messsage:"please provide valid street"})

    if(!address.billing.city) return res.status(400).send({status:false,messsage:"please provide city"})

    if(!validateName(address.billing.city).trim()) return res.status(400).send({status:false,messsage:"please provide valid city"})

    if(!address.billing.pincode) return res.status(400).send({status:false,messsage:"please provide pincode"})

    if(!validator.isNumeric(!address.billing.pincode).trim()||address.billing.pincode.length!=6)
        {
           return res.status(400).send({status:false,message:"make sure pincode should be numeric only and 6 digit number"})
        }

    let sdata= await usermodel.create(data)
    res.status(200).send({status:true,message:"User created successfully",data:sdata})
}catch(error){
    res.status(500).send({status:false,message:error.message})
}
}






const userLogin = async function (req, res) {
    try {
        let { email, password } = req.body;

        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "please input user Details" });
        }

        if (!email) {
            return res.status(400).send({ status: false, message: "EmailId is mandatory", });
        }

        if (!validEmail(email)) {
            return res.status(400).send({ status: false, message: "EmailId should be Valid", });
        }

        if (!password) {
            return res.status(400).send({ status: false, message: "Password is mandatory" });
        }

        if (password.length <=8 || password.length >=15) {
            return res.status(400).send({ status: false, message: "the length of password must be min: 8 and max: 15", });
        }

        let verifyUser = await userModel.findOne({ email: email });
        if (!verifyUser){
            return res.status(400).send({ status: false, message: "Invalid Login Credential" });
        }

        bcrypt.compare(password, verifyUser.password, function (error, verifyUser) {
            if (error) {
                return res.status(400).send({ status: false, message: error.message })
            }else {
            verifyUser == true
          }
        });


        let payload = { userId: verifyUser["_id"], iat: Date.now(), };
        let token = jwt.sign(payload, "group-13-project", { expiresIn: "2h" });

        res.setHeader("authorization", token);
        res.status(200).send({ status: true, message: "User login successfull", data: { userId: verifyUser["_id"], token } });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message, });
    }
};




const getUsers = async function (req, res) {
    try {
        let userId = req.params.userId;
        
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).send({ status: false, message: "user is invalid" });

    let getData = await usermodle.findOne({ _id: userId });
    if (!getData)
      return res.status(404).send({ status: false, message: "user not found" });
    return res
      .status(200)
      .send({ status: true, message: "User profile details", data: getData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message});
  }
};

        module.exports={register,getUsers,userLogin}