import { Router } from 'express'
import { forgotPasswordController, loginController, logoutController, refreshToken, registerUserController, resetpassword, updateUserDetails, uploadAvatar, userDetails, verifyEmailController, verifyForgotPasswordOtp } from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const userRouter = Router()

userRouter.post('/api/register',registerUserController)
userRouter.post('/api/verify-email',verifyEmailController)
userRouter.post('/api/login',loginController)
userRouter.get('/api/logout',auth,logoutController)
userRouter.put('/api/upload-avatar',auth,upload.single('avatar'),uploadAvatar)
userRouter.put('/api/update-user',auth,updateUserDetails)
userRouter.put('/api/forgot-password',forgotPasswordController)
userRouter.put('/api/verify-forgot-password-otp',verifyForgotPasswordOtp)
userRouter.put('/api/reset-password',resetpassword)
userRouter.post('/api/refresh-token',refreshToken)
userRouter.post('/api/request-otp', requestOTPController);
userRouter.post('/api/verify-otp', verifyOTPController);
userRouter.get('/api/user-details',auth,userDetails)




export default userRouter
