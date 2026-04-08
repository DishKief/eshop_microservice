import express, { Router } from "express";
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  getAllProducts,
  getCategories,
  getProductBySlug,
  getShopProducts,
  restoreProduct,
  uploadProductImage,
} from "../controllers/product.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import {
  createDiscountCode,
  deleteDiscountCode,
  getDiscountCodes,
} from "../controllers/product.controller";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCode);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);
router.post("/upload-product-image", isAuthenticated, uploadProductImage);
router.post("/delete-product-image", isAuthenticated, deleteProductImage);
router.post("/create-product", isAuthenticated, createProduct);
router.get("/get-shop-products", isAuthenticated, getShopProducts);
router.delete("/delete-product/:productId", isAuthenticated, deleteProduct);
router.put("/restore-product/:productId", isAuthenticated, restoreProduct);

router.get("/get-all-products", getAllProducts);

router.get("/get-product-by-slug/:slug", getProductBySlug);

export default router;
