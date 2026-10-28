/**
 * Operational Editorial style: the generated RailBlock transit mark is used
 * prominently in the header and sourced from persistent project storage.
 */
const markUrl = "/manus-storage/railblock-brand-mark_68423215.png";

export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div className={`brand-mark ${className}`} aria-hidden="true">
      <img className="mark-texture" src={markUrl} alt="" />
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 8v24M17 8v24" stroke="currentColor" strokeWidth="3.25" strokeLinecap="round" />
        <path d="M17 9h7.2a6.2 6.2 0 0 1 0 12.4H17M24.2 21.4 30 32" stroke="currentColor" strokeWidth="3.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
