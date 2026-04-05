import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// 🔥 dynamic import (THIS is the key fix)
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  const [editorValue, setEditorValue] = useState(value || "");
  const quillRef = useRef(false);

  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = true; // Mark as mounted

      // Fix: Ensure only one toolbar is present
      setTimeout(() => {
        document.querySelectorAll(".ql-toolbar").forEach((toolbar, index) => {
          if (index > 0) {
            toolbar.remove(); // Remove extra toolbars
          }
        });
      }, 100); // Short delay ensures Quil is fully initialized
    }
  }, []);

  return (
    <div className="relative">
      {/* No duplicate Quil instance */}
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(content: any) => {
          setEditorValue(content);
          onChange(content);
        }}
        modules={{
          toolbar: [
            [{ font: [] }], // Font picker
            [{ header: [1, 2, 3, 4, 5, 6, false] }], // Header picker
            [{ size: ["small", false, "large", "huge"] }], // Font size
            ["bold", "italic", "underline", "strike"], // Text formatting
            [{ color: [] }, { background: [] }], // Color picker
            [{ script: "super" }, { script: "sub" }], // SuperScript / SubScript formatting
            [{ list: "ordered" }, { list: "bullet" }], // List formatting
            [{ indent: "-1" }, { indent: "+1" }], // Indentation
            [{ align: [] }], // Alignment
            ["blockquote", "code-block"], // Blockquote / Code-block formatting
            ["link", "image", "video"],
            ["clean"],
          ],
        }}
        placeholder="Write a detailed product description here..."
        className="bg-transparent border border-gray-700 text-white rounded-md"
        style={{
          minHeight: "250px",
        }}
        // formats={[
        //   "header",
        //   "bold",
        //   "italic",
        //   "underline",
        //   "strike",
        //   "list",
        //   "bullet",
        //   "indent",
        //   "color",
        //   "background",
        //   "link",
        //   "image",
        //   "video",
        // ]}
      />
      <style>
        {`
        .ql-toolbar {
            background: transparent; /* Dark toolbar */
            border-color: #444;
        }
        .ql-container {
            background: transparent !important;
            border-color: #444;
            color: white; /* Text color inside editor */
        }
        .ql-picker {
            color: white !important;
        }
        .ql-editor {
            min-height: 200px; /* Adjust editor height here */
        }
        .ql-snow {
            border-color: #444 !important;
        }
        .ql-editor.ql-blank::before {
            color: #aaa !important; /* Placeholder text color */
        }
        .ql-picker-options {
            background: #333 !important; /* fix Dropdown color */
            color: white !important;
        }
        .ql-picker-item {
            color: white !important;
        }
        .ql-stroke {
            stroke: white !important;
        }
        `}
      </style>
    </div>
  );
};

export default RichTextEditor;
