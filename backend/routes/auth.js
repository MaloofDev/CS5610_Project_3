import express from "express";
import passport from "../auth/passport.js";
import { hashPassword } from "../auth/password.js";
import { getDb } from "../db/connection.js";

const router = express.Router();

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,30}$/;
const LOGIN_FAILED = "Wrong username or password.";

const publicUser = (user) => ({ _id: user._id, username: user.username });

router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};
    if (typeof username !== "string" || !USERNAME_PATTERN.test(username)) {
      return res.status(400).json({
        error: "Username must be 3 to 30 characters: letters, digits, _ or -.",
      });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    const user = {
      username: username.toLowerCase(),
      ...(await hashPassword(password)),
      createdAt: new Date(),
    };
    try {
      const { insertedId } = await getDb().collection("users").insertOne(user);
      user._id = insertedId;
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: "That username is taken." });
      }
      throw err;
    }

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json({ user: publicUser(user) });
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", (req, res, next) => {
  // Custom callback so a failed login returns JSON instead of redirecting.
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: LOGIN_FAILED });
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.json({ user: publicUser(user) });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });
});

router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Log in to continue." });
  }
  res.json({ user: publicUser(req.user) });
});

export default router;
