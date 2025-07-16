import { User } from "../models/userModel.js";
import { Strategy as JwtStrategy } from 'passport-jwt'; 
import passport from "passport";

// Custom extractor to get JWT from cookies
const cookieExtractor = function(req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.accessToken; // match your cookie name exactly
  }
  return token;
};

const opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET_KEY,
};

// Register the JWT strategy
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload._id).select('-password');
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;
