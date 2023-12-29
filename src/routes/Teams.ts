import {Router} from 'express';
import passport from 'passport';
import Teams from '../controller/Teams';
import {uploadTeamRegistrationData} from '../middleware/FileUpload';

const router = Router();

// check user
router.get(
  '/check-user',
  passport.authenticate('user-jwt', {session: false}),
  Teams.checkUserIsAvailable
);

// get team detail
router.get(
  '/',
  passport.authenticate('user-jwt', {session: false}),
  Teams.getTeamDetail
);

// register team
router.post(
  '/',
  passport.authenticate('user-jwt', {session: false}),
  Teams.registerTeam
);

// upload team proof and biodata
router.post(
  '/upload-data',
  passport.authenticate('user-jwt', {session: false}),
  uploadTeamRegistrationData,
  Teams.uploadTeamProof
);

// join team
router.post(
  '/join/:token',
  passport.authenticate('user-jwt', {session: false}),
  Teams.joinTeam
);

export default router;
