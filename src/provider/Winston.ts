import {createLogger, format, transports} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const transport = new DailyRotateFile({
  filename: './logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({stack: true}),
    format.splat(),
    format.json()
  ),
  defaultMeta: {service: 'hology-api'},
  transports: [
    new transports.File({filename: './logs/error.log', level: 'error'}),
    transport,
  ],
});

export default logger;
