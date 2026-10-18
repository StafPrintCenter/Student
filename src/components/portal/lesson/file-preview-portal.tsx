import { useEffect } from "react";
import { createPortal } from "react-dom";

import { FilePreviewModal } from "@/components/site/FilePreviewModal";

/**
 * À utiliser depuis un Dialog Radix : l'aperçu est monté dans <body> (portail), repéré par
 * l'attribut data-file-preview, pour échapper au transform du dialogue et à ses blocages.
 */

/** true si le clic / focus vient de l'aperçu (à passer dans onInteractOutside du Dialog parent) */
export function isInsideFilePreview(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("[data-file-preview]") !== null;
}

/** true tant qu'un aperçu est affiché (à passer dans onEscapeKeyDown du Dialog parent) */
export function isFilePreviewOpen(): boolean {
  return typeof document !== "undefined" && document.querySelector("[data-file-preview]") !== null;
}

interface FilePreviewPortalProps {
  url: string | null;
  title: string;
  onClose: () => void;
  onDownload?: () => void;
}

export function FilePreviewPortal({ url, title, onClose, onDownload }: FilePreviewPortalProps) {
  // Échap ferme l'aperçu (le Dialog parent ne se ferme pas, voir isFilePreviewOpen)
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
    // pointer-events-auto : Radix désactive les événements sur <body> tant qu'un dialogue modal est ouvert
    // z-[60] : au-dessus du dialogue (z-50)
    <div data-file-preview="" className="pointer-events-auto relative z-[60]">
      <FilePreviewModal url={url} title={title} onClose={onClose} onDownload={onDownload} />
    </div>,
    document.body
  );
}