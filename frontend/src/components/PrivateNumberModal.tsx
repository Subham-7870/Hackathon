import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, KeyRound, CheckCircle2, Clock, MapPin } from 'lucide-react';

export interface PNActionDetails {
  actionType: 'T351_DISCONNECTION' | 'T351_RECONNECTION' | 'ROUTE_CANCEL_EUUYN' | 'POINT_THROW' | 'CRANK_HANDLE' | 'T409B_TSR' | 'SET_ROUTE';
  title: string;
  station: string;
  assetId: string;
  description: string;
  onConfirm: (pn: string) => void;
}

interface PrivateNumberModalProps {
  isOpen: boolean;
  actionDetails: PNActionDetails | null;
  onClose: () => void;
}

export const PrivateNumberModal: React.FC<PrivateNumberModalProps> = ({
  isOpen,
  actionDetails,
  onClose
}) => {
  const [generatedPN, setGeneratedPN] = useState<string>('');
  const [authorizerName, setAuthorizerName] = useState<string>('SCOR / NCR-ALJN (Sec-04)');
  const [remarks, setRemarks] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Generate authentic 4-digit Indian Railways Private Number
      const randomPN = String(Math.floor(1000 + Math.random() * 9000));
      setGeneratedPN(randomPN);
      setIsConfirmed(false);
      setRemarks('');

      if (actionDetails?.actionType === 'ROUTE_CANCEL_EUUYN') {
        setCountdown(120); // 120s mandatory Indian Railways safety timer for Emergency Route Cancellation
      } else {
        setCountdown(0);
      }
    }
  }, [isOpen, actionDetails]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen || !actionDetails) return null;

  const handleAuthorize = () => {
    setIsConfirmed(true);
    setTimeout(() => {
      actionDetails.onConfirm(generatedPN);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="w-full max-w-xl bg-[#090D16] border-2 border-[#1E293B] shadow-[0_0_50px_rgba(0,0,0,0.9)] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#0F172A] border-b border-[#1E293B] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-400 font-bold tracking-wider text-sm uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              NORTH CENTRAL RAILWAY · ELECTRONIC BLOCK REGISTER (EBR)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded text-xs border border-slate-700 bg-slate-800"
          >
            ESC [CLOSE]
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm text-slate-300">
          {/* Action Overview Card */}
          <div className="bg-[#030712] border border-amber-500/30 rounded p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-bold uppercase text-[13px] tracking-wide">Operation / Action:</span>
              <span className="text-amber-300 font-bold text-sm">{actionDetails.title}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1 text-[13px]">
              <div>
                <span className="text-slate-500 block">Station / Section:</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {actionDetails.station} (KM 105.0)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Interlocking Asset:</span>
                <span className="text-amber-400 font-bold mt-0.5 block">{actionDetails.assetId}</span>
              </div>
            </div>
            <p className="text-slate-400 pt-2 border-t border-slate-800/80 text-[13px] leading-relaxed">
              {actionDetails.description}
            </p>
          </div>

          {/* EUUYN 120s Timer Warning */}
          {actionDetails.actionType === 'ROUTE_CANCEL_EUUYN' && (
            <div className="bg-red-950/40 border border-red-500/40 rounded p-3 text-red-300 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <div className="font-bold text-red-200">G&SR RULE 3.38 · MANDATORY SAFETY TIMER ENGAGED</div>
                <div className="text-[13px] text-red-300/90">
                  {countdown > 0 ? (
                    <span className="flex items-center gap-1.5 font-bold text-red-400 mt-0.5">
                      <Clock className="w-3.5 h-3.5 animate-spin" /> Time Remaining Before Route Release: {countdown}s
                    </span>
                  ) : (
                    <span className="text-green-400 font-bold mt-0.5 block">
                      ✓ Safety timer elapsed. Emergency route cancellation permissible.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Private Number Generated Box */}
          <div className="bg-[#0B1528] border-2 border-cyan-500/50 rounded-lg p-4 text-center space-y-1 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <div className="text-[13px] text-cyan-400 uppercase tracking-wider font-bold flex items-center justify-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> STATUTORY PRIVATE NUMBER (PN)
            </div>
            <div className="text-3xl font-black text-white tracking-[0.25em] font-mono py-1 text-shadow-cyan">
              {generatedPN}
            </div>
            <div className="text-xs text-slate-400">
              Valid for Transmission to SM/SOM, Dy. CHC/Punctuality & SSE/P-Way
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-slate-400 font-bold mb-1 text-[13px]">
                Authorized By (Section Controller ID):
              </label>
              <input
                type="text"
                value={authorizerName}
                onChange={e => setAuthorizerName(e.target.value)}
                className="w-full bg-[#030712] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1 text-[13px]">
                Dispatch / Safety Reason Remarks:
              </label>
              <input
                type="text"
                placeholder="e.g., Granted P-Way Block for 09-3X Dynamic Tamping Machine"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="w-full bg-[#030712] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#0F172A] border-t border-[#1E293B] px-6 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            SEC-NDLS-CNB-01 · CRIS COA PROTOCOL v3.2
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 text-sm font-bold transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleAuthorize}
              disabled={countdown > 0 || isConfirmed}
              className={`px-5 py-2 rounded text-sm font-black tracking-wide flex items-center gap-2 border shadow-lg transition-all ${
                countdown > 0 || isConfirmed
                  ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400/50 shadow-cyan-500/20'
              }`}
            >
              {isConfirmed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  LOGGED IN EBR...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  TRANSMIT PN & EXECUTE
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
