import {JSONSchemaType, ValidateFunction} from 'ajv';
import ajv from '../Ajv';

const submissionFormSchema: JSONSchemaType<{
  team_id: number;
  submission_file: string;
}> = {
  type: 'object',
  properties: {
    team_id: {type: 'number'},
    submission_file: {type: 'string', maxLength: 45},
  },
  required: ['team_id', 'submission_file'],
};

export const submissionFormValidator: ValidateFunction =
  ajv.compile(submissionFormSchema);
