"use client";

import type { FC } from "react";

interface FeatureListProps {
  features: string[];
  onChange?: (features: string[]) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const FeatureList: FC<FeatureListProps> = ({
  features,
  onChange,
  readOnly,
  placeholder,
}) => {
  if (!features.length) {
    return (
      <p className="text-xs text-slate-500">
        {placeholder || "No features yet."}
      </p>
    );
  }

  const handleRemove = (index: number) => {
    if (!onChange || readOnly) return;
    onChange(features.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number, value: string) => {
    if (!onChange || readOnly) return;
    const next = [...features];
    next[index] = value;
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {features.map((feature, index) => (
        <div
          key={index}
          className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-100"
        >
          {readOnly ? (
            <span>{feature}</span>
          ) : (
            <input
              value={feature}
              onChange={(e) => handleEdit(index, e.target.value)}
              className="bg-transparent text-xs focus:outline-none"
            />
          )}
          {!readOnly && onChange && (
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="ml-1 text-slate-400 hover:text-slate-200"
              aria-label="Remove feature"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default FeatureList;
