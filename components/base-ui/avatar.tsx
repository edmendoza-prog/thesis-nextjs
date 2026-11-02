'use client';

import * as React from 'react';

type AvatarContextValue = {
  imageLoaded: boolean;
  setImageLoaded: (loaded: boolean) => void;
};

const AvatarContext = React.createContext<AvatarContextValue>({
  imageLoaded: false,
  setImageLoaded: () => {},
});

export type AvatarProps = React.HTMLAttributes<HTMLDivElement>;

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = '', children, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);

    return (
      <AvatarContext.Provider value={{ imageLoaded, setImageLoaded }}>
        <div
          ref={ref}
          className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}
          {...props}
        >
          {children}
        </div>
      </AvatarContext.Provider>
    );
  }
);
Avatar.displayName = 'Avatar';

export type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className = '', src, alt = '', onLoad, onError, ...props }, ref) => {
    const { setImageLoaded } = React.useContext(AvatarContext);
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
      setHasError(false);
      if (src) {
        setImageLoaded(true);
      } else {
        setImageLoaded(false);
      }
    }, [src, setImageLoaded]);

    if (!src || hasError) return null;

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        onLoad={(e) => {
          setImageLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setHasError(true);
          setImageLoaded(false);
          onError?.(e);
        }}
        className={`aspect-square h-full w-full ${className}`}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = 'AvatarImage';

export type AvatarFallbackProps = React.HTMLAttributes<HTMLDivElement>;

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  AvatarFallbackProps
>(({ className = '', children, ...props }, ref) => {
  const { imageLoaded } = React.useContext(AvatarContext);

  if (imageLoaded) return null;

  return (
    <div
      ref={ref}
      className={`flex h-full w-full items-center justify-center rounded-full bg-neutral-800 text-neutral-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
AvatarFallback.displayName = 'AvatarFallback';

