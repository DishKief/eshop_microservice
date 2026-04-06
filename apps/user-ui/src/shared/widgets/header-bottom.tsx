"use client";
import {
  AlignLeft,
  ChevronDown,
  HeartIcon,
  ShoppingCart,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { navItems } from "../../configs/constants";
import Link from "next/link";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user, isLoading } = useUser();
  const cart = useStore((state: any) => state.cart);
  const wishlist = useStore((state: any) => state.wishlist);

  // Track scroll position to toggle sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"}`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? "pt-3" : "py-0"}`}
      >
        {/* All Dropdowns */}
        <div
          className={`w-[260px] ${isSticky && "-mb-2"} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-white font-medium">All Departments</span>
          </div>
          <ChevronDown color="white" />
        </div>

        {/* Dropdown Menu */}
        {show && (
          <div
            className={`absolute left-0 ${isSticky ? "top-[70px]" : "top-[50px]"} w-[260px] h-[400px] bg-[#f5f5f5]`}
          ></div>
        )}

        {/* Navigation Links */}
        <div className="flex items-center">
          {navItems.map((i, index: number) => (
            <Link
              key={index}
              href={i.link}
              className="px-5 font-medium text-lg"
            >
              {i.name}
            </Link>
          ))}
        </div>

        <div className="">
          {isSticky && (
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                {!isLoading && user ? (
                  <>
                    <Link
                      href={"/profile"}
                      className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                    ></Link>
                    <Link href={"/profile"}>
                      <span className="block font-medium">Hello,</span>
                      <span className="font-semibold">
                        {user?.name?.split(" ")[0]}
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={"/login"}
                      className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                    >
                      <User color="#3489FF" />
                    </Link>
                    <Link href={"/login"}>
                      <span className="block font-medium">Hello,</span>
                      <span className="font-semibold">
                        {isLoading ? "..." : "Sign In"}
                      </span>
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center gap-5">
                <Link href={"/wishlist"} className="relative">
                  <HeartIcon color="#3489FF" />
                  <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-sm text-white font-medium">
                      {wishlist?.length}
                    </span>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-5">
                <Link href={"/cart"} className="relative">
                  <ShoppingCart color="#3489FF" />
                  <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-sm text-white font-medium">
                      {cart?.length}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
