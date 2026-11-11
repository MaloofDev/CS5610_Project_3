import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Table } from "react-bootstrap";
import { formatDateTime, formatDuration } from "../lib/format.js";
import StatusChip from "./StatusChip.jsx";

const COLUMNS = [
  "Started",
  "Repo",
  "Release",
  "Branch",
  "Commit",
  "Status",
  "Duration",
  "Tests",
];

export default function RunTable({ runs }) {
  return (
    <div className="border rounded bg-body shadow-sm">
      <Table responsive hover className="align-middle mb-0">
        <thead className="table-light">
          <tr>
            {COLUMNS.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run._id}>
              <td className="text-nowrap">
                <Link to={`/runs/${run._id}`}>
                  {formatDateTime(run.startedAt)}
                </Link>
              </td>
              <td>{run.repo}</td>
              <td>{run.release}</td>
              <td>{run.branch}</td>
              <td>
                <code>{run.commitSha.slice(0, 7)}</code>
              </td>
              <td>
                <StatusChip status={run.status} />
              </td>
              <td>{formatDuration(run.durationSec)}</td>
              <td className="text-nowrap">
                {run.passedTests} / {run.totalTests}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

RunTable.propTypes = {
  runs: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      startedAt: PropTypes.string.isRequired,
      repo: PropTypes.string.isRequired,
      release: PropTypes.string.isRequired,
      branch: PropTypes.string.isRequired,
      commitSha: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      durationSec: PropTypes.number.isRequired,
      passedTests: PropTypes.number.isRequired,
      totalTests: PropTypes.number.isRequired,
    }),
  ).isRequired,
};
