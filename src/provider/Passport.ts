import {PassportStatic} from 'passport';
import {
  ExtractJwt,
  Strategy as JWTStrategy,
  StrategyOptions,
} from 'passport-jwt';
import secrets from './Secrets';
import prisma from './Client';

export default class Passport {
  private _passport: PassportStatic;
  private options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secrets.getPublicKey(),
    algorithms: ['RS256'],
  };

  constructor(passport: PassportStatic) {
    this._passport = passport;

    this._passport.use(
      'user-jwt',
      new JWTStrategy(this.options, (payload, done) => {
        prisma.users
          .findUnique({
            where: {
              user_uuid: payload.sub,
            },
          })
          .then(user => {
            if (user) {
              return done(null, user);
            } else {
              return done(null, false);
            }
          })
          .catch(err => {
            return done(err, false);
          });
      })
    );

    this._passport.use(
      'admin-jwt',
      new JWTStrategy(this.options, (payload, done) => {
        // search for admin
        prisma.admins
          .findUnique({
            where: {
              admin_uuid: payload.sub,
            },
          })
          .then(admin => {
            if (admin) {
              return done(null, admin);
            } else {
              return done(null, false);
            }
          })
          .catch(err => {
            return done(err, false);
          });
      })
    );
  }

  get passport(): PassportStatic {
    return this._passport;
  }
}
