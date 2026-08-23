const variants = {
  listen: (
    <svg
      className="mecanisme__icon__svg"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      <circle className="mecanisme__icon__ring" cx="40" cy="40" r="34" />
      <path className="mecanisme__icon__stroke" d="M15 44a17.5 17.5 0 0 1 35 0" />
      <rect
        className="mecanisme__icon__stroke"
        x="10"
        y="44"
        width="10"
        height="17"
        rx="5"
      />
      <rect
        className="mecanisme__icon__stroke"
        x="45"
        y="44"
        width="10"
        height="17"
        rx="5"
      />
      <path
        className="mecanisme__icon__wave mecanisme__icon__wave--1"
        d="M59 46c4 0 7 2.7 7 6s-3 6-7 6"
      />
      <path
        className="mecanisme__icon__wave mecanisme__icon__wave--2"
        d="M59 40c8 0 13 5.4 13 12s-5 12-13 12"
      />
      <path
        className="mecanisme__icon__wave mecanisme__icon__wave--3"
        d="M59 35c11 0 17 7.5 17 17s-6 17-17 17"
      />
    </svg>
  ),
  diagnose: (
    <svg
      className="mecanisme__icon__svg"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      <circle className="mecanisme__icon__ring" cx="40" cy="40" r="34" />
      <rect
        className="mecanisme__icon__stroke"
        x="18"
        y="26"
        width="44"
        height="30"
        rx="6"
      />
      <path
        className="mecanisme__icon__waveform"
        d="M24 44h6l4-11 6 22 4-15 3 4h11"
        pathLength="1"
      />
      <circle className="mecanisme__icon__accent" cx="34" cy="33" r="3" />
    </svg>
  ),
  choose: (
    <svg
      className="mecanisme__icon__svg"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
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
    <svg
      className="mecanisme__icon__svg"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
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
