import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {Options} from 'ajv';
import {FormatsPluginOptions} from 'ajv-formats';

const options: Options = {
  allErrors: true,
  strict: true,
};

const format_options: FormatsPluginOptions = [
  'date-time',
  'date',
  'email',
  'password',
];

const ajv: Ajv = new Ajv(options);
addFormats(ajv, format_options);

export default ajv;
