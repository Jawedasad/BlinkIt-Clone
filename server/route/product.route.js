import { Router } from 'express'
import auth from '../middleware/auth.js'
import { createProductController, deleteProductDetails, getProductByCategory, getProductByCategoryAndSubCategory, getProductController, getProductDetails, searchProduct, updateProductDetails } from '../controllers/product.controller.js'
import { admin } from '../middleware/Admin.js'

const productRouter = Router()

productRouter.post("/api/create",auth,admin,createProductController)
productRouter.post('/api/get',getProductController)
productRouter.post("/api/get-product-by-category",getProductByCategory)
productRouter.post('/api/get-pruduct-by-category-and-subcategory',getProductByCategoryAndSubCategory)
productRouter.post('/api/get-product-details',getProductDetails)

//update product
productRouter.put('/api/update-product-details',auth,admin,updateProductDetails)

//delete product
productRouter.delete('/api/delete-product',auth,admin,deleteProductDetails)

//search product 
productRouter.post('/api/search-product',searchProduct)

export default productRouter
