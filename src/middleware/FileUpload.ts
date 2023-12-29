import {NextFunction, Request, Response} from 'express';
import multer from 'multer';
import Randomstring from 'randomstring';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    switch (file.fieldname) {
      case 'ktm': {
        cb(null, 'public/uploads/ktm');
        break;
      }
      case 'cv': {
        cb(null, 'public/uploads/cv');
        break;
      }
      case 'payment_proof': {
        cb(null, 'public/uploads/payment');
        break;
      }
      case 'biodata': {
        cb(null, 'public/uploads/berkas_pendukung');
        break;
      }
      case 'submission': {
        cb(null, 'public/uploads/submission');
        break;
      }
      default:
        cb(null, 'public/etc');
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Randomstring.generate(15)}-${file.originalname}`);
  },
});

const uploader = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // check file size not more than 10mb
    if (file.size > 10000000) {
      return cb(new Error('File size is too large'));
    }

    // check file type to only accept jped, png, and pdf
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'application/pdf'
    ) {
      return cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

export function uploadAcademyRegistrationData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uploadData = uploader.fields([
    {name: 'ktm', maxCount: 1},
    {name: 'cv', maxCount: 1},
  ]);

  uploadData(req, res, err => {
    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }
    next();
  });
}

export function uploadTeamRegistrationData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uploadData = uploader.fields([
    {name: 'payment_proof', maxCount: 1},
    {name: 'biodata', maxCount: 1},
  ]);

  uploadData(req, res, err => {
    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }
    next();
  });
}

export function uploadSubmission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uploadData = uploader.single('submission');

  uploadData(req, res, err => {
    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }
    next();
  });
}
