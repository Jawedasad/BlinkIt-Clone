import { Router } from "express";
import auth from "../middleware/auth.js";
import { addToCartItemController, deleteCartItemQtyController, getCartItemController, updateCartItemQtyController } from "../controllers/cart.controller.js";

const cartRouter = Router()

cartRouter.post('/api/create',auth,addToCartItemController)
cartRouter.get("/api/get",auth,getCartItemController)
cartRouter.put('/api/update-qty',auth,updateCartItemQtyController)
cartRouter.delete('/api/delete-cart-item',auth,deleteCartItemQtyController)

export default cartRouter
