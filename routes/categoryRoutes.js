import express from "express";
import { isAdmin, requireSignin } from "../middlewares/authMiddleware.js";
import {
  categoryController,
  createCategoryController,
  deleteCategoryController,
  singleCategoryController,
  updateCategoryController,
} from "../controller/categoryController.js";

const router = express.Router();

//Routes
router.post(
  "/create-category",
  requireSignin,
  isAdmin,
  createCategoryController
);

router.put(
  "/update-category/:id",
  requireSignin,
  isAdmin,
  updateCategoryController
);

// Get all Category
router.get("/allcategories", categoryController);

//Get Single Category
router.get("/single-category/:slug", singleCategoryController);

//Delete catgeory
router.delete(
  "/delete-category/:id",
  requireSignin,
  isAdmin,
  deleteCategoryController
);

export default router;
