'use client';

import React from 'react';
import { useSpring, animated } from '@react-spring/web';

interface AnimatedSignInButtonProps {
  onSignIn: () => void;
}

const AnimatedSignInButton: React.FC<AnimatedSignInButtonProps> = ({ onSignIn }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const springStyles = useSpring({
    backgroundColor: isHovered ? 'rgb(38, 220, 38)' : 'rgb(68, 239, 68)', // Darker red on hover
    transform: isHovered ? 'scale(1.1)' : 'scale(1)', // Scale up on hover
    config: { tension: 200, friction: 12 },
  });

  return (
    <animated.button
      style={springStyles}
      onClick={onSignIn}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="block w-full px-4 py-2 text-white text-left rounded focus:outline-none"
    >
      Sign In
    </animated.button>
  );
};

export default AnimatedSignInButton;
