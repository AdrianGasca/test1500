import React from 'react';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface FeedbackCardProps {
  title: string;
  items: string[];
  type: 'issue' | 'tip';
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ title, items, type }) => {
  const isTip = type === 'tip';
  const Icon = isTip ? CheckCircle : AlertCircle;
  const bgClass = isTip ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100';
  const iconColor = isTip ? 'text-blue-600' : 'text-orange-600';
  const titleColor = isTip ? 'text-blue-900' : 'text-orange-900';

  if (items.length === 0) return null;

  return (
    <div className={`rounded-xl border p-5 ${bgClass} mb-4 transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h3 className={`font-semibold ${titleColor}`}>{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm leading-relaxed">
            <ArrowRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isTip ? 'text-blue-400' : 'text-orange-400'}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeedbackCard;