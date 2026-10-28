import React from 'react';
import { CautionOrderForm } from '../types';
import { FileText, Printer, Check, X, ShieldCheck } from 'lucide-react';

interface SanctionModalProps {
  form: CautionOrderForm | null;
  onClose: () => void;
  onApprove: (formId: string) => void;
}

export const SanctionModal: React.FC<SanctionModalProps> = ({ form, onClose, onApprove }) => {
  if (!form) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-[#111827] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-950 text-sky-400 rounded-2xl border border-sky-800/60">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Indian Railways Form T/409 — Caution Order
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                Official Speed Restriction & Maintenance Possession Notice (G&SR Operating Rules)
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

        {/* Printable Form Content */}
        <div className="p-7 overflow-y-auto space-y-5 font-mono text-sm text-slate-200 bg-[#0B0F19]">
          {/* Top Form Banner */}
          <div className="border-2 border-slate-700 p-5 rounded-2xl bg-[#111827] space-y-4">
            <div className="text-center border-b border-slate-700 pb-3 space-y-1">
              <div className="font-extrabold text-base tracking-widest uppercase text-sky-400">INDIAN RAILWAYS · CAUTION ORDER</div>
              <div className="text-sm text-slate-300 font-sans">FORM T/409 (Rule 4.09 of General & Subsidiary Rules)</div>
              <div className="text-[13px] text-slate-500 font-sans">Issued under authority of Section Controller / Dy. Chief Controller</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1 text-slate-300">
              <div><strong>Form Serial No:</strong> <span className="text-white font-bold">{form.form_id}</span></div>
              <div><strong>Division:</strong> <span className="text-white">{form.division} Division</span></div>
              <div><strong>From Station:</strong> <span className="text-sky-400 font-bold">{form.station_from}</span></div>
              <div><strong>To Station:</strong> <span className="text-sky-400 font-bold">{form.station_to}</span></div>
              <div><strong>Block Section:</strong> <span className="text-white">{form.block_section}</span></div>
              <div><strong>Speed Restriction:</strong> <span className="bg-rose-950 text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-800/60">{form.speed_restriction_kmh} KM/H</span></div>
              <div><strong>Effective From:</strong> <span className="text-emerald-400">{form.effective_from.slice(11, 16)} UTC</span></div>
              <div><strong>Effective To:</strong> <span className="text-emerald-400">{form.effective_to.slice(11, 16)} UTC</span></div>
            </div>

            <div className="border-t border-slate-700 pt-3 text-xs">
              <strong className="text-slate-300">Reason & Machine Deployed:</strong>
              <p className="font-sans text-slate-300 mt-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {form.reason}
              </p>
            </div>

            <div className="border-t border-slate-700 pt-4 flex justify-between items-end text-sm font-sans">
              <div>
                <div className="text-slate-500 text-[13px]">Authorized Timestamp:</div>
                <div className="font-mono font-bold text-slate-200">{form.authorized_timestamp}</div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Digital Controller Sign-off: {form.section_controller_name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-7 py-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Form T/409</span>
          </button>

          <button
            onClick={() => {
              onApprove(form.form_id);
              onClose();
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Push Sanction Notice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
