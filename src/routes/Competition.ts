import {Router} from 'express';
import passport from 'passport';
import {uploadSubmission} from '../middleware/FileUpload';
import Competitions from '../controller/Competition';

const router = Router();

// get List
router.get('/', Competitions.getAllCompetitions);

// add submisssion
router.post(
  '/submission',
  passport.authenticate('user-jwt', {session: false}),
  uploadSubmission,
  Competitions.addSubmission
);

export default router;
