import { Router } from 'express'
import auth from '../middleware/auth.js'
import { AddCategoryController, deleteCategoryController, getCategoryController, updateCategoryController } from '../controllers/category.controller.js'

const categoryRouter = Router()

categoryRouter.post("/api/add-category",auth,AddCategoryController)
categoryRouter.get('/api/get',getCategoryController)
categoryRouter.put('/api/update',auth,updateCategoryController)
categoryRouter.delete("/api/delete",auth,deleteCategoryController)

export default categoryRouter
