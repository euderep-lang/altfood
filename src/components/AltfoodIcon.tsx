import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface AltfoodIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/** Wordmark horizontal (~2.9:1); height drives scale, width follows aspect. */
const sizeMap = {
  xs: 'h-7 w-auto max-w-[5.5rem]',
  sm: 'h-8 w-auto max-w-[6.5rem]',
  md: 'h-10 w-auto max-w-[8.5rem]',
  lg: 'h-16 w-auto max-w-[13.5rem]',
  xl: 'h-20 w-auto max-w-[17rem]',
};

const AltfoodIcon = forwardRef<HTMLImageElement, AltfoodIconProps>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <img
        ref={ref}
        src="/altfood-brand.png"
        alt="Altfood"
        className={cn(sizeMap[size], 'rounded-md object-contain', className)}
        {...props}
      />
    );
  }
);

AltfoodIcon.displayName = 'AltfoodIcon';

export default AltfoodIcon;
