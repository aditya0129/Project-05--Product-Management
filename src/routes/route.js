const router = require("express").Router();
const { register,  getUsers, userLogin, updateUser } = require("../controllers/userController");
const { createProduct , getProductById, getProducts,updateProduct,deleteProduct } = require("../controllers/productController")
const { createCart , getCart , updateCart , deleteCart } = require("../controllers/cartController")
const { createOrder , updateOrder } = require("../controllers/orderController") 
const { isAuthenticated, isAuthorized } = require("../middleware/commonMiddleware")



router.post("/register",register);
router.post("/login",userLogin);
router.get("/user/:userId/profile",isAuthenticated,getUsers);
router.put("/user/:userId/profile" ,isAuthenticated, isAuthorized, updateUser);



router.post("/products" ,createProduct);
router.get("/products/:productId" , getProductById);
router.get("/products" ,getProducts);
router.put("/products/:productId" , updateProduct)
router.delete("/products/:productId",deleteProduct)

router.post("/users/:userId/cart",isAuthenticated , isAuthorized, createCart);
router.get("/users/:userId/cart", isAuthenticated , isAuthorized, getCart);
router.put("/users/:userId/cart" ,isAuthenticated, isAuthorized, updateCart);
router.delete("/users/:userId/cart",isAuthenticated , isAuthorized, deleteCart);

router.post("/users/:userId/orders",isAuthenticated , isAuthorized, createOrder);
router.put("/users/:userId/orders" ,isAuthenticated, isAuthorized, updateOrder);



router.all('/*', (req , res) => {
    res.status(400).send({ status: false, message: " path invalid" });
});

module.exports=router