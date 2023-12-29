import {ValidateFunction} from 'ajv';
import {JSONSchemaType} from 'ajv/dist/core';
import ajv from '../Ajv';

// Schema
const userSchema: JSONSchemaType<{
  fullname: string;
  email: string;
  password: string;
  gender: string;
  birthdate: string;
  institution: string;
}> = {
  type: 'object',
  properties: {
    fullname: {type: 'string', minLength: 3, maxLength: 50},
    email: {type: 'string', format: 'email'},
    password: {type: 'string', format: 'password'},
    gender: {type: 'string', enum: ['M', 'F']},
    birthdate: {type: 'string', format: 'date'},
    institution: {type: 'string', minLength: 3, maxLength: 50},
  },
  required: [
    'fullname',
    'email',
    'password',
    'gender',
    'birthdate',
    'institution',
  ],
};

const LoginFormSchema: JSONSchemaType<{
  email: string;
  password: string;
}> = {
  type: 'object',
  properties: {
    email: {type: 'string', format: 'email'},
    password: {type: 'string'},
  },
  required: ['email', 'password'],
};

const forgotPasswordFormSchema: JSONSchemaType<{
  email: string;
}> = {
  type: 'object',
  properties: {
    email: {type: 'string', format: 'email'},
  },
  required: ['email'],
};

const resetPasswordFormSchema: JSONSchemaType<{
  email: string;
  password: string;
  token: string;
}> = {
  type: 'object',
  properties: {
    email: {type: 'string', format: 'email'},
    password: {type: 'string', format: 'password'},
    token: {type: 'string'},
  },
  required: ['email', 'password', 'token'],
};

// Validator
export const userValidator: ValidateFunction = ajv.compile(userSchema);
export const loginFormValidator: ValidateFunction =
  ajv.compile(LoginFormSchema);
export const forgotPasswordFormValidator: ValidateFunction = ajv.compile(
  forgotPasswordFormSchema
);
export const resetPasswordFormValidator: ValidateFunction = ajv.compile(
  resetPasswordFormSchema
);
