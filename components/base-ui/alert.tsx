'use client';

import * as React from 'react';

export type AlertProps = React.HTMLAttributes<HTMLDivElement>;

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={`relative w-full rounded-lg border p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
Alert.displayName = 'Alert';

export type AlertTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className = '', children, ...props }, ref) => (
    <h5
      ref={ref}
      className={`mb-1 font-heading text-sm font-bold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  )
);
AlertTitle.displayName = 'AlertTitle';

export type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-xs leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </div>
));
AlertDescription.displayName = 'AlertDescription';

