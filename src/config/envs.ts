/* eslint-disable prettier/prettier */
import { Logger } from '@nestjs/common';
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
  DATABASE_URL: string;
}

const envsSchema = joi.object({
  PORT: joi.number().required().error(new Error('PORT IS REQUIRED')),
  NATS_SERVERS: joi.array().items(joi.string()).required().error(new Error('NATS_SERVERS IS REQUIRED')),

  DATABASE_URL: joi.string().required().error(new Error('DATABASE_URL IS REQUIRED')),
}).unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','), //para asegurarse que NATS_SERVERS se un string[]
});

Logger.log('database': process.env.DATABASE_URL);

if (error) {
  Logger.error(`.ENV: ${error.message}` );
  throw new Error(error.message);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
  dbUrl: envVars.DATABASE_URL,
};
