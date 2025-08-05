import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  isWorkPhase: boolean;
  children: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size,
  strokeWidth,
  isWorkPhase,
  children
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className={`relative flex items-center justify-center ${
        isWorkPhase ? 'drop-shadow-work-glow' : 'drop-shadow-rest-glow'
      }`}
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <svg
        className="absolute top-0 left-0 transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isWorkPhase ? "hsl(var(--work))" : "hsl(var(--rest))"}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${isWorkPhase ? 'hsl(var(--work) / 0.5)' : 'hsl(var(--rest) / 0.5)'})`
          }}
        />
      </svg>
      
      {/* Content inside circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default CircularProgress;