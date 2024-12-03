'use client';

import React from 'react';
import { useSpring, animated } from '@react-spring/web';

interface AnimatedFeedbackButtonProps {
  onClick: () => void;
  isActive: boolean;
}

const AnimatedFeedbackButton: React.FC<AnimatedFeedbackButtonProps> = ({ onClick, isActive }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const springStyles = useSpring({
    backgroundColor: isHovered || isActive ? 'rgb(55, 65, 81)' : 'rgb(31, 41, 55)', // Light blue on hover or active
    transform: isHovered ? 'scale(1.1)' : 'scale(1)', // Scale up on hover
    config: { tension: 200, friction: 12 },
  });

  return (
    <animated.button
      style={springStyles}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`text-white px-3 py-2 rounded flex items-center focus:outline-none transition-all duration-300 ${
        isActive ? 'font-semibold' : 'hover:bg-blue-600'
      }`}
    >
      Feedback
      <svg
        className="ml-1 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </animated.button>
  );
};

export default AnimatedFeedbackButton;
