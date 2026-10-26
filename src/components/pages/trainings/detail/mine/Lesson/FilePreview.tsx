import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FilePreviewModal } from "@/components/site/FilePreviewModal";

export function isInsideFilePreview(target: EventTarget | null): boolean {
  return (
    target instanceof Element
    && target.closest("[data-file-preview]")
    !== null
  );
}

export function isFilePreviewOpen(): boolean {
  return (
    typeof document !== "undefined"
    && document.querySelector("[data-file-preview]")
    !== null);
}

interface FilePreviewPortalProps {
  url: string | null;
  title: string;
  onClose: () => void;
  onDownload?: () => void;
}

export function FilePreviewPortal({ url, title, onClose, onDownload }: FilePreviewPortalProps) {
  useEffect(() => {
    if (!url) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [url, onClose]);

  if (!url || typeof document === "undefined") return null;

  return createPortal(
    <div
      data-file-preview=""
      className="pointer-events-auto relative z-60"
    >
      <FilePreviewModal
        url={url}
        title={title}
        onClose={onClose}
        onDownload={onDownload}
      />
    </div>,
    document.body
  );
}