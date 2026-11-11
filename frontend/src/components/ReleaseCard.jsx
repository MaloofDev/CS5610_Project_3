import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button, Card } from "react-bootstrap";
import { formatDateTime, formatPercent } from "../lib/format.js";
import StatusChip from "./StatusChip.jsx";

// Keeps cards in a row the same height; the release page lists the rest.
const MAX_LISTED = 3;

export default function ReleaseCard({
  repo,
  release,
  passRate,
  totalRuns,
  latestRun,
  failingTests,
}) {
  const detail = `/releases/detail?${new URLSearchParams({ repo, release })}`;

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body className="d-flex flex-column">
        <h2 className="h4">{release}</h2>
        <p>
          <StatusChip>{formatPercent(passRate)} pass</StatusChip> {totalRuns}{" "}
          runs
        </p>
        <p>
          <Link to={`/runs/${latestRun._id}`}>
            Last run {formatDateTime(latestRun.startedAt)}
          </Link>{" "}
          <StatusChip status={latestRun.status} />
        </p>
        <h3 className="h6 mb-1">Failing now</h3>
        {failingTests.length ? (
          <ul className="list-unstyled small">
            {failingTests.slice(0, MAX_LISTED).map((test) => (
              <li key={test} className="text-truncate" title={test}>
                {test}
              </li>
            ))}
            {failingTests.length > MAX_LISTED && (
              <li className="text-body-secondary">
                +{failingTests.length - MAX_LISTED} more
              </li>
            )}
          </ul>
        ) : (
          <p className="small">None</p>
        )}
        <Button
          as={Link}
          to={detail}
          variant="outline-dark"
          className="mt-auto align-self-start"
        >
          View release
        </Button>
      </Card.Body>
    </Card>
  );
}

ReleaseCard.propTypes = {
  repo: PropTypes.string.isRequired,
  release: PropTypes.string.isRequired,
  passRate: PropTypes.number,
  totalRuns: PropTypes.number.isRequired,
  latestRun: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    startedAt: PropTypes.string.isRequired,
  }).isRequired,
  failingTests: PropTypes.arrayOf(PropTypes.string).isRequired,
};
