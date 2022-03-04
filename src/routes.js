import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import multer from 'multer';
import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);


routes.post('/sessions',SessionController.store);
routes.post('/users',UserController.store);

routes.use(authMiddleware);
routes.put('/users' ,UserController.update);

routes.post('/files', upload.single('file'), (req, res)=>{
  //console.log(req.file);
  //console.log(multerConfig.destination);  

  return res.json({ ok: true});
});



export default routes;
