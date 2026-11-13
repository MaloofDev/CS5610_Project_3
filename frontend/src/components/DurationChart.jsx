import { useMemo } from "react";
import PropTypes from "prop-types";
import { formatDay, formatDuration } from "../lib/format.js";
import LineChart from "./LineChart.jsx";

export default function DurationChart({ daily }) {
  const labels = useMemo(() => daily.map((d) => formatDay(d.day)), [daily]);
  const values = useMemo(() => daily.map((d) => d.avgDuration), [daily]);
  return (
    <LineChart
      title="Average build duration per day"
      labels={labels}
      values={values}
      formatValue={formatDuration}
    />
  );
}

DurationChart.propTypes = {
  daily: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.string.isRequired,
      avgDuration: PropTypes.number,
    }),
  ).isRequired,
};
