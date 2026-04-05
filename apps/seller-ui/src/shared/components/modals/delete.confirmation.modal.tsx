import { X } from "lucide-react";
import React from "react";

const DeleteConfirmationModal = ({
  product,
  onClose,
  onConfirm,
  onRestore,
}: any) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg md:w-[450px] w-full shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h2 className="text-xl text-white">Delete Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {/* Warning message */}
        <div className="mb-4">
          <p className="text-gray-300 mt-4">
            Are you sure you want to delete this product{" "}
            <span className="font-semibold text-white">{product?.title}</span>?
            <br />
            This product will be moved to a **delete state** and permanetly
            removed **after 24 hours**. You can restore it within this period.
          </p>
        </div>

        {/* Footer Action buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={!product?.isDeleted ? onConfirm : onRestore}
            className={` ${product?.isDeleted ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} px-4 py-2 rounded-md text-white font-semibold transition`}
          >
            {!product?.isDeleted ? "Delete" : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
