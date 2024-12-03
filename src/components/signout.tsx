'use client';

import React from 'react';
import { useSpring, animated } from '@react-spring/web';

interface AnimatedSignOutButtonProps {
  onSignOut: () => void;
}

const AnimatedSignOutButton: React.FC<AnimatedSignOutButtonProps> = ({ onSignOut }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const springStyles = useSpring({
    backgroundColor: isHovered ? 'rgb(220, 38, 38)' : 'rgb(239, 68, 68)', // Darker red on hover
    transform: isHovered ? 'scale(1.1)' : 'scale(1)', // Scale up on hover
    config: { tension: 200, friction: 12 },
  });

  return (
    <animated.button
      style={springStyles}
      onClick={onSignOut}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="block w-full px-4 py-2 text-white text-left rounded focus:outline-none"
    >
      Sign Out
    </animated.button>
  );
};

export default AnimatedSignOutButton;
