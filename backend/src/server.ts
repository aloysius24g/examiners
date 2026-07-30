import express, { NextFunction, Request, Response } from "express";
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../generated/tsoa/docs/swagger.json" with {type: 'json'}
import { RegisterRoutes } from "../generated/tsoa/routes/routes.js";
import { ConflictError, HttpError, InternalServerError, UnauthorizedError, ValidationError } from "./utils/httpErrors.js";
import { ValidateError } from 'tsoa';
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import envProvider from "./utils/envProvider.js";
import { createIdCardImage } from "./dal/idCardImageDal.js";
import { userAls } from "./utils/userContext.js";
import { contextSchema } from "./validators/contextValidators.js";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


const corsOptions = {
  origin: [
    'http://localhost:5173'
  ],
  credentials: true,
}

const diskStorage = multer({
  limits: {
    fileSize: 100 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if(! ['image/png', 'image/jpeg'].includes(file.mimetype)) {
      return cb(new ValidationError('Image must be of type png or jpeg'))
    }

    if(['png', 'jpeg', 'jpg'].includes(path.extname(file.originalname))) {
      return cb(new ValidationError('Image must be of type png or jpeg'))
    }
    cb(null, true);
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'id-card-images'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      cb(null, `${randomUUID()}${ext}`)
    },
  }),
});

const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 70,
  message: "Too many request, please try again later."
})

const imgAndOtpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  message: "Too many request, please try again later."
})

const app = express();

// proxy settings to make rate limiter work correctly
app.set('trust proxy', true);

app.use(helmet({
  crossOriginResourcePolicy: {
    policy: "cross-origin",
  },
}))
app.use(cors(corsOptions))
app.use(express.json());
app.use(cookieParser())

// rate limiting
app.use('/verification/email', imgAndOtpRateLimiter);
app.use(rateLimiter);

app.use((req: Request, _res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  // carefull here, always return in gaurds.

  // if no refresh token continue with null context
  if(! refreshToken) {
    return userAls.run(null, () => next())
  }

  let payload;
  try{
    payload = jwt.verify(refreshToken, envProvider.JWT_REFRESH_TOKEN_SEC);
  }catch(e) {
    if(e instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Session Expired');
    }
    throw new UnauthorizedError('Invalid session token');
  }

  // if with token verify sign, then verify structure, then continue with the context. 
  const contextResult = contextSchema.safeParse(payload) ;
  if(! contextResult.success) {
    throw new UnauthorizedError('Invalid token structure')
  }
  return userAls.run(contextResult.data, () => next())
});


app.post('/id-card-image', imgAndOtpRateLimiter, diskStorage.single('file'), async (req, res)=> {
  const fileName = req.file?.filename;
  if(fileName === undefined) {
    throw new ValidationError('Image not Uploaded.');
  }
  const response = await createIdCardImage(fileName);

  if(! response.success) {
    switch (response.error.cause) {
      case "DuplicateRecord":
        throw new ConflictError('Image name conflict.');
      case "RecordNotFound":
      case "ForeignKeyViolation":
      case "ValidationError":
      case "KnownRequestError":
      case "UnknownRequestError":
      case "DbUnAvailableError":
        throw new InternalServerError('Image not Uploaded.');
    }
  }

  return res.status(201).json({
    fileName: fileName
  });
})

app.get('/id-card-image/:fileName', (req, res) => {
  const f = fileURLToPath(import.meta.url);
  const p = path.dirname(f);
  
  return res.sendFile(path.join(p, '..', 'id-card-images', req.params.fileName));
})

RegisterRoutes(app);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // TODO
  // implement a logger here and monitor logs to find any bugs.
  //console.log(err)
  if(err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message
    })
  }

  if(err instanceof ValidateError) {
    return res.status(422).json({
      message: Object.entries(err.fields).map(m => m[1].message).join()
    })
  }
  
  // anything that are not http errors and not tsoa error thrown should be shown as internal server error.
  return res.status(500).json({
    message: 'Internal Server Error'
  })
})

if(process.env.NODE_ENV === 'development') {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.listen(3000, () => {

  console.log("Server running on http://localhost:3000");

  if(process.env.NODE_ENV === 'development') {
    console.log("Swagger UI at http://localhost:3000/docs");
  }
});
