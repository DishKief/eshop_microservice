import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Ratings from "../ratings";
import { EyeIcon, HeartIcon, ShoppingBag } from "lucide-react";
import ProductDetailsCard from "./product-details.card";
import { useStore } from "apps/user-ui/src/store";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useLocationTracking } from "apps/user-ui/src/hooks/useLocationTracking";
import { useDeviceTracking } from "apps/user-ui/src/hooks/useDeviceTracking";

const ProductCard = ({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item.id === product.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === product.id);

  useEffect(() => {
    if (isEvent && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(
          `${days}d ${hours}h ${minutes}m ${seconds}s left with this price`,
        );
      }, 60000);

      const endTime = new Date(product.ending_date).getTime();
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(
          `${days}d ${hours}h ${minutes}m ${seconds}s left with this price`,
        );
      }

      return () => clearInterval(interval);
    }
    return;
  }, [isEvent, product?.ending_date]);
  return (
    <div className="w-full min-h-[350px] h-max bg-white rounded-lg relative">
      {isEvent && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          OFFER
        </div>
      )}

      {product?.stock <= 5 && (
        <div className="absolute top-2 left-2 bg-yellow-600 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          Limited Stock
        </div>
      )}

      <Link href={`/product/${product?.slug}`}>
        <Image
          src={
            product?.images[0]?.url ||
            "https://ik.imagekit.io/wbzhfm4up/products/What_Companies_Actually_Expect_From_Junior_Developers__Sinhala__DoH1IC1Hn.png?updatedAt=1775342317452"
          }
          alt={product?.title}
          width={300}
          height={300}
          className="w-full h-[200px] object-cover mx-auto rounded-t-md"
        />
      </Link>

      <Link
        href={`/shop/${product?.Shop?.id}`}
        className="block text-blue-500 text-sm font-medium my-2 px-2"
      >
        {product?.shop?.name}
      </Link>

      <Link href={`/product/${product?.slug}`}>
        <h3 className="text-base font-semibold px-2 text-gray-800 line-clamp-2">
          {product?.title}
        </h3>
      </Link>

      <div className="mt-2 px-2">
        <Ratings rating={product?.ratings} />
      </div>

      <div className="mt-3 flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg text-gray-900">
            ${product?.sale_price}
          </span>
          <span className="text-sm line-through text-gray-400">
            ${product?.regular_price}
          </span>
        </div>
        <span className="text-green-500 text-sm font-medium">
          {product?.totalSales} sold
        </span>
      </div>
      {isEvent && timeLeft && (
        <div className="mt-2">
          <span className="inline-block text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-1 rounded-sm shadow-md">
            {timeLeft}
          </span>
        </div>
      )}

      <div className="absolute z-10 flex flex-col gap-3 right-3 top-10">
        <div className="bg-white rounded-full p-[6px] shadow-md">
          <HeartIcon
            size={22}
            fill={isWishlisted ? "red" : "transparent"}
            stroke={isWishlisted ? "red" : "#4B5563"}
            onClick={() =>
              isWishlisted
                ? removeFromWishlist(product.id, user, location, deviceInfo)
                : addToWishlist(
                    { ...product, quantity: 1 },
                    user,
                    location,
                    deviceInfo,
                  )
            }
            className="cursor-pointer hover:scale-110 transition"
          />
        </div>

        <div className="bg-white rounded-full p-[6px] shadow-md">
          <EyeIcon
            size={22}
            className="cursor-pointer hover:scale-110 transition"
            onClick={() => setOpen(!open)}
          />
        </div>
        <div className="bg-white rounded-full p-[6px] shadow-md">
          <ShoppingBag
            size={22}
            // fill={isInCart ? "red" : "transparent"}
            // stroke={isInCart ? "red" : "#4B5563"}
            onClick={() =>
              !isInCart &&
              addToCart({ ...product, quantity: 1 }, user, location, deviceInfo)
            }
            className="cursor-pointer text-[#4b5563] hover:scale-110 transition"
          />
        </div>
      </div>

      {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
    </div>
  );
};

export default ProductCard;
