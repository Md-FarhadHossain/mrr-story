'use client';

import { useRef, useState } from 'react';
import { upload } from '@imagekit/next';
import { Loader2, UploadCloud, X } from 'lucide-react';

interface ImageUploaderProps {
  name: string;
  defaultValue?: string;
  className?: string;
}

export default function ImageUploader({ name, defaultValue = '', className = '' }: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const authRes = await fetch('/api/imagekit-auth');
      if (!authRes.ok) throw new Error('Failed to get auth params');
      const { token, signature, expire, publicKey } = await authRes.json();

      const result = await upload({
        file,
        fileName: file.name,
        publicKey,
        token,
        signature,
        expire,
        useUniqueFileName: true,
      });

      if (result.url) {
        setImageUrl(result.url);
      }
    } catch (err) {
      console.error('ImageKit upload failed:', err);
      alert('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageItem = items.find((item) => item.kind === 'file' && item.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (file) await uploadFile(file);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      className={className}
      onPaste={handlePaste}
      tabIndex={0}
    >
      {imageUrl ? (
        <div style={{ position: 'relative', width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button
            type="button"
            onClick={handleRemoveImage}
            title="Remove image"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleImageUpload}
          disabled={isUploading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px 16px',
            border: '1px dashed var(--border-color)',
            background: 'var(--bg-input, transparent)',
            color: 'var(--text-secondary, inherit)',
            borderRadius: '8px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minHeight: '48px'
          }}
        >
          {isUploading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud size={18} />
              <span>Upload Profile Image</span>
            </>
          )}
        </button>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      
      {/* Hidden input to submit the URL value with the form */}
      <input type="hidden" name={name} value={imageUrl} />
    </div>
  );
}
