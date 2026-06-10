import { useRef } from "react";
import { useUpload } from "@workspace/object-storage-web";
import { objectUrl } from "@/lib/storage-utils";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (objectPath: string) => void;
  onClear?: () => void;
  className?: string;
  accept?: string;
  label?: string;
}

export function ImageUploader({
  value,
  onChange,
  onClear,
  className = "",
  accept = "image/*",
  label = "Subir imagen",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, progress, error } = useUpload({
    onSuccess: (res) => onChange(res.objectPath),
  });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const previewUrl = objectUrl(value);

  return (
    <div className={`space-y-2 ${className}`}>
      {previewUrl ? (
        <div className="relative w-24 h-24 border border-border bg-muted">
          <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-destructive/80"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ) : (
        <div className="w-24 h-24 border border-dashed border-border bg-muted flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />

      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest border border-border px-3 py-2 hover:border-primary transition-colors disabled:opacity-50"
      >
        <Upload className="h-3 w-3" />
        {isUploading ? `${progress}%` : label}
      </button>

      {error && <p className="text-xs font-mono text-destructive">{error.message}</p>}
    </div>
  );
}
