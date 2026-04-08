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
  params: { slug: string };
}): Promise<Metadata> {
  const product = await fetchProductDetails(params.slug); // guaranteed slug

  return {
    title: `${product?.name} | E-Shop | DineshStack`,
    description:
      product?.short_description || "Discover high-quality products on E-Shop",
    keywords: product?.keywords,
    openGraph: {
      title: product?.name,
      description: product?.short_description || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
      type: "website",
    },
    twitter: {
      title: product?.name,
      description: product?.short_description || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
      card: "summary_large_image",
    },
  };
}

const Page = async ({ params }: { params: { slug: string } }) => {
  const slug = params?.slug;

  if (!slug) {
    console.error("Slug is missing!", params);
    return; // or show error / loading
  }

  const productDetaiuls = await fetchProductDetails(params?.slug);
  console.log("PRODUCT DETAILS:", productDetaiuls);
  return <div>Page</div>;
};

export default Page;
