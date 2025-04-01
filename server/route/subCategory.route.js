import { Router } from "express";
import auth from "../middleware/auth.js";
import { AddSubCategoryController, deleteSubCategoryController, getSubCategoryController, updateSubCategoryController } from "../controllers/subCategory.controller.js";

const subCategoryRouter = Router()

subCategoryRouter.post('/api/create',auth,AddSubCategoryController)
subCategoryRouter.post('/api/get',getSubCategoryController)
subCategoryRouter.put('/api/update',auth,updateSubCategoryController)
subCategoryRouter.delete('/api/delete',auth,deleteSubCategoryController)

export default subCategoryRouter
