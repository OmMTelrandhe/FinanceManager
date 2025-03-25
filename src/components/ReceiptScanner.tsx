import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Camera,
  Upload,
  Loader2,
  Receipt,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";
import { cn } from "../utils/cn";
import { PDFDocument } from "pdf-lib";

type ReceiptScannerProps = {
  onReceiptData: (data: ReceiptData) => void;
  apiKey?: string;
};

export type ReceiptData = {
  amount?: number;
  date?: string;
  description?: string;
  items?: string[];
  merchant?: string;
};

export default function ReceiptScanner({
  onReceiptData,
  apiKey,
}: ReceiptScannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  // Function to clear the preview
  const clearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setFileType(null);
      setError(null);
    }
  }, [previewUrl]);

  // Function to convert file to base64
  const fileToGenerativePart = async (file: File) => {
    // For PDF files, extract the first page and convert to image
    if (file.type === "application/pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        // Get the first page
        if (pdfDoc.getPageCount() === 0) {
          throw new Error("PDF has no pages");
        }

        // Convert the first page to PNG format
        const pngBytes = await pdfDoc.saveAsBase64({ dataUri: true });
        const base64Data = pngBytes.split(",")[1];

        return {
          inlineData: { data: base64Data, mimeType: "application/pdf" },
        };
      } catch (error) {
        console.error("Error processing PDF:", error);
        throw new Error("Failed to process PDF file");
      }
    } else {
      // For image files, use the original method
      const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Get the result as a string
          const dataUrl = reader.result as string;
          // Remove the data URL prefix (e.g., data:image/png;base64,)
          const base64Data = dataUrl.split(",")[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(file);
      });
      return {
        inlineData: {
          data: await base64EncodedDataPromise,
          mimeType: file.type,
        },
      };
    }
  };

  // Process receipt with Gemini API
  const processReceipt = async (file: File) => {
    if (!apiKey) {
      setError("API key is not configured. Please add a Gemini API key.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Initialize Gemini API
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Prepare the image
      const imagePart = await fileToGenerativePart(file);

      // Create prompt for receipt analysis
      const prompt = `Analyze this receipt image and extract the following information in JSON format:
      - total amount (as a number without currency symbol)
      - date (in YYYY-MM-DD format)
      - merchant/store name
      - list of purchased items
      
      Return ONLY a valid JSON object with these fields: amount, date, merchant, items (as an array of strings). 
      If you can't determine a value, omit that field from the JSON.`;

      // Generate content
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not extract valid JSON from the response");
      }

      // Parse the JSON
      const receiptData = JSON.parse(jsonMatch[0]) as ReceiptData;

      // Create description from items only (without merchant name)
      if (receiptData.items && receiptData.items.length > 0) {
        receiptData.description =
          receiptData.items.slice(0, 3).join(", ") +
          (receiptData.items.length > 3 ? "..." : "");
      } else if (receiptData.merchant) {
        // Fallback to merchant only if no items are available
        receiptData.description = receiptData.merchant;
      }

      // Pass the data to the parent component
      onReceiptData(receiptData);
    } catch (err) {
      console.error("Error processing receipt:", err);
      setError(
        "Failed to process receipt. Please try again or enter details manually."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        setError("Please upload an image or PDF file");
        return;
      }

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      // Store file type along with the URL
      setPreviewUrl(objectUrl);
      setFileType(file.type);

      try {
        // Process the receipt
        await processReceipt(file);
      } catch (err) {
        console.error("Error processing file:", err);
        setError(
          "Failed to process file. Please try again or enter details manually."
        );
      }

      // Clean up preview URL
      return () => URL.revokeObjectURL(objectUrl);
    },
    [apiKey]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".heic", ".heif"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <div className="mb-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="py-4 flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-600">Processing receipt...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative">
            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearPreview();
              }}
              className="absolute -top-2 -right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1 z-10 transition-colors"
              aria-label="Remove receipt"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>

            {previewUrl && fileType === "application/pdf" ? (
              <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-md border border-gray-200 max-h-40 mx-auto">
                <FileText className="h-16 w-16 text-blue-500 mb-2" />
                <p className="text-sm font-medium text-gray-700">PDF Receipt</p>
              </div>
            ) : (
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="max-h-40 mx-auto rounded-md"
              />
            )}
            <div className="mt-2 text-sm text-gray-600">
              {error ? (
                <p className="text-red-500 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </p>
              ) : (
                <p>Click or drag to replace</p>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4">
            <Receipt className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Scan Receipt</p>
            <p className="text-xs text-gray-500 mt-1">
              Drag & drop a receipt image or PDF file, or click to browse
            </p>
          </div>
        )}
      </div>
      {error && !previewUrl && (
        <p className="mt-2 text-xs text-red-500 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}
