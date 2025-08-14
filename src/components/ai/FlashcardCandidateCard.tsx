import React from "react";

interface FlashcardCandidateCardProps {
  index: number;
  front: string;
  back: string;
  accepted: boolean;
  onUpdate: (index: number, field: "front" | "back", value: string) => void;
  onToggle: (index: number) => void;
}

export const FlashcardCandidateCard: React.FC<FlashcardCandidateCardProps> = ({
  index,
  front,
  back,
  accepted,
  onUpdate,
  onToggle,
}) => {
  return (
    <div className="bg-white/5 rounded-lg p-6 shadow-md">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={accepted}
          onChange={() => onToggle(index)}
          className="mt-2 h-4 w-4 rounded border-gray-600 bg-white/10 text-blue-600 focus:ring-blue-500"
        />
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Front</label>
            <input
              type="text"
              value={front}
              onChange={(e) => onUpdate(index, "front", e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Back</label>
            <textarea
              value={back}
              onChange={(e) => onUpdate(index, "back", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 