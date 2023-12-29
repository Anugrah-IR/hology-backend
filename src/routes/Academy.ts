import {Router} from 'express';
import passport from 'passport';
import {uploadAcademyRegistrationData} from '../middleware/FileUpload';
import academy from '../controller/Academy';

const router = Router();

// Get List Academy
router.get('/', academy.getListAcademy);

// User Registrasi
router.post(
  '/registration',
  passport.authenticate('user-jwt', {session: false}),
  uploadAcademyRegistrationData,
  academy.addUserRegistration
);

// Add presensi
router.post(
  '/presensi',
  passport.authenticate('user-jwt', {session: false}),
  academy.addPresensiAcademy
);

export default router;
