import {Router} from 'express';
import Institution from '../controller/Institution';

const router = Router();

/**
 * -------------- PUBLIC ROUTES ----------------
 */
// TODO: cache this route
router.get('/', Institution.getAllInstitutions);

export default router;
