import { authService } from '../services/auth.js';


export const requestResetEmailController = async (req, res) => {
    await authService.requestResetToken(req.body.email);

    res.json({
        message: 'Reset password email was successfully sent!',
        status: 200,
        data: {},
    });
};

export const resetPasswordController = async (req, res) => {
    const { token, password } = req.body; // Destructuring ile token ve password'ü al
    await authService.resetPassword(token, password); // Doğru parametreleri gönder
    res.json({
      message: 'Password was successfully reset!',
      status: 200,
      data: {},
    });
  };