import { Link, useSearchParams } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { formatDate, formatPercent } from "../lib/format.js";
import useApiGet from "../lib/useApiGet.js";
import PassRateChart from "./PassRateChart.jsx";
import StatusChip from "./StatusChip.jsx";
import TestHistoryGrid from "./TestHistoryGrid.jsx";

export default function ReleaseDetailPage() {
  const [searchParams] = useSearchParams();
  const repo = searchParams.get("repo") ?? "";
  const release = searchParams.get("release") ?? "";
  const { data, error, loading } = useApiGet(
    `/api/releases/detail?${new URLSearchParams({ repo, release })}`,
  );
  const back = (
    <Link to={`/releases?${new URLSearchParams({ repo })}`}>
      ← All releases
    </Link>
  );

  if (loading) return <p role="status">Loading release…</p>;
  if (error) {
    return (
      <>
        <Alert variant="danger">{error.message}</Alert>
        {back}
      </>
    );
  }

  return (
    <>
      <p className="mb-2">{back}</p>
      <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <h1 className="mb-0">
          {data.repo} · {data.release}
        </h1>
        <StatusChip>{formatPercent(data.passRate)} pass</StatusChip>
        <span>
          {data.totalRuns} runs · {formatDate(data.firstRunAt)} to{" "}
          {formatDate(data.lastRunAt)}
        </span>
      </div>

      <div className="mb-4">
        <PassRateChart title="Pass rate across runs" daily={data.daily} />
      </div>

      <h2 className="h5">Test history (last {data.runs.length} runs)</h2>
      <TestHistoryGrid runs={data.runs} tests={data.tests} />
    </>
  );
}
