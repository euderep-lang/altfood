import { cn } from '@/lib/utils';

interface AltfoodIconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  xs: 'w-7 h-7',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

const AltfoodIcon = ({ className, size = 'md' }: AltfoodIconProps) => {
  return (
    <img
      src="/altfood-icon.png"
      alt="Altfood"
      className={cn(sizeMap[size], 'rounded-xl object-cover', className)}
    />
  );
};

export default AltfoodIcon;
