import React from 'react';
import { 
  FileText, 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

interface CautionOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainNumber?: string;
  trainName?: string;
  locoNumber?: string;
}

export const CautionOrderModal: React.FC<CautionOrderModalProps> = ({
  isOpen,
  onClose,
  trainNumber = '12004',
  trainName = 'Lucknow Swarna Shatabdi Express',
  locoNumber = 'WAP-7 #30211 (Ghaziabad Shed)'
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-[#0F172A] border border-sky-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-left animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Official Form T/409 — Caution Order (G&SR Rule 4.09)
              </h3>
              <p className="text-[13px] text-slate-400 font-mono">
                Statutory Authority: North Central Railway • Prayagraj Divisional Control Office
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Form</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Form Simulation Layout (Indian Railways G&SR Standard) */}
        <div className="bg-[#FFFDF8] text-slate-900 rounded-2xl p-6 shadow-xl border-2 border-amber-900/30 space-y-4 font-mono select-none">
          {/* Form Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3 space-y-0.5">
            <div className="text-[13px] font-black tracking-widest uppercase">
              INDIAN RAILWAYS — NORTH CENTRAL RAILWAY
            </div>
            <div className="text-sm font-black tracking-wider uppercase underline underline-offset-2">
              FORM T/409 (DIV) — CAUTION ORDER
            </div>
            <div className="text-xs text-slate-700">
              [Issued under G&SR Rules 4.09, 15.02 and P-Way Manual Para 806]
            </div>
          </div>

          {/* Form Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-1 border-b border-slate-400">
            <div>
              <span className="text-slate-600 block">Station Issued:</span>
              <strong className="text-slate-950">SOMNA (SOM)</strong>
            </div>
            <div>
              <span className="text-slate-600 block">Date & Time:</span>
              <strong className="text-slate-950">{currentDate} 10:16 IST</strong>
            </div>
            <div>
              <span className="text-slate-600 block">Train No. & Name:</span>
              <strong className="text-slate-950">#{trainNumber} ({trainName.split(' ')[0]})</strong>
            </div>
            <div>
              <span className="text-slate-600 block">Locomotive No:</span>
              <strong className="text-slate-950">{locoNumber}</strong>
            </div>
          </div>

          {/* Table of Speed Restrictions */}
          <div>
            <div className="text-xs font-bold uppercase text-slate-700 mb-1">
              SECTION 1: PERMANENT / TEMPORARY SPEED RESTRICTIONS (PSR / TSR)
            </div>
            <table className="w-full text-xs border-collapse border border-slate-900 text-left">
              <thead>
                <tr className="bg-slate-200 border-b border-slate-900">
                  <th className="border border-slate-900 p-1.5 font-bold">Station Between</th>
                  <th className="border border-slate-900 p-1.5 font-bold">Kilometrage (From - To)</th>
                  <th className="border border-slate-900 p-1.5 font-bold">Track Line</th>
                  <th className="border border-slate-900 p-1.5 font-bold text-center">Max Permitted (km/h)</th>
                  <th className="border border-slate-900 p-1.5 font-bold">Reason & Authority</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-amber-50 font-bold">
                  <td className="border border-slate-900 p-1.5">SOMNA – ALIGARH JN</td>
                  <td className="border border-slate-900 p-1.5">KM 118.0 to KM 128.0</td>
                  <td className="border border-slate-900 p-1.5 text-rose-800">Down Mainline</td>
                  <td className="border border-slate-900 p-1.5 text-center text-rose-700 text-sm font-black">
                    STOP (0 km/h)
                  </td>
                  <td className="border border-slate-900 p-1.5">
                    3-DEPT BLOCK (CSM Track Tamping + OHE Dropper replacement). Line Disconnected.
                  </td>
                </tr>
                <tr className="bg-sky-50 font-bold">
                  <td className="border border-slate-900 p-1.5">SOMNA (Point #12A)</td>
                  <td className="border border-slate-900 p-1.5">KM 118.0 to KM 118.5</td>
                  <td className="border border-slate-900 p-1.5 text-blue-800">Crossover to Middle Loop</td>
                  <td className="border border-slate-900 p-1.5 text-center text-blue-900 text-sm font-black">
                    50 km/h
                  </td>
                  <td className="border border-slate-900 p-1.5">
                    1-in-12 Thick Web Curved Turnout PSR. Guard against derailment.
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 p-1.5">SOMNA – ALIGARH JN</td>
                  <td className="border border-slate-900 p-1.5">KM 118.5 to KM 127.8</td>
                  <td className="border border-slate-900 p-1.5">Reversible Middle Loop</td>
                  <td className="border border-slate-900 p-1.5 text-center font-bold">
                    85 km/h
                  </td>
                  <td className="border border-slate-900 p-1.5">
                    Loop Line Transit Speed under Kavach supervision.
                  </td>
                </tr>
                <tr className="bg-sky-50 font-bold">
                  <td className="border border-slate-900 p-1.5">ALIGARH (Point #14B)</td>
                  <td className="border border-slate-900 p-1.5">KM 127.8 to KM 128.2</td>
                  <td className="border border-slate-900 p-1.5 text-blue-800">Rejoin Down Mainline</td>
                  <td className="border border-slate-900 p-1.5 text-center text-blue-900 text-sm font-black">
                    50 km/h
                  </td>
                  <td className="border border-slate-900 p-1.5">
                    Turnout entry back to Down Mainline. Resume MPS 130 km/h at KM 128.5 (T/P Board).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statutory Warnings */}
          <div className="bg-amber-100/80 p-2.5 rounded-lg border border-amber-400 text-xs space-y-1 text-slate-800">
            <strong>SPECIAL INSTRUCTIONS TO LOCO PILOT & GUARD:</strong>
            <p>
              1. Acknowledge and obey Automatic Signal S-1012 displaying <strong>DOUBLE YELLOW (ATTENTION)</strong> at KM 104.2 and Home Signal S-1014 displaying <strong>YELLOW</strong> for Turnout Point #12A.
            </p>
            <p>
              2. Do not exceed 50 km/h over Point #12A until last vehicle clears turnout (T/P board). Kavach 4.0 automatic braking will intervene if speed exceeds 52 km/h.
            </p>
          </div>

          {/* Cryptographic Digital Sign-off */}
          <div className="pt-2 border-t border-slate-900 flex justify-between items-end text-xs">
            <div>
              <span className="text-slate-600 block">Station Master Signature & Stamp:</span>
              <strong className="text-slate-900">SM Somna (NCR) — Token #SM-4091</strong>
              <div className="text-[8px] text-slate-500 font-mono">
                SHA-256: e7a9c8f0b12d45c8... (CRIS Verified)
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-600 block">Loco Pilot Electronic Acknowledgment:</span>
              <strong className="text-emerald-800 flex items-center gap-1 justify-end">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ACKNOWLEDGED ON KAVACH DMI
              </strong>
              <div className="text-[8px] text-slate-500 font-mono">
                Loco #30211 @ 10:16:04 IST
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-slate-400 font-mono">
            Generated autonomously by SthitiShodhana Dispatch Engine v1.2.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
