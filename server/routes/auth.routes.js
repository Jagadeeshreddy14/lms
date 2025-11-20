import { login, logout, register, refreshToken, sendRegistrationOTP, verifyOTPAndRegister, resendOTP, forgotPassword, verifyResetOTP, resetPassword } from "../controllers/auth.controllers.js";
import { authenticate,authorize } from "../middleware/authMiddleaare.js";
import express from 'express';
import { validateEmailConfig } from '../utils/emailUtils.js';

const authRouter = express.Router();

// OTP-based registration routes
authRouter.post('/send-registration-otp', sendRegistrationOTP);
authRouter.post('/verify-otp', verifyOTPAndRegister);
authRouter.post('/resend-otp', resendOTP);

// Development-only: verify SMTP config (transporter.verify())
if (process.env.NODE_ENV !== 'production') {
	authRouter.get('/debug/email-verify', async (req, res) => {
		try {
			const result = await validateEmailConfig();
			return res.status(200).json(result);
		} catch (err) {
			return res.status(500).json({ success: false, error: err?.message || String(err) });
		}
	});
}

// Original routes (keeping for backward compatibility)
authRouter.post('/register', register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/refresh-token', refreshToken);

// Password reset routes
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/verify-reset-otp', verifyResetOTP);
authRouter.post('/reset-password', resetPassword);

// the educator route 
authRouter.get('/educator/profile',authenticate,authorize('educator'));


export default authRouter;