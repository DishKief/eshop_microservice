import { useMutation } from "@tanstack/react-query";
import { shopCategories } from "apps/seller-ui/src/app/utils/categories";
import axios from "axios";
import { Console } from "console";
import React from "react";
import { useForm } from "react-hook-form";

function CreateShop({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/create-shop`,
        data,
        // {
        //   withCredentials: true,
        // },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setActiveStep(3);
    },
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    console.log("Form Shop Data:", shopData);

    shopCreateMutation.mutate(shopData);
  };

  const countWords = (value: string) => value.trim().split(/\s+/).length;

  return (
    <div className="div">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup new shop
        </h3>

        <label className="block mb-1 text-gray-900">Name *</label>
        <input
          type="text"
          placeholder="Shop name"
          {...register("name", { required: true })}
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
        />
        {errors.name && (
          <p className="text-red-500">{String(errors.name.message)}</p>
        )}

        <label className="block mb-1 text-gray-900">
          Bio (max 100 words) *
        </label>
        <input
          type="text"
          placeholder="Shop Bio"
          {...register("bio", {
            required: "Shop bio is required",
            validate: (value) =>
              countWords(value) <= 100 || "Bio must be less than 100 words",
          })}
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
        />
        {errors.bio && (
          <p className="text-red-500">{String(errors.bio.message)}</p>
        )}

        <label className="block mb-1 text-gray-900">Address *</label>
        <input
          type="text"
          placeholder="Shop address"
          {...register("address", {
            required: "Shop address is required",
          })}
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
        />
        {errors.address && (
          <p className="text-red-500">{String(errors.address.message)}</p>
        )}

        <label className="block mb-1 text-gray-900">Opening Hours *</label>
        <input
          type="text"
          placeholder="e.g., Mon-Fri 9am-5pm"
          {...register("opening_hours", {
            required: "Opening hours are required",
          })}
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
        />
        {errors.opening_hours && (
          <p className="text-red-500">{String(errors.opening_hours.message)}</p>
        )}

        <label className="block mb-1 text-gray-900">Web site </label>
        <input
          type="url"
          placeholder="https://example.com"
          {...register("website", {
            pattern: {
              value: /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
              message: "Enter a valid URL",
            },
          })}
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
        />
        {errors.website && (
          <p className="text-red-500">{String(errors.website.message)}</p>
        )}

        <label className="block mb-1 text-gray-900">Category *</label>
        <select
          {...register("category", {
            required: "Category is required",
          })}
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
        >
          <option value="">Select a category</option>
          {shopCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500">{String(errors.category.message)}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-[4px] mt-4"
        >
          Create Shop
        </button>
      </form>
    </div>
  );
}

export default CreateShop;
