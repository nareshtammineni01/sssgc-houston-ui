'use client';

import { useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

const baseWrapperClass = 'relative w-full';
const baseBorderStyle = { borderColor: 'rgba(107,29,42,0.15)' };
const focusRing = 'focus-within:ring-2 focus-within:ring-[#E8860C]/40';

const labelBase = 'absolute left-3 transition-all duration-200 pointer-events-none';
const labelInactive = 'top-1/2 -translate-y-1/2 text-sm';
const labelActive = 'top-0 -translate-y-1/2 text-[11px] font-medium bg-white px-1';
const labelTextareaInactive = 'top-3 text-sm';
const labelTextareaActive = 'top-0 -translate-y-1/2 text-[11px] font-medium bg-white px-1';

// ─── Floating Input ───
interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  hint?: string;
  error?: boolean;
}

export function FloatingInput({ label, icon, hint, error, className, value, ...props }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';
  const isActive = focused || hasValue;

  return (
    <div>
      <div className={`${baseWrapperClass} ${focusRing} rounded-xl border ${error ? 'border-red-300 ring-red-200' : ''}`} style={error ? undefined : baseBorderStyle}>
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: '#A89888' }}>
            {icon}
          </span>
        )}
        <input
          {...props}
          value={value}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          className={`w-full ${icon ? 'pl-9' : 'pl-3.5'} pr-3.5 pt-4 pb-2 rounded-xl text-[15px] bg-transparent outline-none ${className ?? ''}`}
          style={{ color: '#2C1810' }}
          placeholder=""
        />
        <label
          className={`${labelBase} ${icon ? 'left-9' : 'left-3'} ${isActive ? labelActive : labelInactive}`}
          style={{ color: isActive ? '#E8860C' : '#A89888' }}
        >
          {label}
        </label>
      </div>
      {hint && <p className="text-[11px] mt-1 ml-1" style={{ color: '#A89888' }}>{hint}</p>}
    </div>
  );
}

// ─── Floating Input with Toggle (for password) ───
interface FloatingPasswordProps extends Omit<FloatingInputProps, 'type'> {
  showToggle?: boolean;
  toggleIcon?: ReactNode;
  onToggle?: () => void;
  isVisible?: boolean;
}

export function FloatingPassword({ label, icon, showToggle, toggleIcon, onToggle, isVisible, value, ...props }: FloatingPasswordProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';
  const isActive = focused || hasValue;

  return (
    <div className={`${baseWrapperClass} ${focusRing} rounded-xl border`} style={baseBorderStyle}>
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: '#A89888' }}>
          {icon}
        </span>
      )}
      <input
        {...props}
        type={isVisible ? 'text' : 'password'}
        value={value}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        className={`w-full ${icon ? 'pl-9' : 'pl-3.5'} ${showToggle ? 'pr-10' : 'pr-3.5'} pt-4 pb-2 rounded-xl text-[15px] bg-transparent outline-none`}
        style={{ color: '#2C1810' }}
        placeholder=""
      />
      <label
        className={`${labelBase} ${icon ? 'left-9' : 'left-3'} ${isActive ? labelActive : labelInactive}`}
        style={{ color: isActive ? '#E8860C' : '#A89888' }}
      >
        {label}
      </label>
      {showToggle && onToggle && (
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }}>
          {toggleIcon}
        </button>
      )}
    </div>
  );
}

// ─── Floating Select ───
interface FloatingSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

export function FloatingSelect({ label, children, value, className, ...props }: FloatingSelectProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';
  const isActive = focused || hasValue;

  return (
    <div className={`${baseWrapperClass} ${focusRing} rounded-xl border`} style={baseBorderStyle}>
      <select
        {...props}
        value={value}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        className={`w-full pl-3.5 pr-8 pt-4 pb-2 rounded-xl text-[15px] bg-transparent outline-none appearance-none ${className ?? ''}`}
        style={{ color: '#2C1810' }}
      >
        {children}
      </select>
      <label
        className={`${labelBase} ${isActive ? labelActive : labelInactive}`}
        style={{ color: isActive ? '#E8860C' : '#A89888' }}
      >
        {label}
      </label>
      {/* Dropdown arrow */}
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 12 12" style={{ color: '#A89888' }}>
        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── Floating Textarea ───
interface FloatingTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function FloatingTextarea({ label, value, className, ...props }: FloatingTextareaProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';
  const isActive = focused || hasValue;

  return (
    <div className={`${baseWrapperClass} ${focusRing} rounded-xl border`} style={baseBorderStyle}>
      <textarea
        {...props}
        value={value}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        className={`w-full pl-3.5 pr-3.5 pt-5 pb-2 rounded-xl text-[15px] bg-transparent outline-none resize-none ${className ?? ''}`}
        style={{ color: '#2C1810' }}
        placeholder=""
      />
      <label
        className={`${labelBase} ${isActive ? labelTextareaActive : labelTextareaInactive}`}
        style={{ color: isActive ? '#E8860C' : '#A89888' }}
      >
        {label}
      </label>
    </div>
  );
}
