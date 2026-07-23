import dotenv from 'dotenv';
import { z } from 'zod';
import log from './logger.js';
dotenv.config();

const PORT_MAX = 65535;
const PORT_PRIV = 1023;

const envSchema =  z.object({
  NODE_ENV: z.enum(['development', 'testing', 'production']),
  //HOST: z.string(),
  //PORT: z.string().regex(/^\d+$/).transform(Number)
  //.refine( v => v <= PORT_MAX, {message: 'port execced the maximum range'})
  //.refine( v => v > 0, {message: 'port should be higher than 0'}),
  //JWT_ACCESS_TOKEN_SEC: z.string().length(44),
  JWT_REFRESH_TOKEN_SEC: z.string().length(44),
  DATABASE_URL: z.string(),
  DOTENV_CONFIG_QUIET: z.enum(['true', 'false']).transform(v => v === 'true'),
  GOOGLE_OAUTH_REFRESH_TOKEN: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string()
});


const { data: ENV, error } = envSchema.safeParse(process.env);


if(error) {
  error.issues.map(issue => {
    log.error(issue.path[0], issue.message);
  });
  throw new Error('error occured on loading environment variables');
};

//if(ENV.PORT <= PORT_PRIV) {
//  log.warn('application using priviledged port');
//};

export default ENV as z.infer<typeof envSchema>;
