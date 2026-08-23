export function ComparatifMark({ type }) {
  if (type === "yes") {
    return (
      <svg
        className="comparatif__mark comparatif__mark--yes"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="comparatif__mark__ring" cx="12" cy="12" r="10" />
        <path className="comparatif__mark__check" d="M7.5 12.6l3 3 6-6.7" />
      </svg>
    );
  }

  return (
    <svg
      className="comparatif__mark comparatif__mark--no"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="comparatif__mark__ring" cx="12" cy="12" r="10" />
      <path className="comparatif__mark__cross" d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}
