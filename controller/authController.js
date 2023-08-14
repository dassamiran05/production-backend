import userModel from "../models/userModels.js";
import {
  compareOTP,
  comparePassword,
  hashPassword,
} from "../helper/authHelper.js";
import JWT from "jsonwebtoken";
import orderModel from "../models/orderModel.js";
import userModels from "../models/userModels.js";
import otpModel from "../models/otpModel.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import twilio from "twilio";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    //validations
    if (!name) {
      return res.send({
        message: "Name is Required",
      });
    }
    if (!email) {
      return res.send({
        message: "Email is Required",
      });
    }
    if (!password) {
      return res.send({
        message: "Password is Required",
      });
    }
    if (!phone) {
      return res.send({
        message: "Phone is Required",
      });
    }
    if (!address) {
      return res.send({
        message: "Address is Required",
      });
    }
    if (!answer) {
      return res.send({
        message: "Answer is Required",
      });
    }

    //check user
    const existingUser = await userModel.findOne({
      email,
    });

    //check existing user
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already registered please login",
      });
    }

    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();
    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};

//Login post
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Validations
    if (!email || !password) {
      return res.send({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User is not registered",
      });
    }

    const match = await comparePassword(password, user?.password);

    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }

    //Token Generation

    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "Login Successfully",
      user: {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        address: user?.address,
        role: user?.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};

//forget password Controller
export const forgetPasswordController = async (req, res) => {
  try {
    const { newuserpass } = req.body;
    const { email, answer, newpassword } = newuserpass;

    // if (!email) {
    //   res.status(400).send({ message: "Email is required" });
    // }
    // if (!answer) {
    //   res.status(400).send({ message: "Answer is required" });
    // }
    if (!newpassword) {
      return res.status(400).send({ message: "New password is required" });
    }

    const user = await userModel.findOne({ email, answer });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong email or answer",
      });
    }
    const hashed = await hashPassword(newpassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const testController = (req, res) => {
  res.send("Protected route");
};

//update prfole
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};

//orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

//orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

//Get all users
export const allUsersController = async (req, res) => {
  try {
    console.log("Hi");
    const users = await userModel
      .find({
        $or: [{ role: 0 }],
      })
      .select("-password -answer")
      .sort({ createdAt: "-1" });
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Users",
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};

export const sendotpController = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await userModels.findOne({ phone });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Invalid Phone number",
      });
    }
    const OTP = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    const smsres = await client.messages.create({
      from: "+13136318391",
      body: `Hi there your OTP is ${OTP}`,
      to: `+91${phone}`,
    });

    const otp = new otpModel({ number: phone, otp: OTP });
    const salt = await bcrypt.genSalt(10);
    otp.otp = await bcrypt.hash(otp.otp, salt);
    const result = await otp.save();

    return res.status(200).send({
      success: true,
      message: "Otp sent succssfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error While Sending OTP",
      error,
    });
  }
};

export const otpVerifyController = async (req, res) => {
  try {
    const { otp, phone } = req.body;

    const numberholder = await otpModel.find({ number: phone });

    if (numberholder?.length === 0)
      return res.status(400).send("You use an expired OTP");
    const lastTried = numberholder[numberholder?.length - 1];

    const validUser = await compareOTP(otp, lastTried?.otp);

    if (!validUser) {
      return res.status(400).send({ success: false, message: "Invalid OTP" });
    }

    if (lastTried?.number === phone && validUser) {
      const user = await userModels.find({ phone }).select("email answer");
      console.log(user);

      const otpDelete = await otpModel.deleteMany({
        number: lastTried?.number,
      });
      res.status(200).send({
        success: true,
        message: "Otp verified Successfully",
        user: user,
      });
    }
  } catch (error) {
    console.log(error);
  }

  // console.log(otp, phone, lastTried, validUser);
};
