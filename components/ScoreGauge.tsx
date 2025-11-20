import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'lg';
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 'lg' }) => {
  // Dimensions based on size prop
  const isLarge = size === 'lg';
  const radius = isLarge ? 50 : 30;
  const stroke = isLarge ? 8 : 5;
  const widthHeight = isLarge ? 'w-48 h-48' : 'w-20 h-20';
  const fontSize = isLarge ? 'text-4xl' : 'text-xl';
  const labelSize = isLarge ? 'text-xs' : 'text-[0.5rem]';
  const containerPadding = isLarge ? 'p-6' : 'p-2';

  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-red-500";
  let bgClass = "bg-red-50";
  if (score >= 90) {
    colorClass = "text-green-500";
    bgClass = "bg-green-50";
  } else if (score >= 70) {
    colorClass = "text-yellow-500";
    bgClass = "bg-yellow-50";
  } else if (score >= 50) {
    colorClass = "text-orange-500";
    bgClass = "bg-orange-50";
  }

  return (
    <div className={`relative flex flex-col items-center justify-center ${containerPadding} rounded-full ${bgClass} ${widthHeight} shadow-inner flex-shrink-0`}>
      <svg
        height={radius * 2 + (isLarge ? 20 : 10)}
        width={radius * 2 + (isLarge ? 20 : 10)}
        className="rotate-[-90deg] overflow-visible"
      >
        <circle
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius + (isLarge ? 10 : 5)}
          cy={radius + (isLarge ? 10 : 5)}
        />
        <circle
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius + (isLarge ? 10 : 5)}
          cy={radius + (isLarge ? 10 : 5)}
          className={colorClass}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center inset-0">
        <span className={`${fontSize} font-bold ${colorClass}`}>{score}</span>
        {isLarge && <span className={`${labelSize} text-gray-500 uppercase font-semibold tracking-wider mt-1`}>Puntaje</span>}
      </div>
    </div>
  );
};

export default ScoreGauge;