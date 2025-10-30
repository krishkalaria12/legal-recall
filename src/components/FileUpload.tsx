"use client";
import { useUploadThing } from "@/utils/uploadthing";
import { generateClientDropzoneAccept, generatePermittedFileTypes } from "uploadthing/client";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// https://github.com/aws/aws-sdk-js-v3/issues/4126

const FileUpload = () => {
  const router = useRouter();
  const [files, setFiles] = React.useState<File[]>([]);
  const { mutate, isLoading } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
      file_url,
    }: {
      file_key: string;
      file_name: string;
      file_url: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
        file_url,
      });
      return response.data;
    },
  });

  const { startUpload, isUploading, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: (res) => {
      const f = res?.[0];
      if (!f) {
        toast.error("Upload failed");
        return;
      }
      mutate(
        {
          file_key: f.key,
          file_name: f.name,
          file_url: f.url,
        },
        {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created!");
            router.push(`/chat/${chat_id}`);
          },
          onError: (err) => {
            toast.error("Error creating chat");
            console.error(err);
          },
        }
      );
    },
    onUploadError: (e) => {
      console.error(e);
      toast.error("Upload error");
    },
  });

  const accept = routeConfig
    ? generateClientDropzoneAccept(
        generatePermittedFileTypes(routeConfig).fileTypes
      )
    : { "application/pdf": [".pdf"] };

  const { getRootProps, getInputProps } = useDropzone({
    accept,
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large");
        return;
      }
      setFiles(acceptedFiles);
      await startUpload(acceptedFiles);
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {isUploading || isLoading ? (
          <>
            {/* loading state */}
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling Tea to GPT...
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
