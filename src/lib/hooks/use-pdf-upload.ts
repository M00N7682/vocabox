"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPE = "application/pdf";

type UploadState = {
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  storagePath: string | null;
  fileName: string | null;
  error: string | null;
};

export function usePdfUpload(academyId: string) {
  const [state, setState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    storagePath: null,
    fileName: null,
    error: null,
  });

  const upload = useCallback(
    async (file: File) => {
      // Validate type
      if (file.type !== ALLOWED_TYPE) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "PDF 파일만 업로드할 수 있습니다.",
        }));
        return;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "파일 크기는 50MB 이하여야 합니다.",
        }));
        return;
      }

      setState({
        status: "uploading",
        progress: 0,
        storagePath: null,
        fileName: file.name,
        error: null,
      });

      const supabase = createClient();
      const uuid = crypto.randomUUID();
      const path = `${academyId}/${uuid}.pdf`;

      const { error } = await supabase.storage
        .from("textbook-pdfs")
        .upload(path, file, {
          contentType: ALLOWED_TYPE,
          upsert: false,
        });

      if (error) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: error.message,
        }));
        return;
      }

      setState({
        status: "done",
        progress: 100,
        storagePath: path,
        fileName: file.name,
        error: null,
      });
    },
    [academyId]
  );

  const remove = useCallback(async () => {
    if (state.storagePath) {
      const supabase = createClient();
      await supabase.storage
        .from("textbook-pdfs")
        .remove([state.storagePath]);
    }

    setState({
      status: "idle",
      progress: 0,
      storagePath: null,
      fileName: null,
      error: null,
    });
  }, [state.storagePath]);

  const reset = useCallback(() => {
    setState({
      status: "idle",
      progress: 0,
      storagePath: null,
      fileName: null,
      error: null,
    });
  }, []);

  return { ...state, upload, remove, reset };
}
