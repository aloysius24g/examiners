import express, { NextFunction, Request, Response } from "express";
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

const diskStorage = multer({
  limits: {
    fileSize: 50 * 1024 * 1024
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

const app = express();

app.use(express.json());
app.use(cookieParser())

app.use((req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  // carefull here always return in gaurds.

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


app.post('/id-card-image', diskStorage.single('file'), async (req, res)=> {
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

RegisterRoutes(app);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // TODO
  // implement a logger here and monitor logs to find any bugs.
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

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
  console.log("Swagger UI at http://localhost:3000/docs");
});
