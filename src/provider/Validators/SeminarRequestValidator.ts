import {ValidateFunction} from 'ajv';
import {JSONSchemaType} from 'ajv/dist/core';
import ajv from '../Ajv';

const seminarAttendanceFormSchema: JSONSchemaType<{
  ticket_uuid: string;
}> = {
  type: 'object',
  properties: {
    ticket_uuid: {type: 'string'},
  },
  required: ['ticket_uuid'],
};

const seminarRegistrationFormSchema: JSONSchemaType<{
  story: string;
}> = {
  type: 'object',
  properties: {
    story: {
      type: 'string',
      pattern:
        '^https://instagram.com/stories/\\S+/[0-9_\\-]+|^https://www.instagram.com/stories/\\S+/[0-9_\\-]+|^instagram.com/stories/\\S+/[0-9_\\-]+|^https://[a-zA-Z0-9.]instagram.com/stories/\\S+/[0-9_\\-]+',
    },
  },
  required: ['story'],
};

export const seminarAttendanceFormValidator: ValidateFunction = ajv.compile(
  seminarAttendanceFormSchema
);
export const seminarRegistrationFormValidator: ValidateFunction = ajv.compile(
  seminarRegistrationFormSchema
);
