"use client";
import { useQuery } from "@tanstack/react-query";
import ImagePlaceHolder from "apps/seller-ui/src/shared/components/image-placeholder";
import { ChevronRight, Wand, X } from "lucide-react";
import ColorSelector from "packages/components/color-selector";
import CustomProperties from "packages/components/custom-properties";
import CustomSpecifications from "packages/components/custom-specifications";
import Input from "packages/components/input";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import axiosInstance from "../../../utils/axiosInstance";
import RichTextEditor from "packages/rich-text-editor";
import SizeSelector from "packages/components/size-selector";
import Image from "next/image";
import { enhancements } from "../../../utils/AI.enhancements";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface UploadedImage {
  file_url: string;
  fileId: string;
}

function Page() {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(true);
  const [activeEffect, setActiveEffect] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/v1/get-categories");
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
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

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || [];

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subCategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  console.log(categories, subCategoriesData);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axiosInstance.post("/product/api/v1/create-product", data);
      router.push("/dashboard/all-products");
    } catch (error: any) {
      console.log(error);
      // toast.error(error?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // const convertFileToBase64 = (file: File) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = (error) => reject(error);
  //   });
  // };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;

    setPictureUploadingLoader(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post(
        "/product/api/v1/upload-product-image",
        formData,
      );

      const updatedImages = [...images];

      const uploadedImage: UploadedImage = {
        file_url: response.data.file_url,
        fileId: response.data.fileId,
      };

      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPictureUploadingLoader(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];

      const imageToDelete = updatedImages[index];
      if (imageToDelete && typeof imageToDelete === "object") {
        // delete our picture
        await axiosInstance.post("/product/api/v1/delete-product-image", {
          // data: {
          fileId: imageToDelete.fileId!,
          // },
        });
      }

      updatedImages.splice(index, 1);
      // Add null placeholder
      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    }
  };

  const applyTransformation = async (transformation: string) => {
    if (!selectedImage || processing) return;

    setProcessing(true);
    setActiveEffect(transformation);

    try {
      // Parse existing URL safely
      const url = new URL(selectedImage);

      // Replace or append the 'tr' parameter for ImageKit transformations
      url.searchParams.set("tr", transformation);

      // Optional: reduce size for preview in modal to prevent 504s
      url.searchParams.set("w", "450"); // modal width
      url.searchParams.set("h", "250"); // modal height
      url.searchParams.set("q", "75"); // quality for faster load

      setSelectedImage(url.toString());
    } catch (error) {
      console.error("Failed to apply transformation:", error);
      setSelectedImage("/images/placeholder.png"); // fallback
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveDraft = () => {};

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Heading & Breadcrumbs */}
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>
      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>

      {/* Content Layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Left Column - Image upload section */}
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              pictureUploadingLoader={pictureUploadingLoader}
              images={images}
              small={false}
              index={0}
              onImageChange={handleImageChange}
              setSelectedImage={setSelectedImage}
              onRemove={handleRemoveImage}
            />
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {images?.slice(1)?.map((_, index) => (
              <ImagePlaceHolder
                setOpenImageModal={setOpenImageModal}
                size="765 x 850"
                pictureUploadingLoader={pictureUploadingLoader}
                images={images}
                key={index}
                small={true}
                index={index + 1}
                onImageChange={handleImageChange}
                setSelectedImage={setSelectedImage}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>

        {/* Right Column - Form fields */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* Product Title Input */}
            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register("title", { required: "Title is required" })}
              />

              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}

              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 words)"
                  placeholder="Enter short description for quick view"
                  {...register("short_description", {
                    required: "Short description is required",
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description must be less than 150 words (Current: ${wordCount} words)`
                      );
                    },
                  })}
                />
                {errors.short_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.short_description.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="ex: apple, flagship"
                  {...register("tags", {
                    required: "Separate related products tags with commas,",
                  })}
                />

                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Warranty *"
                  placeholder="ex: 1 Year / No Warranty"
                  {...register("warranty", {
                    required: "Warranty information is required",
                  })}
                />

                {errors.warranty && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.warranty.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product_slug"
                  {...register("slug", {
                    required: "Slug is required",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "Invalid slug format! Slug must be lowercase, alphanumeric, and can include hyphens",
                    },
                    minLength: {
                      value: 3,
                      message: "Slug must be at least 3 characters long",
                    },
                    maxLength: {
                      value: 50,
                      message: "Slug must be less than 50 characters",
                    },
                  })}
                />

                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Brand"
                  placeholder="Apple"
                  {...register("brand")}
                />

                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.brand.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <ColorSelector control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On Delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on Delivery is required",
                  })}
                  defaultValue="yes"
                  className="w-full p-2 border outline-none border-gray-700 bg-transparent rounded-md text-white"
                >
                  <option value={"yes"} className="bg-black">
                    Yes
                  </option>
                  <option value={"no"} className="bg-black">
                    No
                  </option>
                </select>
                {errors?.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="w-2/4">
              <label className="block font-semibold text-gray-300 mb-1">
                Category *
              </label>
              {isLoading ? (
                <p className="text-gray-400"> Loading categories...</p>
              ) : isError ? (
                <p className="text-red-500 text-xs mt-1">
                  {" "}
                  Error fetching categories
                </p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{
                    required: "Category is required",
                  }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-2 border outline-none border-gray-700 bg-transparent rounded-md text-white"
                    >
                      <option value={""} className="bg-black">
                        Select category
                      </option>
                      {categories?.map((category: string) => (
                        <option
                          key={category}
                          value={category}
                          className="bg-black"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors?.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Sub Category *
                </label>
                {isLoading ? (
                  <p className="text-gray-400"> Loading sub categories...</p>
                ) : isError ? (
                  <p className="text-red-500 text-xs mt-1">
                    {" "}
                    Error fetching sub categories
                  </p>
                ) : (
                  <Controller
                    name="subCategory"
                    control={control}
                    rules={{
                      required: "Sub category is required",
                    }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full p-2 border outline-none border-gray-700 bg-transparent rounded-md text-white"
                      >
                        <option value={""} className="bg-black">
                          Select sub category
                        </option>
                        {subCategories?.map((subCategory: string) => (
                          <option
                            key={subCategory}
                            value={subCategory}
                            className="bg-black"
                          >
                            {subCategory}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )}
                {errors?.subCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subCategory.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description * (Min 100 words)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed description is required",
                    validate: (value) => {
                      const wordCount = value
                        ?.split(/\s+/)
                        .filter((word: string) => word).length;
                      return (
                        wordCount <= 100 ||
                        "Description must be at least 100 words"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors?.detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Video URL"
                  placeholder="https://www.youtube.com/embed/tqtvpfcW9_Q?si=uTQSXzzpUztMhuPJ"
                  {...register("video_url", {
                    pattern: {
                      value:
                        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/embed\/[a-zA-Z0-9_-]+$/,
                      message:
                        "Please enter a valid YouTube embed URL! Use format: https://www.youtube.com/embed/VIDEO_ID",
                    },
                  })}
                />
                {errors?.video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Regular Price"
                  type="number"
                  placeholder="Enter regular price 20$"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Regular price must be at least 1",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Regular price must be a number";
                      return true;
                    },
                  })}
                />
                {errors?.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Sale Price"
                  type="number"
                  placeholder="Enter sale price 15$"
                  {...register("sale_price", {
                    required: "Sale price is required",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Sale price must be at least 1",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Sale price must be a number";
                      if (value && regularPrice <= value)
                        return "Sale price must be less than regular price";
                      return true;
                    },
                  })}
                />
                {errors?.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Stock *"
                  type="number"
                  placeholder="Enter stock quantity e.g: 100"
                  {...register("stock", {
                    required: "Stock is required",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Stock must be at least 1",
                    },
                    max: {
                      value: 1000,
                      message: "Stock must be less than 1,000",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Stock must be a number";
                      if (!Number.isInteger(value))
                        return "Stock must be a whole number";
                      return true;
                    },
                  })}
                />
                {errors?.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>

              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1">
                  Select Discount Codes (optional)
                </label>
                {discountLoading ? (
                  <p className="text-gray-400 text-center">
                    Loading discounts...
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((discount: any) => (
                      <button
                        key={discount?.id}
                        type="button"
                        className={`px-3 py-1 text-sm font-semibold rounded-md border ${
                          watch("discount_codes")?.includes(discount?.id)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                        }`}
                        onClick={() => {
                          const currentSelection =
                            watch("discount_codes") || [];
                          const updatedSelection = currentSelection?.includes(
                            discount?.id,
                          )
                            ? currentSelection.filter(
                                (id: string) => id !== discount?.id,
                              )
                            : [...currentSelection, discount?.id];
                          setValue("discount_codes", updatedSelection);
                        }}
                      >
                        {discount?.public_name} ({discount.discount_value})
                        {discount?.discount_type === "percentage" ? " %" : " $"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 mb-4">
              <h2 className="text-lg font-semibold">Enhance Product Image</h2>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setOpenImageModal(false)}
              />
            </div>

            {/* Image */}
            {selectedImage ? (
              <>
                <div className="w-full h-[250px] flex items-center justify-center border border-gray-600 rounded-md overflow-hidden">
                  <Image
                    src={selectedImage}
                    alt="Product image"
                    width={350}
                    height={250}
                    className="object-contain"
                    placeholder="blur"
                    blurDataURL="/images/placeholder.png" // local placeholder
                    onError={(e) => {
                      // Fallback if ImageKit fails
                      e.currentTarget.src = "/images/placeholder.png";
                    }}
                  />
                </div>

                {/* Enhancements */}
                <div className="mt-4 space-y-2">
                  <h3 className="text-white text-sm font-semibold">
                    Ai Enhancements
                  </h3>
                  <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto">
                    {enhancements?.map(({ label, effect }) => (
                      <button
                        key={label}
                        className={`p-2 rounded-md flex items-center gap-2 ${
                          activeEffect === effect
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        onClick={() => applyTransformation(effect)}
                        disabled={processing}
                      >
                        <Wand size={16} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-[250px] flex items-center justify-center border border-gray-600 text-gray-400">
                No image available
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-gray-700 text-white rounded-md"
          >
            Save Draft
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-700 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}

export default Page;
