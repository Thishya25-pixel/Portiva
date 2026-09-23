"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = "portiva_uploads";
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export type ImageUploadMode = "avatar" | "background" | "gallery";

/** Delivery transformations injected into the returned URL (auto format/quality + sane sizes). */
const TRANSFORMS: Record<ImageUploadMode, string> = {
  avatar: "f_auto,q_auto,c_fill,g_face,w_600,h_600",
  background: "f_auto,q_auto,c_limit,w_2000",
  gallery: "f_auto,q_auto,c_limit,w_1400",
};

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface BaseProps {
  isPro: boolean;
  onOpenUpgradeModal: () => void;
  disabled?: boolean;
  className?: string;
}

interface SingleImageProps extends BaseProps {
  mode: "avatar" | "background";
  value: string;
  onChange: (url: string) => void;
}

interface GalleryProps extends BaseProps {
  mode: "gallery";
  value: string[];
  /** Receives the full next array (existing + newly uploaded). */
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export type ImageUploadProps = SingleImageProps | GalleryProps;

interface CloudinaryResponse {
  secure_url?: string;
  error?: { message?: string };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function withTransform(url: string, transform: string): string {
  return url.includes("/upload/")
    ? url.replace("/upload/", `/upload/${transform}/`)
    : url;
}

function uploadToCloudinary(
  file: File,
  onProgress: (fraction: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!CLOUD_NAME) {
      reject(
        new Error(
          "Uploads aren't configured yet (missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME).",
        ),
      );
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.upload.onprogress = (e: ProgressEvent) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };

    xhr.onload = () => {
      let body: CloudinaryResponse = {};
      try {
        body = JSON.parse(xhr.responseText) as CloudinaryResponse;
      } catch {
        /* fall through to the generic error below */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) {
        resolve(body.secure_url);
      } else {
        reject(new Error(body.error?.message ?? "Upload failed. Please try again."));
      }
    };

    xhr.onerror = () => reject(new Error("Network error. Check your connection."));
    xhr.send(form);
  });
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function ImageUpload(props: ImageUploadProps) {
  const { isPro, onOpenUpgradeModal, disabled = false, className = "" } = props;

  const inputId = useId();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Always read the freshest props after async uploads finish.
  const latest = useRef<ImageUploadProps>(props);
  useEffect(() => {
    latest.current = props;
  });

  const isGallery = props.mode === "gallery";
  const maxImages = props.mode === "gallery" ? (props.maxImages ?? 12) : 1;
  const galleryCount = props.mode === "gallery" ? props.value.length : 0;
  const galleryFull = props.mode === "gallery" && galleryCount >= maxImages;
  const busy = progress !== null;

  async function handleFiles(fileList: FileList | File[]) {
    if (!isPro) {
      onOpenUpgradeModal();
      return;
    }

    setError(null);
    let files = Array.from(fileList);
    if (files.length === 0) return;

    if (!isGallery) {
      files = files.slice(0, 1);
    } else {
      const slots = maxImages - galleryCount;
      if (slots <= 0) {
        setError(`You can add up to ${maxImages} images.`);
        return;
      }
      if (files.length > slots) {
        files = files.slice(0, slots);
        setError(`Only the first ${slots} image${slots === 1 ? "" : "s"} were added (limit ${maxImages}).`);
      }
    }

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Please choose a JPG, PNG, WebP, GIF or AVIF image.");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`"${file.name}" is over 10 MB. Try a smaller image.`);
        return;
      }
    }

    const urls: string[] = [];
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadToCloudinary(files[i], (fraction) =>
          setProgress(Math.round(((i + fraction) / files.length) * 100)),
        );
        urls.push(withTransform(url, TRANSFORMS[props.mode]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setProgress(null);
    }

    if (urls.length === 0) return;

    const current = latest.current;
    if (current.mode === "gallery") {
      current.onChange([...current.value, ...urls]);
    } else {
      current.onChange(urls[0]);
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) void handleFiles(files);
    e.target.value = ""; // allow re-selecting the same file
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    if (busy || disabled || galleryFull) return;
    void handleFiles(e.dataTransfer.files);
  }

  const dropLabel =
    props.mode === "avatar"
      ? props.value
        ? "Replace photo"
        : "Upload a photo"
      : props.mode === "background"
        ? props.value
          ? "Replace background"
          : "Upload a background image"
        : galleryFull
          ? "Gallery is full"
          : "Add images";

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current image (single modes). Removing stays available even without Pro. */}
      {props.mode !== "gallery" && props.value && (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={props.value}
            alt=""
            className={
              props.mode === "avatar"
                ? "h-16 w-16 shrink-0 rounded-full border-2 border-indigo-500/30 object-cover"
                : "h-16 w-28 shrink-0 rounded-lg border border-white/10 object-cover"
            }
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-200">
              {props.mode === "avatar" ? "Current photo" : "Current background"}
            </p>
            <p className="truncate font-mono text-[11px] text-slate-500">{props.value}</p>
          </div>
          <button
            type="button"
            onClick={() => props.onChange("")}
            className="rounded-lg px-2.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10"
          >
            Remove
          </button>
        </div>
      )}

      {isPro ? (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-5 text-center transition focus-within:ring-2 focus-within:ring-indigo-500/40 ${
            dragOver
              ? "border-indigo-400 bg-indigo-500/10"
              : "border-white/15 bg-white/[0.02] hover:bg-white/[0.05]"
          } ${busy || disabled || galleryFull ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            id={inputId}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple={isGallery}
            disabled={busy || disabled || galleryFull}
            onChange={onInputChange}
            className="sr-only"
          />

          {busy ? (
            <>
              <span className="text-sm font-medium text-slate-200">
                Uploading… {progress}%
              </span>
              <span className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-indigo-500 transition-[width]"
                  style={{ width: `${progress ?? 0}%` }}
                />
              </span>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-indigo-300">{dropLabel}</span>
              <span className="text-[11px] text-slate-500">
                {isGallery
                  ? `Tap to choose or drop files · ${galleryCount}/${maxImages}`
                  : "Tap to choose or drop a file"}{" "}
                · JPG, PNG, WebP up to 10 MB
              </span>
            </>
          )}
        </label>
      ) : (
        <button
          type="button"
          onClick={onOpenUpgradeModal}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:border-amber-300/60 hover:from-amber-500/20 hover:to-indigo-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
        >
          <span aria-hidden="true">🔒</span> Upgrade to Pro to Upload
        </button>
      )}

      {error && (
        <p role="alert" className="text-xs leading-5 text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}