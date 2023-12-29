import {JSONSchemaType, ValidateFunction} from 'ajv';
import ajv from '../Ajv';

const RegistrationFormSchema: JSONSchemaType<{
  academy_id: number;
  linkedin: string;
  ktm: string;
  cv: string;
  soal: object;
}> = {
  type: 'object',
  properties: {
    academy_id: {type: 'number'},
    linkedin: {type: 'string'},
    ktm: {type: 'string'},
    cv: {type: 'string'},
    soal: {type: 'object'},
  },
  required: ['linkedin', 'ktm', 'cv', 'soal'],
};

export const registrationFormValidator: ValidateFunction = ajv.compile(
  RegistrationFormSchema
);

const PresensiFormSchema: JSONSchemaType<{
  token_presensi: string;
}> = {
  type: 'object',
  properties: {
    token_presensi: {type: 'string'},
  },
  required: ['token_presensi'],
};

export const presensiFormValidator: ValidateFunction =
  ajv.compile(PresensiFormSchema);
