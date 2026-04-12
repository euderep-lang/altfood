import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface AltfoodIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  xs: 'w-7 h-7',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

const AltfoodIcon = forwardRef<HTMLImageElement, AltfoodIconProps>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <img
        ref={ref}
        src="/logo-altfood-mark.png"
        alt="Altfood"
        className={cn(sizeMap[size], 'rounded-xl object-cover', className)}
        {...props}
      />
    );
  }
);

AltfoodIcon.displayName = 'AltfoodIcon';

export default AltfoodIcon;
