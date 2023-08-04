import express from "express";
import { isAdmin, requireSignin } from "../middlewares/authMiddleware.js";
import {
  braintreePaymentsController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  getProductController,
  productCategoryController,
  productCountController,
  productFiltersController,
  productListController,
  productPhotoController,
  realtedProductController,
  searchProductController,
  singleProductController,
  updateProductController,
} from "../controller/productController.js";
import formidable from "express-formidable";

const router = express.Router();

//routes
router.post(
  "/create-product",
  requireSignin,
  isAdmin,
  formidable(),
  createProductController
);

//update
router.put(
    "/update-product/:pid",
    requireSignin,
    isAdmin,
    formidable(),
    updateProductController
  );

//get products
router.get("/get-product", getProductController);

//single product
router.get("/single-product/:slug", singleProductController);


//get photo
router.get("/product-photo/:pid", productPhotoController);

//delete rproduct
router.delete("/delete-product/:pid", deleteProductController);

//filter product
router.post("/product-filters", productFiltersController);

//product count
router.get("/product-count", productCountController);

//product per page
router.get("/product-list/:page", productListController);


//search product
router.get("/search/:keyword", searchProductController);

//similar product
router.get("/related-product/:pid/:cid", realtedProductController);


//category wise product
router.get("/product-category/:slug", productCategoryController);


//payment gateway and token 
router.get("/braintree/token", braintreeTokenController);

router.post("/braintree/payment",requireSignin, braintreePaymentsController);

export default router;
