import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Check, X, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const FILTERS = {
  Normal: "none",
  "B&W": "grayscale(100%)",
  Vintage: "sepia(80%) contrast(1.2)",
  Cinematic: "contrast(1.2) saturate(1.2)",
  Cool: "hue-rotate(-15deg) saturate(1.2)",
  Warm: "sepia(30%) saturate(1.4)",
};

interface ImageEditorProps {
  imageUrl: string;
  aspect?: number;
  onCancel: () => void;
  onComplete: (file: File) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export function ImageEditor({ imageUrl, aspect = 1, onCancel, onComplete }: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("Normal");
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    
    try {
      const image = await createImage(imageUrl);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No 2d context");
      }

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Apply selected filter to the drawing context
      ctx.filter = FILTERS[activeFilter as keyof typeof FILTERS] || "none";

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          setIsProcessing(false);
          return;
        }
        const file = new File([blob], "edited-image.jpeg", { type: "image/jpeg" });
        onComplete(file);
      }, "image/jpeg", 0.95);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black animate-fade-in flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2 z-10 shrink-0">
        <button onClick={onCancel} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-95">
          <X className="h-6 w-6" />
        </button>
        <span className="text-white font-medium">Edit Image</span>
        <button 
          onClick={handleDone} 
          disabled={isProcessing}
          className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors active:scale-95 disabled:opacity-50"
        >
          <Check className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 relative">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          style={{
             containerStyle: { backgroundColor: 'transparent' },
             mediaStyle: { filter: FILTERS[activeFilter as keyof typeof FILTERS] || "none" }
          }}
        />
      </div>

      {/* Toolbar */}
      <div className="shrink-0 bg-black/80 backdrop-blur-md pb-6 pt-4 px-4 border-t border-white/10 z-10 flex flex-col gap-4">
        
        {/* Zoom scale */}
        <div className="flex items-center gap-4 px-4">
          <span className="text-white/60 text-xs uppercase tracking-wider font-semibold">Zoom</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-primary h-1 rounded-full bg-white/20 appearance-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-2 px-1">
          {Object.entries(FILTERS).map(([name, cssFilter]) => (
            <button
              key={name}
              onClick={() => setActiveFilter(name)}
              className={cn(
                "flex flex-col items-center gap-1.5 shrink-0 transition-transform active:scale-95",
                activeFilter === name ? "text-primary" : "text-white/50 hover:text-white"
              )}
            >
              <div 
                className={cn(
                  "h-14 w-14 rounded-xl border-2 overflow-hidden relative",
                  activeFilter === name ? "border-primary" : "border-transparent"
                )}
              >
                <img 
                   src={imageUrl} 
                   style={{ filter: cssFilter, objectFit: 'cover', width: '100%', height: '100%' }}
                   alt={name}
                />
              </div>
              <span className="text-[10px] font-medium tracking-wide">{name}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
