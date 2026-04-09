import ProductDetails from "apps/user-ui/src/shared/modules/product/product-details";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Metadata } from "next";
import React from "react";
import toast from "react-hot-toast";

const fetchProductDetails = async (slug: string) => {
  console.log("SLUG:", slug);
  const response = await axiosInstance
    .get(`/product/api/v1/get-product-by-slug/${slug}`)
    .catch((error) => {
      console.log("ERROR:", error);
      toast.error(error.response.data.message);
    });
  return response?.data?.product;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductDetails(slug); // guaranteed slug

  return {
    title: `${product?.title} | E-Shop | DineshStack`,
    description:
      product?.short_description || "Discover high-quality products on E-Shop",
    keywords: product?.keywords,
    openGraph: {
      title: product?.title,
      description: product?.short_description || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
      type: "website",
    },
    twitter: {
      title: product?.title,
      description: product?.short_description || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
      card: "summary_large_image",
    },
  };
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  if (!slug) {
    console.error("Slug is missing!", await params);
    return; // or show error / loading
  }

  const productDetaiuls = await fetchProductDetails(slug);

  return <ProductDetails productDetails={productDetaiuls} />;
};

export default Page;
