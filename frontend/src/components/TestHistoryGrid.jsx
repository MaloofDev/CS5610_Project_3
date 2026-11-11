import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button, Table } from "react-bootstrap";
import { formatDate, formatTime } from "../lib/format.js";
import "./TestHistoryGrid.css";

const CELLS = {
  passed: ["✓", "bg-success-subtle text-success-emphasis"],
  failed: ["✕", "bg-danger-subtle text-danger-emphasis"],
  skipped: ["–", "bg-secondary-subtle text-secondary-emphasis"],
};
const NOT_RUN = ["·", "text-body-tertiary"];

export default function TestHistoryGrid({ runs, tests }) {
  const [showPassing, setShowPassing] = useState(false);
  const failing = tests.filter((test) => test.results.includes("failed"));
  const passingCount = tests.length - failing.length;
  // Passing tests only collapse when there are failures to focus on.
  const canCollapse = failing.length > 0 && passingCount > 0;
  const rows = showPassing || !canCollapse ? tests : failing;

  return (
    <>
      <div className="border rounded bg-body shadow-sm">
        <Table
          responsive
          className="test-history align-middle text-center mb-0"
        >
          <thead className="table-light">
            <tr>
              <th scope="col" className="text-start">
                Test
              </th>
              {runs.map((run) => (
                <th key={run._id} scope="col" className="text-nowrap fw-normal">
                  <Link to={`/runs/${run._id}`} className="small">
                    {formatDate(run.startedAt)}
                    <span className="d-block text-body-secondary">
                      {formatTime(run.startedAt)}
                    </span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((test) => (
              <tr key={test.name}>
                <th scope="row" className="text-start fw-normal text-nowrap">
                  {test.name}
                </th>
                {test.results.map((status, index) => {
                  const [symbol, tone] = CELLS[status] ?? NOT_RUN;
                  const label = status ?? "not run";
                  return (
                    <td key={index}>
                      <span
                        className={`test-history__cell ${tone}`}
                        role="img"
                        aria-label={label}
                        title={label}
                      >
                        {symbol}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={runs.length + 1}>
                  These runs have no test results.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
        {canCollapse && (
          <Button
            variant="outline-secondary"
            onClick={() => setShowPassing(!showPassing)}
          >
            {showPassing
              ? "Hide passing tests"
              : `Show passing tests (${passingCount})`}
          </Button>
        )}
        <span className="text-body-secondary ms-auto">
          Click a date to open that run
        </span>
      </div>
    </>
  );
}

TestHistoryGrid.propTypes = {
  runs: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      startedAt: PropTypes.string.isRequired,
    }),
  ).isRequired,
  tests: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      results: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ).isRequired,
};
