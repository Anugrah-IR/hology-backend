import {Router} from 'express';
import UserRouter from '../controller/User';
import passport from 'passport';
const router = Router();

/**
 * -------------- USER ROUTES ----------------
 */
// user getting their own profile
router.get(
  '/profile',
  passport.authenticate('user-jwt', {session: false}),
  UserRouter.getUserProfile
);

// user updating its profile
router.put(
  '/profile',
  passport.authenticate('user-jwt', {session: false}),
  UserRouter.updateUser
);

// router.get('/refreshToken', checkBearer, refreshToken);
// router.put('/register-seminar/:id', checkBearer, updateSeminar);
// router.put('/register-academy/:id', checkBearer, updateAcademy);

export default router;
