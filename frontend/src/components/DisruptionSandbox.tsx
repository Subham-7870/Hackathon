import React, { useState } from 'react';
import { DisruptionEvent } from '../types';
import { AlertTriangle, Zap, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DisruptionSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectDisruption: (event: DisruptionEvent) => void;
  isSimulating: boolean;
}

export const DisruptionSandbox: React.FC<DisruptionSandboxProps> = ({
  isOpen,
  onClose,
  onInjectDisruption,
  isSimulating,
}) => {
  const { t, language } = useLanguage();
  const [selectedPreset, setSelectedPreset] = useState<number>(0);

  if (!isOpen) return null;

  const presets: DisruptionEvent[] = language === 'hi' ? [
    {
      event_type: "लोकोमोटिव ट्रैक्शन मोटर खराबी",
      location_sector: "SEC-NDLS-CNB-01",
      affected_train_number: "BOXN-4021",
      delay_added_minutes: 45,
      description: "अलीगढ़ के पास डाउन मेन लाइन पर मालगाड़ी #BOXN-4021 का ट्रैक्शन मोटर खराब; खंड 45 मिनट के लिए बाधित।"
    },
    {
      event_type: "इलेक्ट्रॉनिक इंटरलॉकिंग सिग्नल विफलता",
      location_sector: "SEC-HWH-BWN-02",
      affected_train_number: undefined,
      delay_added_minutes: 35,
      description: "बर्दवान प्रवेश पर एसएंडटी सिग्नल #S-14 लैंप विफलता; आपातकालीन क्लैंपिंग प्रोटोकॉल लागू।"
    },
    {
      event_type: "मानसून भारी वर्षा गति प्रतिबंध (30 किमी/घंटा)",
      location_sector: "SEC-BCT-BRC-03",
      affected_train_number: undefined,
      delay_added_minutes: 30,
      description: "ट्रंक लाइन पर अचानक जलभराव; सुरक्षा हेतु 30 किमी/घंटा आपातकालीन गति सीमा लगाई गई।"
    },
    {
      event_type: "आपातकालीन रेल फ्रैक्चर का पता चला",
      location_sector: "SEC-NDLS-CNB-01",
      affected_train_number: undefined,
      delay_added_minutes: 60,
      description: "यूएसएफडी डिटेक्टर द्वारा किमी 1014 के पास गंभीर रेल वेल्ड फ्रैक्चर; 60 मिनट आपातकालीन ब्लॉक आवश्यक।"
    }
  ] : [
    {
      event_type: "Locomotive Traction Motor Breakdown",
      location_sector: "SEC-NDLS-CNB-01",
      affected_train_number: "BOXN-4021",
      delay_added_minutes: 45,
      description: "Freight #BOXN-4021 suffers traction motor failure on Down Main near Aligarh; stalls section by 45 minutes."
    },
    {
      event_type: "Electronic Interlocking (EI) Signal Failure",
      location_sector: "SEC-HWH-BWN-02",
      affected_train_number: undefined,
      delay_added_minutes: 35,
      description: "S&T Signal #S-14 lamp failure at Bardhaman entry; forces pilot-in-command manual clamping protocols."
    },
    {
      event_type: "Monsoon Heavy Rain TSR (30 km/h)",
      location_sector: "SEC-BCT-BRC-03",
      affected_train_number: undefined,
      delay_added_minutes: 30,
      description: "Sudden monsoon flash water-logging forces 30 km/h emergency speed clamp on Mumbai-Vadodara trunk."
    },
    {
      event_type: "Emergency Rail Fracture Detection",
      location_sector: "SEC-NDLS-CNB-01",
      affected_train_number: undefined,
      delay_added_minutes: 60,
      description: "Ultrasonic Flaw Detector (USFD) flags severe rail weld flaw near KM 1014; demands immediate 60-min emergency possession."
    }
  ];

  const current = presets[selectedPreset];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-[#111827] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-7 py-5 border-b border-slate-800 flex items-center justify-between bg-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950 text-amber-400 rounded-2xl border border-amber-800/60">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {t.disruptionModalTitle}
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                {t.disruptionModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="p-7 space-y-5">
          <label className="block text-sm font-bold uppercase tracking-wider text-slate-400">
            {t.selectDisruptionScenario}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPreset(idx)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  selectedPreset === idx
                    ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                    : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-white">{p.event_type}</span>
                  <span className="text-[13px] font-bold font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800/60">
                    +{p.delay_added_minutes}m
                  </span>
                </div>
                <div className="text-[13px] font-mono text-sky-400 mb-1.5">{p.location_sector}</div>
                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{p.description}</p>
              </button>
            ))}
          </div>

          {/* Active Scenario Preview Card */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-amber-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              {t.dynamicAiReroutePlan}
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {t.dynamicAiRerouteDesc}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-7 py-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onInjectDisruption(current);
              onClose();
            }}
            disabled={isSimulating}
            className="flex items-center gap-2.5 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-60"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.solvingGraphText}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{t.injectDisruptionBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
