"use client";
import { useDeviceTracking } from "apps/user-ui/src/hooks/useDeviceTracking";
import { useLocationTracking } from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";
import Ratings from "../../components/ratings";
import Link from "next/link";
import { useStore } from "apps/user-ui/src/store";

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  const { user, isLoading } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const [currentImage, setCurrentImage] = useState(
    productDetails?.images[0]?.url,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSelected, setIsSelected] = useState(
    productDetails?.colors?.[0] || "",
  );
  const [isSizeSelected, setIsSizeSelected] = useState(
    productDetails?.sizes?.[0] || "",
  );
  const [quantity, setQuantity] = useState(1);
  const [priceRange, setPriceRange] = useState([
    productDetails?.sale_price,
    1199,
  ]);

  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const addToCart = useStore((state: any) => state.addToCart);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === productDetails.id);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some(
    (item: any) => item.id === productDetails.id,
  );

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentImage(productDetails?.images[currentIndex - 1]);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const nextImage = () => {
    if (currentIndex < productDetails?.images?.length - 1) {
      setCurrentImage(productDetails?.images[currentIndex + 1]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const calculateDiscountPercentage = () => {
    const discount =
      ((productDetails?.regular_price - productDetails?.sale_price) /
        productDetails?.regular_price) *
      100;
    return Math.round(discount);
  };

  return (
    <div className="w-full bg-[#f5f5f5] py-5">
      <div className="w-[90%] bg-white lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden">
        {/* Left Column - product images */}
        <div className="p-4">
          <div className="relative w-full">
            {/* Main Image with zoom */}
            <InnerImageZoom
              src={currentImage} // ~800px
              zoomSrc={currentImage} // 4000px
              hasSpacer
              className="rounded-xl border"
              zoomType="hover"
              zoomPreload
              moveType="pan"
              fadeDuration={150}
              hideHint={false}
              fullscreenOnMobile
              mobileBreakpoint={768}
            />
          </div>
          {/* Thumnails images array */}
          <div className="relative flex items-center gap-2 mt-4 overflow-hidden">
            {productDetails?.images?.length > 4 && (
              <button
                className="absolute left-0 bg-white rounded-full shadow-md z-10 cursor-pointer"
                onClick={prevImage}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="flex gap-2 overflow-x-auto">
              {productDetails?.images?.map((image: any, index: number) => (
                <Image
                  key={index}
                  src={
                    image?.url ||
                    "https://ik.imagekit.io/wbzhfm4up/products/What_Companies_Actually_Expect_From_Junior_Developers__Sinhala__DoH1IC1Hn.png?updatedAt=1775342317452"
                  }
                  alt={`Thumnail${index}`}
                  width={80}
                  height={80}
                  loading="eager"
                  className={`cursor-pointer border rounded-lg p-1 ${
                    currentImage === image
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setCurrentImage(image);
                  }}
                />
              ))}
            </div>
            {productDetails?.images?.length > 4 && (
              <button
                className="absolute right-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={nextImage}
                disabled={currentIndex === productDetails?.images?.length - 1}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Middle Column - product details */}
        <div className="p-4">
          <h1 className="text-xl mb-2 font-medium">{productDetails?.title}</h1>
          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2 mt-2 text-yellow-500">
              <Ratings rating={productDetails?.ratings} />
              <Link href={"#reviews"} className="text-blue-500 hover:underline">
                (100 reviews)
              </Link>
            </div>
            <div className="">
              <Heart
                size={25}
                fill={"red"}
                className="cursor-pointer"
                color="transparent"
              />
            </div>
          </div>
          <div className="py-2 border-b border-gray-200">
            <span className="text-gray-500">
              Brand:{" "}
              <span className="text-blue-500 hover:underline">
                {productDetails?.brand || "No Brand"}
              </span>
            </span>
          </div>

          <div className="mt-3">
            <span className="text-3xl font-bold text-orange-500">
              ${productDetails?.sale_price}
            </span>
            <div className="flex gap-2 pb-2 text-lg border-b border-b-slate-200">
              <span className="text-gray-400 line-through">
                ${productDetails?.regular_price}
              </span>
              <span className="text-gray-500">
                - {calculateDiscountPercentage()}%
              </span>
            </div>

            <div className="mt-2">
              <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                {/* Color Options */}
                {productDetails?.colors?.length > 0 && (
                  <div>
                    <strong>Color:</strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails?.colors?.map(
                        (color: any, index: number) => (
                          <button
                            key={index}
                            className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${
                              isSelected === color
                                ? "border-gray-400 scale-110 shadow-md"
                                : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setIsSelected(color)}
                          />
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Size Options */}
                {productDetails?.sizes?.length > 0 && (
                  <div>
                    <strong>Size:</strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails?.sizes?.map(
                        (size: string, index: number) => (
                          <button
                            key={index}
                            className={`px-4 py-1 cursor-pointer rounded-md transition ${
                              isSizeSelected === size
                                ? "border-gray-800 text-white"
                                : "bg-gray-300 text-black"
                            }`}
                            onClick={() => setIsSizeSelected(size)}
                          >
                            {size}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-md">
                  <button className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400"></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full flex flex-col md:flex-row">
          <div className="w-full md:w-1/2"></div>
          <div className="w-full md:w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
