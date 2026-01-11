import React, { memo } from 'react';

const AnimationStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap');

    .loader-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 120px;
      width: auto;
      font-family: "Poppins", sans-serif;
      font-size: 1.6em;
      font-weight: 600;
      user-select: none;
      /* Theme-dependent text color */
      color: var(--loader-text);
    }

    /* Light Theme Variables */
    :root {
      --loader-text: #1a1a1a;
      --loader-glow: rgba(0, 0, 0, 0.2);
      --loader-scan-opacity: 0.4;
    }

    /* Dark Theme Variables */
    .dark :root, .dark {
      --loader-text: #ffffff;
      --loader-glow: rgba(255, 255, 255, 0.8);
      --loader-scan-opacity: 1;
    }

    .loader {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: 1;
      background-color: transparent;
      mask: repeating-linear-gradient(
        90deg,
        transparent 0,
        transparent 6px,
        black 7px,
        black 8px
      );
    }

    .loader::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(circle at 50% 50%, #ff0 0%, transparent 50%),
        radial-gradient(circle at 45% 45%, #f00 0%, transparent 45%),
        radial-gradient(circle at 55% 55%, #0ea5e9 0%, transparent 45%),
        radial-gradient(circle at 45% 55%, #22c55e 0%, transparent 45%),
        radial-gradient(circle at 55% 45%, #6366f1 0%, transparent 45%);
      mask: radial-gradient(
        circle at 50% 50%,
        transparent 0%,
        transparent 10%,
        black 25%
      );
      animation:
        transform-animation 2s infinite alternate,
        opacity-animation 4s infinite;
      animation-timing-function: cubic-bezier(0.6, 0.8, 0.5, 1);
    }

    @keyframes transform-animation {
      0% { transform: translate(-55%); }
      100% { transform: translate(55%); }
    }

    @keyframes opacity-animation {
      0%, 100% { opacity: 0; }
      15% { opacity: var(--loader-scan-opacity); }
      65% { opacity: 0; }
    }

    .loader-letter {
      display: inline-block;
      opacity: 0;
      animation: loader-letter-anim 2s infinite linear;
      z-index: 2;
      white-space: pre;
    }

    @keyframes loader-letter-anim {
      0% { opacity: 0; }
      5% {
        opacity: 1;
        text-shadow: 0 0 8px var(--loader-glow);
        transform: scale(1.1) translateY(-2px);
      }
      20% { opacity: 0.3; }
      100% { opacity: 0; }
    }
  `}</style>
);

const Loading = memo(({ message = 'TRACKWICKET', size = 'default' }) => {
  const scaleClasses = {
    small: 'scale-75',
    default: 'scale-110',
    large: 'scale-150',
  };

  const letters = message.split('');

  return (
    <div className={`loader-wrapper transition-transform duration-300 ${scaleClasses[size]}`}>
      <AnimationStyles />
      {letters.map((char, index) => (
        <span 
          key={index} 
          className="loader-letter"
          style={{ 
            animationDelay: `${0.1 + (index * 0.105)}s` 
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
      <div className="loader"></div>
    </div>
  );
});

Loading.displayName = 'Loading';

export default Loading;