
import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { AppSettings, Widget4Type } from '../types';

const WIDGET4_OPTIONS: { value: Widget4Type; label: string; emoji: string }[] = [
  { value: 'dadjoke',   label: 'Dad Joke',     emoji: '😄' },
  { value: 'onthisday', label: 'On This Day',  emoji: '📅' },
  { value: 'trivia',    label: 'Trivia',        emoji: '🧠' },
  { value: 'quote',     label: 'Quote',         emoji: '💬' },
  { value: 'countdown', label: 'Countdown',     emoji: '⏳' },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const THEMES: { id: AppSettings['theme']; label: string; colors: string[] }[] = [
  { id: 'dark',   label: 'Dark',   colors: ['#1e1b4b', '#0c2340', '#052e16'] },
  { id: 'light',  label: 'Light',  colors: ['#eef2ff', '#eff6ff', '#f0fdf4'] },
  { id: 'sunset', label: 'Sunset', colors: ['#3b1c08', '#1c0d1a', '#1a2400'] },
];

const INTERVALS = [
  { value: 5,  label: 'Every 5 min' },
  { value: 10, label: 'Every 10 min' },
  { value: 15, label: 'Every 15 min' },
  { value: 30, label: 'Every 30 min' },
  { value: 60, label: 'Every hour' },
];

const inputCls = `
  w-full rounded-xl px-3.5 py-2.5 text-sm font-medium
  focus:outline-none focus:ring-2 transition-all
`.trim();

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [local, setLocal] = React.useState(settings);

  // Sync when settings prop changes (e.g. theme preview from outside)
  useEffect(() => { setLocal(settings); }, [settings]);

  if (!isOpen) return null;

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setLocal(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => { onSave(local); onClose(); };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          background: 'var(--modal-bg)',
          border: '1px solid var(--modal-border)',
          color: 'var(--modal-text)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--modal-border)', background: 'var(--modal-header)' }}
        >
          <h2 className="text-base font-black tracking-tight">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-opacity opacity-50 hover:opacity-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5 space-y-6">

          {/* --- General --- */}
          <section className="space-y-3">
            <SectionLabel>General</SectionLabel>
            <Field label="Family Name" htmlFor="setting-family-name">
              <input
                id="setting-family-name"
                type="text"
                value={local.familyName}
                onChange={e => set('familyName', e.target.value)}
                className={inputCls}
                style={inputStyle}
              />
            </Field>
            <Field label="Location" htmlFor="setting-location">
              <input
                id="setting-location"
                type="text"
                value={local.location}
                onChange={e => set('location', e.target.value)}
                placeholder="City, State"
                className={inputCls}
                style={inputStyle}
              />
            </Field>
            <Field label="Clock Format">
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--modal-input-border)' }}>
                {([false, true] as const).map(is24 => (
                  <button
                    key={String(is24)}
                    onClick={() => set('use24Hour', is24)}
                    className="flex-1 py-2 text-[12px] font-black uppercase tracking-wider transition-all"
                    style={{
                      background: local.use24Hour === is24 ? 'var(--modal-accent)' : 'var(--modal-input-bg)',
                      color: local.use24Hour === is24 ? '#fff' : 'var(--modal-text-muted)',
                    }}
                  >
                    {is24 ? '24-hour' : '12-hour'}
                  </button>
                ))}
              </div>
            </Field>
          </section>

          <Divider />

          {/* --- Theme --- */}
          <section className="space-y-3">
            <SectionLabel>Theme</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(theme => {
                const active = local.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => set('theme', theme.id)}
                    className="relative rounded-xl overflow-hidden transition-all"
                    style={{
                      border: active
                        ? '2px solid var(--modal-accent)'
                        : '2px solid var(--modal-border)',
                      transform: active ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    {/* Color swatches */}
                    <div className="h-10 flex">
                      {theme.colors.map((c, i) => (
                        <div key={i} className="flex-1" style={{ background: c }} />
                      ))}
                    </div>
                    <div
                      className="px-2 py-1.5 text-[11px] font-black uppercase tracking-wider flex items-center justify-between"
                      style={{ background: 'var(--modal-input-bg)', color: 'var(--modal-text)' }}
                    >
                      <span>{theme.label}</span>
                      {active && <Check size={11} style={{ color: 'var(--modal-accent)' }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <Divider />

          {/* --- 4th Widget --- */}
          <section className="space-y-3">
            <SectionLabel>4th Widget</SectionLabel>
            <Field label="Widget Type" htmlFor="setting-widget4">
              <div className="relative">
                <select
                  id="setting-widget4"
                  value={local.widget4 || 'dadjoke'}
                  onChange={e => set('widget4', e.target.value as Widget4Type)}
                  className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                  style={inputStyle}
                >
                  {WIDGET4_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.4">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </Field>
            {local.widget4 === 'countdown' && (
              <>
                <Field label="Countdown Label" htmlFor="setting-countdown-label">
                  <input
                    id="setting-countdown-label"
                    type="text"
                    value={local.countdownLabel || ''}
                    onChange={e => set('countdownLabel', e.target.value)}
                    placeholder="e.g. Summer Break"
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Target Date" htmlFor="setting-countdown-date">
                  <input
                    id="setting-countdown-date"
                    type="date"
                    value={local.countdownDate || ''}
                    onChange={e => set('countdownDate', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
              </>
            )}
          </section>

          <Divider />

          {/* --- School Lunch --- */}
          <section className="space-y-3">
            <SectionLabel>School Lunch</SectionLabel>
            <Field label="School Name" htmlFor="setting-school-name">
              <input
                id="setting-school-name"
                type="text"
                value={local.schoolName}
                onChange={e => set('schoolName', e.target.value)}
                className={inputCls}
                style={inputStyle}
              />
            </Field>
            <Field label="MealViewer School ID" htmlFor="setting-school-id">
              <input
                id="setting-school-id"
                type="text"
                value={local.schoolId || ''}
                onChange={e => set('schoolId', e.target.value)}
                placeholder="e.g. LincolnES"
                className={`${inputCls} font-mono text-xs`}
                style={inputStyle}
              />
            </Field>
          </section>

          <Divider />

          {/* --- System --- */}
          <section className="space-y-3">
            <SectionLabel>System</SectionLabel>
            <Field label="Refresh Interval">
              <div className="flex flex-wrap -m-1">
                {INTERVALS.map(opt => {
                  const active = local.refreshInterval === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => set('refreshInterval', opt.value)}
                      className="m-1 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all"
                      style={{
                        background: active ? 'var(--modal-accent)' : 'var(--modal-input-bg)',
                        border: `1px solid ${active ? 'var(--modal-accent)' : 'var(--modal-input-border)'}`,
                        color: active ? '#fff' : 'var(--modal-text)',
                        opacity: active ? 1 : 0.7,
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </section>

          <Divider />

          {/* --- Calendar --- */}
          <section className="space-y-3">
            <SectionLabel>Google Calendar</SectionLabel>
            <Field label="iCal Secret Address" htmlFor="setting-ical-url">
              <input
                id="setting-ical-url"
                type="url"
                value={local.googleCalendarIcalUrl || ''}
                onChange={e => set('googleCalendarIcalUrl', e.target.value)}
                placeholder="https://calendar.google.com/calendar/ical/..."
                className={`${inputCls} font-mono text-[11px]`}
                style={inputStyle}
              />
            </Field>
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid var(--modal-border)', background: 'var(--modal-header)' }}
        >
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl text-sm font-black uppercase tracking-wider text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'var(--modal-accent)' }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Small helpers

const inputStyle: React.CSSProperties = {
  background: 'var(--modal-input-bg)',
  border: '1px solid var(--modal-input-border)',
  color: 'var(--modal-text)',
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3
    className="text-[10px] font-black uppercase tracking-[0.14em]"
    style={{ color: 'var(--modal-accent)', opacity: 0.9 }}
  >
    {children}
  </h3>
);

const Field: React.FC<{ label: string; htmlFor?: string; children: React.ReactNode }> = ({ label, htmlFor, children }) => (
  <div className="space-y-1.5">
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-bold uppercase tracking-wider"
      style={{ color: 'var(--modal-text-muted)' }}
    >
      {label}
    </label>
    {children}
  </div>
);

const Divider = () => (
  <div className="h-px" style={{ background: 'var(--modal-border)' }} />
);
