/* eslint-disable prettier/prettier */
import { Logger } from '@nestjs/common';
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;

  NATS_SERVERS: string[];
}

const envsSchema = joi.object({
  PORT: joi.number().required().error(new Error('PORT IS REQUIRED')),
  DATABASE_URL: joi.string().required().error(new Error('DATABASE_URL IS REQUIRED')),
  NATS_SERVERS: joi.array().items(joi.string()).required().error(new Error('NATS_SERVERS IS REQUIRED')),
}).unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','), //para asegurarse que NATS_SERVERS se un string[]
});

if (error) {
  Logger.error(`.ENV: ${error.message}` );
  throw new Error(error.message);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  datebaseUrl: envVars.DATABASE_URL,
  natsServers: envVars.NATS_SERVERS
};
