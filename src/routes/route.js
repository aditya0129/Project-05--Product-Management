const router = require("express").Router();
const { register,  getUsers, userLogin, updateUser } = require("../controllers/userController");
const {createProduct , getProductById, getProducts,productdelete } = require("../controllers/productController")
const { isAuthenticated, isAuthorized } = require("../middleware/commonMiddleware")



router.post("/register",register);
router.post("/login",userLogin);
router.get("/user/:userId/profile",getUsers);
router.post("/user/:userId/profile" ,isAuthenticated, isAuthorized, updateUser);
router.get("/products/:productId" , getProductById);
router.get("/products" ,getProducts);
router.delete("/products/:productId",productdelete)



module.exports=router