import { useMutation } from "@tanstack/react-query";
import axios from "axios";
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

    shopCreateMutation.mutate(shopData);
  };

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

        <label className="block mb-1 text-gray-900">Bio *</label>
        <textarea
          rows={4}
          cols={10}
          placeholder="Shop Bio"
          {...register("bio", {
            required: "Shop bio is required",
          })}
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
        />
      </form>
    </div>
  );
}

export default CreateShop;
