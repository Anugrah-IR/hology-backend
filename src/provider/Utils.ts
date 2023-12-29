import jwt from 'jsonwebtoken';
import secrets from './Secrets';

interface Payload {
  sub: string;
  iat: number;
}

interface SignedToken {
  token: string;
  expiresIn: string;
}

export function issueUserJwt(user_uuid: string): SignedToken {
  const expiresIn = '1d';
  const secret = secrets.getPrivateKey();
  const payload: Payload = {
    sub: user_uuid,
    iat: Date.now(),
  };
  const token = jwt.sign(payload, secret, {
    expiresIn: expiresIn,
    algorithm: 'RS256',
  });
  return {
    token: 'Bearer ' + token,
    expiresIn: expiresIn,
  };
}

export function issueAdminJwt(admin_uuid: string): SignedToken {
  const expiresIn = '1d';
  const secret = secrets.getPrivateKey();
  const payload: Payload = {
    sub: admin_uuid,
    iat: Date.now(),
  };
  const token = jwt.sign(payload, secret, {
    expiresIn: expiresIn,
    algorithm: 'RS256',
  });
  return {
    token: 'Bearer ' + token,
    expiresIn: expiresIn,
  };
}
