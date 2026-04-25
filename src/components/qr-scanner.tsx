"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setIsScanning(true);

        // Start continuous scanning
        if (readerRef.current) {
          readerRef.current.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result, error) => {
              if (result) {
                onScan(result.getText());
                // Optional: stop after successful scan
                // stopScanning();
              }
              if (error && !(error instanceof NotFoundException)) {
                console.error("QR Scanner error:", error);
              }
            }
          );
        }
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setHasPermission(false);
      onError?.("Unable to access camera. Please grant camera permissions.");
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-slate-900 aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
            <Camera className="w-12 h-12 text-white/50" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!isScanning ? (
          <Button
            onClick={startScanning}
            className="flex-1 bg-slate-900"
            disabled={hasPermission === false}
          >
            <Camera className="w-4 h-4 mr-2" />
            Start Scanner
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="outline"
            className="flex-1"
          >
            <CameraOff className="w-4 h-4 mr-2" />
            Stop Scanner
          </Button>
        )}
      </div>

      {hasPermission === false && (
        <p className="text-xs text-red-500 text-center">
          Camera permission denied. Please enable camera access in your browser settings.
        </p>
      )}
    </div>
  );
}
