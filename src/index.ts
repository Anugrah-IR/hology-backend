import express, {Express, Request, Response} from 'express';
import morgan from 'morgan';
import cors from 'cors';
import Locals from './provider/Locals';
import ApiRoutes from './routes/Index';
import Passport from './provider/Passport';
import passport from 'passport';
import helmet from 'helmet';
import logger from './provider/Winston';

/**
 * -------------- GENERAL SETUP ----------------
 */

const port = Locals.config().port || 3000;
const app: Express = express();

// Helmet
app.use(helmet());

// reduce fingerprinting
app.disable('x-powered-by');

// CORS for allowing cross-origin requests
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://hology.ub.ac.id',
      'https://hology-admin.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      // 'Access-Control-Allow-Origin',
    ],
  })
);

// Morgan for logging
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'
  )
);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Passport
app.use(new Passport(passport).passport.initialize());

/**
 * -------------- ROUTES ----------------
 */

// root route
app.get('/', (req: Request, res: Response) => {
  // redirect to site hology.ub.ac.id
  res.redirect('https://hology.ub.ac.id');
});

// status route
app.get('/status', (req: Request, res: Response) => {
  res.send('API is running');
});

// Api routes
app.use('/api', ApiRoutes);

/**
 * -------------- STATIC FILES ----------------
 */
// Static Files
app.use('/resources/', express.static(__dirname + '/../public/uploads'));

/**
 * -------------- SERVER ----------------
 */
app
  .listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    logger.info('⚡️[server started]');
  })
  .on('error', (err: Error) => {
    console.log(err);
    logger.error('Server starting error: ', err);
  });
