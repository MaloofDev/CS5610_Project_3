import PropTypes from "prop-types";
import { Table } from "react-bootstrap";
import { formatPercent } from "../lib/format.js";

export default function FlakyTestsTable({ tests }) {
  if (!tests.length) return <p>No flaky tests in this range.</p>;

  return (
    <div className="border rounded bg-body shadow-sm">
      <Table responsive className="align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col">Test</th>
            <th scope="col">Suite</th>
            <th scope="col">Branch</th>
            <th scope="col">Runs</th>
            <th scope="col">Flips</th>
            <th scope="col">Flip rate</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test) => (
            <tr key={`${test.branch}|${test.suite}|${test.name}`}>
              <td>{test.name}</td>
              <td>{test.suite}</td>
              <td>{test.branch}</td>
              <td>{test.runs}</td>
              <td>{test.flips}</td>
              <td>{formatPercent(test.flipRate)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

FlakyTestsTable.propTypes = {
  tests: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      suite: PropTypes.string.isRequired,
      branch: PropTypes.string.isRequired,
      runs: PropTypes.number.isRequired,
      flips: PropTypes.number.isRequired,
      flipRate: PropTypes.number.isRequired,
    }),
  ).isRequired,
};
