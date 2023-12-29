import {Router} from 'express';
import UsersRoute from './User';
import AuthRoute from './Auth';
import InstitutionRoute from './Institution';
import SeminarRoute from './Seminar';
import Academy from './Academy';
import Teams from './Teams';
import Competitions from './Competition';

const router = Router();

router.use('/user', UsersRoute);
router.use('/auth', AuthRoute);
router.use('/institutions', InstitutionRoute);
router.use('/seminar', SeminarRoute);
router.use('/academy', Academy);
router.use('/teams', Teams);
router.use('/competition', Competitions);

export default router;
