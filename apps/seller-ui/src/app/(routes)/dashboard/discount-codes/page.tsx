"use client";
import { ChevronRight, Loader2, Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/app/utils/axiosInstance";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Input from "packages/components/input";
import { AxiosError } from "axios";
import DeleteDiscountCodeModal from "apps/seller-ui/src/shared/components/modals/delete.discount-codes";

const Page = () => {
  const [showModel, setShowModel] = useState(false);
  const [showDeleteModel, setShowDeleteModel] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();

  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          "/product/api/v1/get-discount-codes",
        );
        return res?.data?.discountCodes || [];
      } catch (error) {
        console.log(error);
      }
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: "",
      discount_type: "percentage",
      discount_value: "",
      discount_code: "",
    },
  });

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data) => {
      await axiosInstance.post("/product/api/v1/create-discount-code", data);
    },
    onSuccess: () => {
      toast.success("Discount code created successfully");
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      reset();
      setShowModel(false);
    },
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/product/api/v1/delete-discount-code/${id}`);
    },
    onSuccess: () => {
      toast.success("Discount code deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      setShowDeleteModel(false);
    },
    onError: (error: AxiosError) => {
      toast.error("Failed to delete discount code");
    },
  });

  const handleDeleteClick = (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteModel(true);
  };

  const onSubmit = (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error("You can only have 8 discount codes");
      return;
    }

    createDiscountCodeMutation.mutate(data);
  };

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl text-white font-semibold">Discount Codes</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setShowModel(true)}
        >
          <Plus size={20} />
          Create Discount
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center text-white">
        <Link href="/dashboard" className="text-[#80Deea] cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Discount Codes</span>
      </div>

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>
        {isLoading ? (
          <p className="text-gray-400 text-center">Loading discounts...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Discount Type</th>
                <th className="p-3 text-left">Discount Value</th>
                <th className="p-3 text-left">Discount Code</th>
                {/* <th className="p-3 text-left">Min Order Amount</th>
                <th className="p-3 text-left">Max Discount Amount</th>
                <th className="p-3 text-left">Start Date</th>
                <th className="p-3 text-left">End Date</th> */}
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes?.map((discount: any) => (
                <tr
                  key={discount?.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="p-3">{discount?.public_name}</td>
                  <td className="p-3 capitalize">
                    {discount?.discount_type === "percentage"
                      ? `Percentage (%)`
                      : `Flat ($)`}
                  </td>
                  <td className="p-3">
                    {discount?.discount_type === "percentage"
                      ? `${discount?.discount_value}%`
                      : `$${discount?.discount_value}`}
                  </td>
                  <td className="p-3">{discount?.discount_code}</td>
                  {/* <td className="p-3">{discount?.min_order_amount}</td>
                  <td className="p-3">{discount?.max_discount_amount}</td>
                  <td className="p-3">{discount.start_date}</td>
                  <td className="px-4 py-2 text-white">{discount.end_date}</td> */}
                  <td className="p-3">
                    <button
                      className="text-red-400 hover:text-red-300 transition"
                      onClick={() => handleDeleteClick(discount)}
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && discountCodes?.length === 0 && (
          <p className="pt-6 text-gray-400 text-center">
            No discount codes Available
          </p>
        )}
      </div>

      {/* Create Discount model */}
      {showModel && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-lg font-semibold text-white">
                Create Discount Code
              </h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowModel(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
              {/* public name */}
              <Input
                label="Title (Public Name)"
                placeholder="Enter discount title"
                {...register("public_name", {
                  required: "Title is required",
                })}
              />
              {errors.public_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.public_name.message}
                </p>
              )}

              {/* discount type */}
              <div className="mt-2">
                <label
                  htmlFor="discount_type"
                  className="block font-semibold text-gray-300 mb-1"
                >
                  Discount Type
                </label>
                <Controller
                  name="discount_type"
                  control={control}
                  rules={{
                    required: "Discount type is required",
                  }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-2 border outline-none border-gray-700 bg-transparent rounded-md text-white"
                    >
                      <option value="">Select discount type</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount ($)</option>
                    </select>
                  )}
                />
                {errors.discount_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discount_type.message}
                  </p>
                )}
              </div>

              {/* discount value */}
              <div className="mt-2">
                <Input
                  label="Discount Value"
                  type="number"
                  min={1}
                  placeholder="Enter discount value"
                  {...register("discount_value", {
                    required: "Discount value is required",
                  })}
                />
                {errors.discount_value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discount_value.message}
                  </p>
                )}
              </div>

              {/* discount code */}
              <div className="mt-2">
                <Input
                  label="Discount Code"
                  placeholder="Enter discount code"
                  {...register("discount_code", {
                    required: "Discount code is required",
                  })}
                />
                {errors.discount_code && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discount_code.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2"
                disabled={createDiscountCodeMutation.isPending}
              >
                {createDiscountCodeMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={18} />
                    Create
                  </>
                )}
              </button>

              {createDiscountCodeMutation.isError && (
                <p className="text-red-500 text-sm mt-2">
                  {(
                    createDiscountCodeMutation.error as AxiosError<{
                      message: string;
                    }>
                  ).response?.data?.message || "Something went wrong"}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {showDeleteModel && selectedDiscount && (
        <DeleteDiscountCodeModal
          discount={selectedDiscount}
          onClose={() => setShowDeleteModel(false)}
          onConfirm={() =>
            deleteDiscountCodeMutation.mutate(selectedDiscount.id)
          }
        />
      )}
    </div>
  );
};

export default Page;
