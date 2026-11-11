import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Card } from "react-bootstrap";
import "./LineChart.css";

Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

export default function LineChart({
  title,
  labels,
  values,
  formatValue = String,
  max,
}) {
  const canvas = useRef(null);
  // A single point has no trend to draw.
  const hasTrend = values.length > 1;

  useEffect(() => {
    if (!hasTrend) return;
    const chart = new Chart(canvas.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: "#1f4e79",
            cubicInterpolationMode: "monotone",
            pointRadius: 2,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (item) => formatValue(item.parsed.y) },
          },
        },
        scales: { y: { min: 0, max, ticks: { callback: formatValue } } },
      },
    });
    return () => chart.destroy();
  }, [hasTrend, labels, values, formatValue, max]);

  return (
    <Card body className="h-100 shadow-sm">
      <h2 className="h6">{title}</h2>
      {hasTrend ? (
        <div className="line-chart">
          <canvas ref={canvas} role="img" aria-label={title} />
        </div>
      ) : (
        <p className="text-body-secondary mb-0">
          Not enough history to chart yet.
        </p>
      )}
    </Card>
  );
}

LineChart.propTypes = {
  title: PropTypes.string.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  formatValue: PropTypes.func,
  max: PropTypes.number,
};
