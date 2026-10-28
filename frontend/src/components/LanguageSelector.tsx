import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../i18n/translations';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, supportedLanguages, currentLanguageMeta } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left shrink-0" ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition-all shadow-sm ring-1 ring-white/5 hover:border-sky-500/50 shrink-0 whitespace-nowrap cursor-pointer"
        title="Select Regional Language / क्षेत्रीय भाषा चुनें"
      >
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
          <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>
        <span className="font-sans font-extrabold text-white text-xs">
          {currentLanguageMeta.nativeName}
        </span>
        <span className="text-[10px] text-slate-400 hidden xl:inline">
          ({currentLanguageMeta.label})
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-sky-400' : ''}`} />
      </button>

      {/* Language Selection Modal Dropdown */}
      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-24px)] rounded-2xl bg-[#0A0F1D] border-2 border-sky-500/50 shadow-[0_10px_50px_rgba(0,0,0,0.95)] z-[99999] p-3 space-y-2 animate-in fade-in zoom-in-95 backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-black uppercase tracking-wider">
              <Languages className="w-4 h-4" />
              <span>IR Regional Languages</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              12 Languages
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto pr-1 space-y-1 divide-y divide-slate-800/40">
            {supportedLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-sky-600/30 to-blue-600/20 border border-sky-500/50 text-white shadow-sm' 
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 text-center font-mono text-[11px] font-bold text-sky-400 uppercase bg-slate-900/90 py-0.5 rounded border border-slate-700/60">
                      {lang.code}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs sm:text-sm text-white">
                          {lang.nativeName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({lang.label})
                        </span>
                      </div>
                      <span className="text-[9.5px] text-slate-400 font-sans block">
                        {lang.region}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shadow-md shadow-sky-500/40">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
