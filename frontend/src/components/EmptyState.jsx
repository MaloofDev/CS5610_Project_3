import PropTypes from "prop-types";
import { Card } from "react-bootstrap";
import "./EmptyState.css";

export default function EmptyState({ children }) {
  return (
    <Card body className="empty-state text-center p-3 my-3">
      {children}
    </Card>
  );
}

EmptyState.propTypes = {
  children: PropTypes.node.isRequired,
};
