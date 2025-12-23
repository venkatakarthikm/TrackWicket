import { memo } from 'react';

const Loading = memo(({ message = 'Loading...', size = 'default' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-6">
      {/* Animated Loader */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-primary/20 animate-glow-pulse`} />
        
        {/* Spinning ring */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-transparent border-t-primary border-r-primary/50 animate-spin`}
          style={{ animationDuration: '1s' }}
        />
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>

      {/* Message with shimmer effect */}
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground mb-1">{message}</p>
        <div className="h-1 w-32 mx-auto rounded-full overflow-hidden bg-secondary">
          <div className="h-full w-full animate-shimmer bg-gradient-to-r from-secondary via-primary/40 to-secondary" />
        </div>
      </div>
    </div>
  );
});

Loading.displayName = 'Loading';

export default Loading;
