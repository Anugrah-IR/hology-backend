import {ValidateFunction} from 'ajv';
import {JSONSchemaType} from 'ajv/dist/core';
import ajv from '../Ajv';

const checkUserAvailabilityFormSchema: JSONSchemaType<{
  user_fullname: string;
}> = {
  type: 'object',
  properties: {
    user_fullname: {type: 'string'},
  },
  required: ['user_fullname'],
};

export const checkUserAvailabilityFormValidator: ValidateFunction = ajv.compile(
  checkUserAvailabilityFormSchema
);

const registerTeamFormSchema: JSONSchemaType<{
  institution_id: number;
  competition_id: number;
  members: {
    user_uuid: string;
  }[];
}> = {
  type: 'object',
  properties: {
    institution_id: {type: 'number'},
    competition_id: {type: 'number'},
    members: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          user_uuid: {type: 'string'},
        },
        required: ['user_uuid'],
      },
    },
  },
  required: ['institution_id', 'competition_id', 'members'],
};

export const registerTeamFormValidator: ValidateFunction = ajv.compile(
  registerTeamFormSchema
);

const uploadTeamProofSchema: JSONSchemaType<{
  team_id: number;
  team_payment_proof: string;
  team_biodata: string;
}> = {
  type: 'object',
  properties: {
    team_id: {type: 'number'},
    team_payment_proof: {type: 'string', maxLength: 45},
    team_biodata: {type: 'string', maxLength: 45},
  },
  required: ['team_id', 'team_payment_proof', 'team_biodata'],
};

export const uploadTeamProofValidator: ValidateFunction = ajv.compile(
  uploadTeamProofSchema
);
