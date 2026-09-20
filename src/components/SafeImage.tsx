import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageOff, Sparkles, Shield, Package, Award, Loader2 } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  fallbackIcon?: 'package' | 'shield' | 'award' | 'sparkles';
  fallbackGradient?: string;
  showLoader?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className,
  fallbackTitle,
  fallbackIcon = 'shield',
  fallbackGradient = 'from-emerald-900/60 to-neutral-900',
  showLoader = true,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const IconComponent =
    fallbackIcon === 'package'
      ? Package
      : fallbackIcon === 'award'
      ? Award
      : fallbackIcon === 'sparkles'
      ? Sparkles
      : Shield;

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br ${fallbackGradient} border border-emerald-500/20 rounded-xl relative overflow-hidden ${className || 'w-full h-full'}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)]" />
        <IconComponent className="w-8 h-8 text-amber-400 mb-1 animate-pulse relative z-10" />
        {fallbackTitle && (
          <span className="text-[10px] font-black text-emerald-200 font-mono tracking-tight relative z-10 uppercase">
            {fallbackTitle}
          </span>
        )}
        <div className="absolute bottom-2 right-2 opacity-20">
          <ImageOff size={14} className="text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group ${className || ''}`}>
      <AnimatePresence>
        {isLoading && showLoader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a120d] border border-white/5 rounded-xl"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-2" />
            <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-widest">Loading Asset...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <img
        src={src}
        alt={alt || 'Tactical Asset'}
        className={`${className} ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-500 ease-out object-contain`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
      />
      
      {/* Subtle overlay for quality feel */}
      {!isLoading && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
};

export default SafeImage;
