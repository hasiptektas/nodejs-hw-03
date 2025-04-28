import express from 'express';
import { authService } from '../services/auth.js';
import  validateBody  from '../middlewares/validateBody.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    
    res.json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: { accessToken, user },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    // Cookie'yi temizle
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    // 204 No Content
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export const authRouter = router;