import PropTypes from "prop-types";

const TONES = {
  passed: "bg-success-subtle text-success-emphasis",
  failed: "bg-danger-subtle text-danger-emphasis",
  cancelled: "bg-secondary-subtle text-secondary-emphasis",
  skipped: "bg-secondary-subtle text-secondary-emphasis",
  neutral: "bg-body text-body",
};

// Outlined pill for a run or test status, or any short label like "91% pass".
export default function StatusChip({ status = "neutral", children }) {
  return (
    <span className={`badge rounded-pill border fw-normal ${TONES[status]}`}>
      {children ?? status}
    </span>
  );
}

StatusChip.propTypes = {
  status: PropTypes.oneOf(Object.keys(TONES)),
  children: PropTypes.node,
};
