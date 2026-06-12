import { useState } from 'react';

const FreeTextInput = ({ prompt, onSubmit, placeholder = '…', compact = false }) => {
  const [value, setValue] = useState('');

  const submit = () => {
    const text = value.trim();
    if (text) onSubmit(text);
  };

  const hasText = value.trim().length > 0;

  if (compact) {
    return (
      <div className="font-cardo animate-blur-in">
        <div className="flex gap-2 items-start">
          <textarea
            value={value}
            maxLength={240}
            rows={1}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
            }}
            className="flex-1 bg-transparent border border-white/15 rounded-lg p-2 text-white/70 text-sm outline-none placeholder-white/20 resize-none focus:border-amber-300/30 transition-colors min-h-[40px] leading-tight"
            placeholder={placeholder}
          />
          <button
            disabled={!hasText}
            onClick={submit}
            className={`rounded px-3 py-2 text-xs whitespace-nowrap shrink-0 transition-all duration-500 ${
              hasText
                ? 'border border-gray-300 text-white mix-blend-difference hover:border-amber-200/60 hover:scale-[1.02] cursor-pointer'
                : 'border border-amber-300/40 text-white/50 opacity-20'
            }`}
          >
            Go
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-cardo animate-blur-in">
      {prompt && (
        <p className="text-white/60 italic text-sm leading-relaxed mb-5 text-center">
          {prompt}
        </p>
      )}
      <textarea
        autoFocus
        value={value}
        maxLength={240}
        rows={3}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
        }}
        className="w-full bg-transparent border border-white/15 rounded-lg p-3 text-white/90 text-sm outline-none placeholder-white/20 resize-none focus:border-amber-300/30 transition-colors mb-4"
        placeholder={placeholder}
      />
      <button
        disabled={!value.trim()}
        onClick={submit}
        className="w-full border border-amber-300/40 rounded py-2 text-sm text-white/70 hover:bg-amber-900/30 disabled:opacity-20 transition-colors"
      >
        Say it
      </button>
    </div>
  );
};

export default FreeTextInput;
