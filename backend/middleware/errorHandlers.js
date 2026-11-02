// Any /api request that no router handled.
export function apiNotFound(req, res) {
  res.status(404).json({ error: "Not found." });
}

// eslint-disable-next-line no-unused-vars -- Express needs four arguments for error handlers.
export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  const hideDetails = status >= 500 && process.env.NODE_ENV === "production";
  res.status(status).json({
    error: hideDetails
      ? "Something went wrong."
      : err.message || "Something went wrong.",
  });
}
