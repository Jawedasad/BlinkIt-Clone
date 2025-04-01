import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, getOrderDetailsController, paymentController, webhookStripe } from '../controllers/order.controller.js'

const orderRouter = Router()

orderRouter.post("/api/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/api/checkout',auth,paymentController)
orderRouter.post('/api/webhook',webhookStripe)
orderRouter.get("/api/order-list",auth,getOrderDetailsController)

export default orderRouter
