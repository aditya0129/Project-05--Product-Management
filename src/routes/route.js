const router = require("express").Router();




router.post("/register");
router.post("/login");
router.get("/user/:userId/profile");



module.exports=router