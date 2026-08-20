const variants = {
  listen: (
    <svg className="mecanisme__icon__svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle className="mecanisme__icon__ring" cx="40" cy="40" r="34" />
      <path
        className="mecanisme__icon__stroke"
        d="M28 34c0-6.6 5.4-12 12-12s12 5.4 12 12v10c0 4.4-3.6 8-8 8h-1"
      />
      <path
        className="mecanisme__icon__stroke"
        d="M36 52v4c0 2.2 1.8 4 4 4s4-1.8 4-4v-4"
      />
      <path
        className="mecanisme__icon__wave mecanisme__icon__wave--1"
        d="M58 36c3 0 5 2.2 5 5s-2 5-5 5"
      />
      <path
        className="mecanisme__icon__wave mecanisme__icon__wave--2"
        d="M62 32c5.5 0 9 4 9 9s-3.5 9-9 9"
      />
      <path
        className="mecanisme__icon__wave mecanisme__icon__wave--3"
        d="M66 28c8 0 13 6 13 13s-5 13-13 13"
      />
    </svg>
  ),
  diagnose: (
    <svg className="mecanisme__icon__svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle className="mecanisme__icon__ring" cx="40" cy="40" r="34" />
      <rect className="mecanisme__icon__stroke" x="22" y="26" width="22" height="28" rx="3" />
      <path className="mecanisme__icon__stroke" d="M26 34h14M26 40h14M26 46h8" />
      <path className="mecanisme__icon__needle" d="M48 52L58 22" pathLength="1" />
      <circle className="mecanisme__icon__accent" cx="58" cy="22" r="3" />
      <path
        className="mecanisme__icon__waveform"
        d="M18 58h6l3-8 4 16 4-10 3 6h8"
        pathLength="1"
      />
    </svg>
  ),
  choose: (
    <svg className="mecanisme__icon__svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle className="mecanisme__icon__ring" cx="40" cy="40" r="34" />
      <rect
        className="mecanisme__icon__option mecanisme__icon__option--1"
        x="18"
        y="30"
        width="14"
        height="22"
        rx="2"
      />
      <rect
        className="mecanisme__icon__option mecanisme__icon__option--2"
        x="33"
        y="24"
        width="14"
        height="28"
        rx="2"
      />
      <rect
        className="mecanisme__icon__option mecanisme__icon__option--3"
        x="48"
        y="30"
        width="14"
        height="22"
        rx="2"
      />
      <path className="mecanisme__icon__stroke" d="M21 36h8M36 30h8M51 36h8" />
      <path className="mecanisme__icon__cursor" d="M40 56l-5 8h10l-5-8z" />
    </svg>
  ),
  verify: (
    <svg className="mecanisme__icon__svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle className="mecanisme__icon__ring" cx="40" cy="40" r="34" />
      <circle className="mecanisme__icon__stroke" cx="40" cy="40" r="18" />
      <path className="mecanisme__icon__check" d="M31 40l6 6 14-16" pathLength="1" />
      <path className="mecanisme__icon__orbit" d="M40 14v4M40 62v4M14 40h4M62 40h4" />
    </svg>
  ),
};

export function MecanismeStepIcon({ variant }) {
  return (
    <div className={`mecanisme__icon mecanisme__icon--${variant}`} aria-hidden="true">
      <div className="mecanisme__icon__frame">{variants[variant]}</div>
    </div>
  );
}
