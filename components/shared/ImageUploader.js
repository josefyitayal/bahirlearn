'use client';

import { useState, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


export default function ImageUploader({
  onUpload,
  prevImage=null,
  minWidth = 300,
  minHeight = 300,
  maxSizeMB = 3,
}) {
  const [preview, setPreview] = useState(prevImage ?? null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (prevImage) setPreview(prevImage);
  }, [prevImage]);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate image dimensions
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        if (img.width < minWidth || img.height < minHeight) {
          toast({
            variant: 'destructive',
            title: 'Image too small',
            description: `Minimum size: ${minWidth}x${minHeight}px`,
          });
          return;
        }

        try {
          // ✅ Compress image before uploading
          const compressedFile = await imageCompression(file, {
            maxSizeMB,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });

          const formData = new FormData();
          formData.append('file', compressedFile);
          setUploading(true);

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          setPreview(data.url);
          onUpload(data.url);
        } catch (err) {
          console.error('Upload failed', err);
          toast({
            variant: 'destructive',
            title: 'Upload error',
            description: 'Could not upload image.',
          });
        } finally {
          setUploading(false);
        }
      };
    },
    [onUpload, minWidth, minHeight, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  return (
    <Card className="w-full border-dashed border-2 border-muted hover:border-primary transition-colors duration-200">
      <CardContent
        {...getRootProps()}
        className="flex flex-col items-center justify-center p-6 cursor-pointer text-center space-y-3"
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" size={20} />
            <span>Uploading...</span>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-3">
            <NextImage
              src={preview}
              alt="Uploaded"
              width={160}
              height={160}
              className="rounded-lg border shadow-sm object-cover"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
              }}
            >
              Change Image
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {isDragActive ? 'Drop here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-muted-foreground">
              Max size: {maxSizeMB}MB after compression. Min: {minWidth}x{minHeight}px.
            </p>
            <Button size="sm" type="button">
              Select Image
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}