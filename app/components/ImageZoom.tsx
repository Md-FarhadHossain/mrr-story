'use client';

import { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface ImageZoomProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
}

export default function ImageZoom({ src, alt, className, style, ...props }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt || ''}
        className={className}
        style={{ cursor: 'pointer', ...style }}
        onClick={() => setIsOpen(true)}
        {...props}
      />

      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={[{ src, alt: alt || '' }]}
        plugins={[Zoom]}
        carousel={{ finite: true }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
        zoom={{
          scrollToZoom: true,
          maxZoomPixelRatio: 5,
        }}
        controller={{ closeOnBackdropClick: true }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, .85)", backdropFilter: "blur(10px)" }
        }}
      />
    </>
  );
}
