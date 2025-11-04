import { ImageRenderComponent } from './image-render-component';
import React from 'react';

interface ContentContainerProps {
  imageUrl?: string;
  children?: React.ReactNode;
}

export const ContentContainer = ({
  imageUrl,
  children,
}: ContentContainerProps) => {
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      {imageUrl && (
        <div className="w-full h-full flex items-center justify-center p-4">
          <ImageRenderComponent imageUrl={imageUrl} />
        </div>
      )}
      {children}
    </div>
  );
};

