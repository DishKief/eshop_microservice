import { NotFoundError, ValidationError } from "@packages/error-handler";
import imageKitClient from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({ message: "Categories not found" });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

// Create Discount Code
export const createDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      public_name,
      discount_type,
      discount_value,
      discount_code,
      min_order_amount,
      max_discount_amount,
      start_date,
      end_date,
    } = req.body;

    const isDiscountCodeExists = await prisma.discount_codes.findUnique({
      where: {
        discount_code: discount_code,
      },
    });

    if (isDiscountCodeExists) {
      return next(
        new ValidationError(
          "Discount code already available please use a different code!",
        ),
      );
    }

    const parsedMinOrderAmount = min_order_amount
      ? parseFloat(min_order_amount)
      : 0;

    const parsedMaxDiscountAmount = max_discount_amount
      ? parseFloat(max_discount_amount)
      : 0;

    const parsedStartDate = start_date ? new Date(start_date) : new Date(); // default: now

    const parsedEndDate = end_date
      ? new Date(end_date)
      : new Date(new Date().setDate(new Date().getDate() + 7)); // default: +7 days

    const sellerId = req.seller.id;
    const discountCode = await prisma.discount_codes.create({
      data: {
        public_name,
        discount_type,
        discount_value: parseFloat(discount_value),
        discount_code,
        min_order_amount: parsedMinOrderAmount ?? 0,
        max_discount_amount: parsedMaxDiscountAmount ?? 0,
        start_date: parsedStartDate ?? new Date(),
        end_date:
          parsedEndDate ??
          new Date(new Date().setDate(new Date().getDate() + 7)),
        sellerId: sellerId,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Discount code created successfully",
      discountCode,
    });
  } catch (error: any) {
    console.log("ERROR:", error.message);
    console.log("STACK:", error.stack);
    return next(error);
  }
};

// get discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller.id;
    const discountCodes = await prisma.discount_codes.findMany({
      where: {
        sellerId,
      },
    });
    return res.status(200).json({
      success: true,
      discountCodes,
    });
  } catch (error) {
    return next(error);
  }
};

// delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      return next(new NotFoundError("Discount code not found"));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(
        new ValidationError(
          "You are not authorized to delete this discount code",
        ),
      );
    }

    await prisma.discount_codes.delete({
      where: {
        id,
        sellerId,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Discount code deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// upload product image
export const uploadProductImage = [
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const response = await imageKitClient.files.upload({
        file: file.buffer.toString("base64"), // ImageKit expects base64
        fileName: file.originalname,
        folder: "/products",
      });

      return res.status(201).json({
        success: true,
        file_url: response.url,
        fileId: response.fileId,
      });
    } catch (error) {
      return next(error);
    }
  },
];

// delete product image
export const deleteProductImage = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileId } = req.body;

    console.log("FILE ID:", fileId);

    const response = await imageKitClient.files.delete(fileId);

    return res.status(200).json({
      success: true,
      message: "Product image deleted successfully",
      response,
    });
  } catch (error) {
    console.log("ERROR:", error);
    return next(error);
  }
};

export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discount_codes = [],
      stock,
      sale_price,
      regular_price,
      subCategory,
      custom_properties = {},
      images = [],
    } = req.body;

    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !tags ||
      !stock ||
      !regular_price
    ) {
      return res.status(422).json({
        status: false,
        success: false,
        message: "Please fill all the required fields",
      });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(422).json({
        status: false,
        success: false,
        message: "At least one image is required",
      });
    }
    const sellerId = req.seller.id;

    if (!sellerId) {
      return res.status(422).json({
        status: false,
        success: false,
        message: "Only Seller can create products",
      });
    }

    const slugChecking = await prisma.products.findUnique({
      where: {
        slug,
      },
    });

    if (slugChecking) {
      return res.status(422).json({
        status: false,
        success: false,
        message: "Slug already exists! Please use a different slug!",
      });
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id!,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        brand,
        video_url,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: discount_codes.map((id: string) => id) || [],
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: custom_properties || {},
        custom_specifications: custom_specifications || {},
        images: {
          create: validImages(images).map((image: any) => ({
            file_id: image.fileId,
            url: image.file_url,
          })),
        },
      },
      include: { images: true },
    });

    return res.status(201).json({
      status: true,
      success: true,
      message: "Product created successfully",
      newProduct,
    });
  } catch (error) {
    return next(error);
  }
};

const validImages = (images: any[] | []) =>
  images.filter((image: any) => {
    return (
      image &&
      typeof image.fileId === "string" &&
      image.fileId.trim() !== "" &&
      typeof image.file_url === "string" &&
      image.file_url.trim() !== ""
    );
  });

// get logged in seller products
export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req.seller?.shop?.id!,
      },
      include: { images: true },
    });
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

// delete product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return res.status(404).json({
        status: false,
        success: false,
        message: "Product not found",
      });
    }

    if (product.shopId !== sellerId) {
      return res.status(403).json({
        status: false,
        success: false,
        message: "You are not authorized to delete this product",
      });
    }

    if (product.isDeleted) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Product is already deleted",
      });
    }

    const deletedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      status: true,
      success: true,
      message:
        "Product is scheduled to be deleted in 24 hours. You can restore it within this time",
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

// restore product
export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return res.status(404).json({
        status: false,
        success: false,
        message: "Product not found",
      });
    }

    if (product.shopId !== sellerId) {
      return res.status(403).json({
        status: false,
        success: false,
        message: "You are not authorized to restore this product",
      });
    }

    if (!product.isDeleted) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Product is not in deleted state",
      });
    }

    const restoredProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      status: true,
      success: true,
      message: "Product restored successfully",
      restoredProduct,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      success: false,
      message: "Error restoring product",
      error,
    });
  }
};

// get All products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;

    const baseFilter = {
      isDeleted: false,
      // AND: [
      //   {
      //     OR: [{ starting_date: null }, { starting_date: { lte: new Date() } }],
      //   },
      //   {
      //     OR: [{ ending_date: null }, { ending_date: { gte: new Date() } }],
      //   },
      // ],
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === "latest"
        ? { createdAt: "desc" as Prisma.SortOrder }
        : { totalSales: "desc" as Prisma.SortOrder };

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          shops: true,
        },
        where: baseFilter,
        orderBy: {
          totalSales: "desc",
        },
      }),
      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        take: 10,
        where: baseFilter,
        orderBy,
      }),
    ]);

    // console.log("TOTAL1:", total);
    // console.log("PRODUCTS:", products);

    return res.status(200).json({
      success: true,
      products,
      top10By: type === "latest" ? "latest" : "topSales",
      top10Products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

// get product details by slug
export const getProductBySlug = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  const { slug } = req.params;
  if (!slug || slug === "undefined") {
    return res
      .status(400)
      .json({ success: false, message: "Slug is required" });
  }
  console.log("REQ PARAMS:", req.params);
  try {
    const product = await prisma.products.findUnique({
      where: {
        slug: req.params.slug!,
      },
      include: {
        images: true,
        shops: true,
      },
    });
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
};
