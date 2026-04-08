"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Search,
  Pencil,
  Trash2,
  Eye,
  Plus,
  BarChart,
  Star,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import axiosInstance from "apps/seller-ui/src/app/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import DeleteConfirmationModal from "apps/seller-ui/src/shared/components/modals/delete.confirmation.modal";
import toast from "react-hot-toast";

const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/v1/get-shop-products");
  return res?.data?.products;
};

const deleteProduct = async (productId: string) => {
  const res = await axiosInstance.delete(
    `/product/api/v1/delete-product/${productId}`,
  );
  return res?.data;
};

const restoreProduct = async (productId: string) => {
  const res = await axiosInstance.put(
    `/product/api/v1/restore-product/${productId}`,
  );
  return res?.data;
};

const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });

  // Delete Product Muatation
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete product");
    },
  });

  // Restore Product Muatation
  const restoreProductMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => {
          console.log(row.original);
          return (
            <Image
              src={row.original.images[0]?.url}
              alt={row.original.images[0]?.url}
              width={200}
              height={200}
              loading="eager"
              className="w-12 h-12 rounded-md object-cover"
            />
          );
        },
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => (
          <span className="t">${row.original.sale_price}</span>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={
              row.original.stock < 10 ? "text-red-500" : "text-green-500"
            }
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }: any) => (
          <span className="">{row.original.category}</span>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={18} />
            <span className="text-white">{row.original.ratings || 5}</span>
          </div>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }: { row: any }) => (
          <div className="flex gap-3">
            <Link
              href={`/products/${row.original.id}`}
              className="text-blue-400 hover:text-blue-300 transition"
              title="View Product"
            >
              <Eye size={18} />
            </Link>
            <Link
              href={`/products/edit/${row.original.id}`}
              className="text-yellow-400 hover:text-yellow-300 transition"
              title="Edit Product"
            >
              <Pencil size={18} />
            </Link>
            <button
              // onClick={() => {
              //   openAnalyticsModal(row.original);
              // }}
              className="text-green-400 hover:text-green-300 transition"
              title="Analytics"
            >
              <BarChart size={18} />
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="text-red-400 hover:text-red-300 transition"
              title="Delete Product"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    onGlobalFilterChange: setGlobalFilter,
  });

  const openDeleteModal = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  return (
    <div className="w-full min-h-screen p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">All Products</h2>
        <Link
          href="/dashboard/create-product"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center mb-4">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="text-gray-200" />
        <span className="text-white">All Products</span>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full bg-transparent text-white outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading products...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-900 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showDeleteModal && (
          <DeleteConfirmationModal
            product={selectedProduct}
            onConfirm={() => {
              deleteProductMutation.mutate(selectedProduct?.id);
            }}
            onRestore={() => {
              restoreProductMutation.mutate(selectedProduct?.id);
            }}
            onClose={() => {
              setShowDeleteModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProductList;
