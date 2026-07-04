// @ts-expect-error Missing declaration file for 'express'
import { Router } from 'express';
import { register, login, me, getHistory } from './auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);
router.get('/history', getHistory);

export default router;
