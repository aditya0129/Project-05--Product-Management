const router = require("express").Router();
const { register,  getUsers, userLogin, updateUser } = require("../controllers/userController");
const { isAuthenticated, isAuthorized } = require("../middleware/commonMiddleware")



router.post("/register",register);
router.post("/login",userLogin);
router.get("/user/:userId/profile",getUsers);
router.post("/user/:userId/profile" ,isAuthenticated, isAuthorized, updateUser)



module.exports=router