import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sendKafkaEvent } from "../actions/track-user";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  shopId: string;
};

type Store = {
  cart: Product[];
  wishlist: Product[];
  addToCart: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any,
  ) => void;
  removeFromCart: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any,
  ) => void;
  addToWishlist: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any,
  ) => void;
  removeFromWishlist: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any,
  ) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      // Add to Cart
      addToCart: (product, user, location, deviceInfo) => {
        set((state) => {
          const existing = state.cart?.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: (item.quantity ?? 1) + 1 }
                  : item,
              ),
            };
          }

          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        });

        // send kafka event
        const userId = user?.id || user?._id;
        if (userId && location && deviceInfo) {
          sendKafkaEvent({
            userId: userId,
            productId: product?.id,
            shopId: product?.shopId,
            action: "add_to_cart",
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
            device: deviceInfo?.device || "Unknown",
            browser: deviceInfo?.browser || "Unknown",
          });
        }
      },

      // remove from cart
      removeFromCart: (id, user, location, deviceInfo) => {
        // find the product before calling set
        const removeProduct = get().cart?.find((item) => item.id === id);

        set((state) => ({
          cart: state.cart?.filter((item) => item.id !== id),
        }));

        // send kafka event
        const userId = user?.id || user?._id;
        if (userId && location && deviceInfo && removeProduct) {
          sendKafkaEvent({
            userId: userId,
            productId: removeProduct?.id,
            shopId: removeProduct?.shopId,
            action: "remove_from_cart",
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
            device: deviceInfo?.device || "Unknown",
            browser: deviceInfo?.browser || "Unknown",
          });
        }
      },

      // Add to wishlist
      addToWishlist: (product, user, location, deviceInfo) => {
        set((state) => {
          const existing = state.wishlist?.find(
            (item) => item.id === product.id,
          );
          if (existing) {
            return state;
          }

          return { wishlist: [...state.wishlist, product] };
        });

        console.log("WISHLIST:", product);

        // send kafka event
        const userId = user?.id || user?._id;
        if (userId && location && deviceInfo) {
          sendKafkaEvent({
            userId: userId,
            productId: product?.id,
            shopId: product?.shopId,
            action: "add_to_wishlist",
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
            device: deviceInfo?.device || "Unknown",
            browser: deviceInfo?.browser || "Unknown",
          });
        }
      },

      // remove from wishlist
      removeFromWishlist: (id, user, location, deviceInfo) => {
        // find the product before calling set
        const removeProduct = get().wishlist?.find((item) => item.id === id);

        set((state) => ({
          wishlist: state.wishlist?.filter((item) => item.id !== id),
        }));

        // send kafka event
        const userId = user?.id || user?._id;
        if (userId && location && deviceInfo && removeProduct) {
          sendKafkaEvent({
            userId: userId,
            productId: removeProduct?.id,
            shopId: removeProduct?.shopId,
            action: "remove_from_wishlist",
            country: location?.country || "Unknown",
            city: location?.city || "Unknown",
            device: deviceInfo?.device || "Unknown",
            browser: deviceInfo?.browser || "Unknown",
          });
        }
      },
    }),
    { name: "store-storage", version: 1 },
  ),
);
