import { useMemo } from "react";
import PropTypes from "prop-types";
import { formatDay, formatPercent } from "../lib/format.js";
import LineChart from "./LineChart.jsx";

export default function PassRateChart({ daily, title = "Pass rate per day" }) {
  const labels = useMemo(() => daily.map((d) => formatDay(d.day)), [daily]);
  const values = useMemo(() => daily.map((d) => d.passRate), [daily]);
  return (
    <LineChart
      title={title}
      labels={labels}
      values={values}
      formatValue={formatPercent}
      max={1}
    />
  );
}

PassRateChart.propTypes = {
  daily: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.string.isRequired,
      passRate: PropTypes.number,
    }),
  ).isRequired,
  title: PropTypes.string,
};
