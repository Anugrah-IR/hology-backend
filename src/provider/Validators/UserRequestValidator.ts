import {ValidateFunction} from 'ajv';
import {JSONSchemaType} from 'ajv';
import ajv from '../Ajv';

const userUpdateFormSchema: JSONSchemaType<{
  fullname: string;
  gender: string;
  birthdate: string;
  institution: string;
}> = {
  type: 'object',
  properties: {
    fullname: {type: 'string', minLength: 3, maxLength: 50},
    gender: {type: 'string', enum: ['M', 'F']},
    birthdate: {type: 'string', format: 'date'},
    institution: {type: 'string', minLength: 3, maxLength: 50},
  },
  required: ['fullname', 'gender', 'birthdate', 'institution'],
};

export const userUpdateFormValidator: ValidateFunction =
  ajv.compile(userUpdateFormSchema);
