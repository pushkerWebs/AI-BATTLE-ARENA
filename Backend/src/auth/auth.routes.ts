// @ts-expect-error Missing declaration file for 'express'
import { Router } from 'express';
import { register, login, me, getHistory, updateAvatar, googleLogin } from './auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);
router.get('/history', getHistory);
router.put('/avatar', updateAvatar);
router.post('/google', googleLogin);

export default router;
