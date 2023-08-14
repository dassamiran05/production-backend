import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgetPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  allUsersController,
  sendotpController,
  otpVerifyController,
} from "../controller/authController.js";
import { isAdmin, requireSignin } from "../middlewares/authMiddleware.js";

//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || METHOD POST
router.post("/login", loginController);

//forget password
router.post("/forget-password", forgetPasswordController);


//send Otp
router.post("/sendotp", sendotpController);


//Verify Otp
router.post("/verifyotp", otpVerifyController);

//test
router.get("/test", requireSignin, isAdmin, testController);

//Protected User Route
router.get("/user-auth", requireSignin, (req, res) => {
  res.status(200).send({ ok: true });
});

//Protected Admin Route
router.get("/admin-auth", requireSignin, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});


//Get All users
router.get("/allusers", requireSignin, isAdmin, allUsersController);

//update profile
router.put("/profile", requireSignin, updateProfileController);

//orders
router.get("/orders", requireSignin, getOrdersController);


//all orders
router.get("/all-orders", requireSignin, isAdmin, getAllOrdersController);

// order status update
router.put(
  "/order-status/:orderId",
  requireSignin,
  isAdmin,
  orderStatusController
);

export default router;
