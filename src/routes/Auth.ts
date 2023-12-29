import {Router} from 'express';
import AuthController from '../controller/AuthController';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/update-password', AuthController.resetPassword);

export default router;
