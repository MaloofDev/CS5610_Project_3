import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { getDb } from "../db/connection.js";
import { toObjectId } from "../lib/ids.js";
import { verifyPassword } from "./password.js";

const LOGIN_FAILED = "Wrong username or password.";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await getDb()
        .collection("users")
        .findOne({ username: String(username).toLowerCase() });
      // Same message for an unknown user and a wrong password, so usernames can't be probed.
      if (
        !user ||
        !(await verifyPassword(password, user.salt, user.passwordHash))
      ) {
        return done(null, false, { message: LOGIN_FAILED });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => done(null, user._id.toString()));

passport.deserializeUser(async (id, done) => {
  try {
    const _id = toObjectId(id);
    const user = _id
      ? await getDb()
          .collection("users")
          .findOne({ _id }, { projection: { passwordHash: 0, salt: 0 } })
      : null;
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

export default passport;
