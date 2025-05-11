import express from 'express';
import { authService } from '../services/auth.js';
import  validateBody  from '../middlewares/validateBody.js';
import ctrlWrapper from "../utils/ctrlWrapper.js";
import { registerSchema, loginSchema, requestResetEmailSchema, resetPasswordSchema } from '../schemas/auth.js';
import { HttpError } from '../utils/errors.js';
import { requestResetEmailController } from '../controllers/auth.js';
import { resetPasswordController } from '../controllers/auth.js';

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

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      throw new HttpError(401, 'Refresh token not provided');
    }

    const { accessToken, refreshToken: newRefreshToken, user } = await authService.refresh(refreshToken);
    
    // Yeni refresh token'ı cookie'ye set et
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    res.json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken, user },
    });
  } catch (error) {
    next(error);
  }
});


// Email Reset
router.post("/send-reset-email", 
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController)
);

// Password Reset
router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);




export const authRouter = router;