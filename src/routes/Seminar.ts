import {Router} from 'express';
import Seminar from '../controller/Seminar';
import passport from 'passport';

const router = Router();

/**
 * -------------- USER ROUTES ----------------
 */

// User Registrasi Seminar
// router.post(
//   '/register',
//   passport.authenticate('user-jwt', {session: false}),
//   Seminar.registerParticipant
// );

export default router;
