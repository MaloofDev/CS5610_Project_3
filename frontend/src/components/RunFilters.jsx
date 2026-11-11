import PropTypes from "prop-types";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import useApiGet from "../lib/useApiGet.js";

const STATUSES = ["passed", "failed", "cancelled"];

export default function RunFilters({ filters, onChange, onClear }) {
  const repoQuery = filters.repo
    ? `?repo=${encodeURIComponent(filters.repo)}`
    : "";
  const { data: options } = useApiGet(`/api/runs/filters${repoQuery}`);

  const selects = [
    ["repo", "Repo", options?.repos],
    ["release", "Release", options?.releases],
    ["branch", "Branch", options?.branches],
    ["status", "Status", STATUSES],
  ];

  // A new repo clears release and branch, since their options narrow to it.
  function change(event) {
    const { name, value } = event.target;
    const next = { ...filters, [name]: value };
    if (name === "repo") Object.assign(next, { release: "", branch: "" });
    onChange(next);
  }

  return (
    <Card body className="shadow-sm mb-3">
      <Form
        aria-label="Filter runs"
        onSubmit={(event) => event.preventDefault()}
      >
        <Row className="g-2 align-items-end">
          {selects.map(([name, label, values = []]) => (
            <Form.Group as={Col} xs={6} md={4} lg key={name}>
              <Form.Label className="small text-body-secondary w-100 mb-1">
                {label}
                <Form.Select
                  size="sm"
                  className="mt-1"
                  name={name}
                  value={filters[name]}
                  onChange={change}
                >
                  <option value="">All</option>
                  {values.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Form.Select>
              </Form.Label>
            </Form.Group>
          ))}
          {[
            ["from", "From"],
            ["to", "To"],
          ].map(([name, label]) => (
            <Form.Group as={Col} xs={6} md={4} lg key={name}>
              <Form.Label className="small text-body-secondary w-100 mb-1">
                {label}
                <Form.Control
                  size="sm"
                  type="date"
                  className="mt-1"
                  name={name}
                  value={filters[name]}
                  onChange={change}
                />
              </Form.Label>
            </Form.Group>
          ))}
          <Col xs="auto" className="mb-1">
            <Button variant="outline-secondary" size="sm" onClick={onClear}>
              Clear filters
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

RunFilters.propTypes = {
  filters: PropTypes.objectOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};
