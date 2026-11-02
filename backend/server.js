import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import passport from "./auth/passport.js";
import { connectToDb } from "./db/connection.js";
import { initCollections } from "./db/collections.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { apiNotFound, errorHandler } from "./middleware/errorHandlers.js";
import authRouter from "./routes/auth.js";
import runsRouter from "./routes/runs.js";
import dashboardRouter from "./routes/dashboard.js";
import releasesRouter from "./routes/releases.js";
import issuesRouter from "./routes/issues.js";
import updatesRouter from "./routes/updates.js";

const here = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(here, "..", ".env"), quiet: true });
for (const name of ["SESSION_SECRET", "MONGO_URI"]) {
  if (!process.env[name]) {
    console.error(`Missing ${name}. Copy .env.example to .env and set it.`);
    process.exit(1);
  }
}
const isProduction = process.env.NODE_ENV === "production";

const db = await connectToDb();
await initCollections(db);

const app = express();

// Behind a proxy in production, so secure cookies work.
if (isProduction) app.set("trust proxy", 1);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Everything except auth requires a login.
app.use("/api/auth", authRouter);
app.use("/api/runs", requireAuth, runsRouter);
app.use("/api/dashboard", requireAuth, dashboardRouter);
app.use("/api/releases", requireAuth, releasesRouter);
app.use("/api/issues", requireAuth, issuesRouter);
app.use("/api/updates", requireAuth, updatesRouter);

app.use("/api", apiNotFound);

// Serve the built app; the fallback lets React Router handle deep links.
const dist = path.join(here, "..", "frontend", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (
      req.method !== "GET" ||
      req.path.startsWith("/api") ||
      !req.accepts("html")
    ) {
      return next();
    }
    res.sendFile(path.join(dist, "index.html"));
  });
} else {
  console.log(
    "frontend/dist not found; run `npm run build` to serve the app from Express.",
  );
}

app.use(errorHandler);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () =>
  console.log(`Warden API listening on http://localhost:${port}`),
);
