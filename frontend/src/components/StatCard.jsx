import PropTypes from "prop-types";
import { Card } from "react-bootstrap";

export default function StatCard({ value, label }) {
  return (
    <Card body className="h-100 text-center shadow-sm">
      <p className="fs-2 fw-semibold mb-0">{value}</p>
      <p className="text-body-secondary mb-0">{label}</p>
    </Card>
  );
}

StatCard.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
};
