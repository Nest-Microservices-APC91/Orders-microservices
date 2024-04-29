/* eslint-disable prettier/prettier */
import { Logger } from '@nestjs/common';
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
  DB_HOST: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT: number;
  DB_USERNAME: string;
}

const envsSchema = joi.object({
  PORT: joi.number().required().error(new Error('PORT IS REQUIRED')),
  NATS_SERVERS: joi.array().items(joi.string()).required().error(new Error('NATS_SERVERS IS REQUIRED')),

  DB_HOST: joi.string().required().error(new Error('DB_HOST IS REQUIRED')),
  DB_PASSWORD: joi.string().required().error(new Error('DB_PASSWORD IS REQUIRED')),
  DB_NAME: joi.string().required().error(new Error('DB_NAME IS REQUIRED')),
  DB_PORT: joi.string().required().error(new Error('DB_PORT IS REQUIRED')),
  DB_USERNAME: joi.string().required().error(new Error('DB_USERNAME IS REQUIRED')),
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
  natsServers: envVars.NATS_SERVERS,
  dbHost: envVars.DB_HOST,
  dbPassword: envVars.DB_PASSWORD,
  dbName: envVars.DB_NAME,
  dbPort: envVars.DB_PORT,
  dbUsername: envVars.DB_USERNAME,
};
