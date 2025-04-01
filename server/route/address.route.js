import { Router } from 'express'
import auth from '../middleware/auth.js'
import { addAddressController, deleteAddresscontroller, getAddressController, updateAddressController } from '../controllers/address.controller.js'

const addressRouter = Router()

addressRouter.post('/api/create',auth,addAddressController)
addressRouter.get("/api/get",auth,getAddressController)
addressRouter.put('/api/update',auth,updateAddressController)
addressRouter.delete("/api/disable",auth,deleteAddresscontroller)

export default addressRouter
