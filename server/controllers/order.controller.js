import razorpay from "../config/razorpay.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

 export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image
                } ,
                paymentId : "",
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
            })
        })

        const generatedOrder = await OrderModel.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const user = await UserModel.findById(userId)

        const line_items  = list_items.map(item =>{
            return{
               price_data : {
                    currency : 'inr',
                    product_data : {
                        name : item.productId.name,
                        images : item.productId.image,
                        metadata : {
                            productId : item.productId._id
                        }
                    },
                    unit_amount : pricewithDiscount(item.productId.price,item.productId.discount) * 100   
               },
               adjustable_quantity : {
                    enabled : true,
                    minimum : 1
               },
               quantity : item.quantity 
            }
        })

        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card', 'upi', 'wallet'],
            customer_email : user.email,
            metadata : {
                userId : userId,
                addressId : addressId
            },
            line_items : line_items,
            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`
        }

        const order = await razorpay.orders.create({
            amount: totalAmt * 100,  // Amount in paise
            currency: "INR",
            receipt: `ORD_RCPT-${new mongoose.Types.ObjectId()}`,
            payment_capture: 1, // Auto-capture payment
        });

        return response.status(200).json(order);

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}



//http://localhost:8080/api/order/webhook
export async function webhookStripe(request, response) {
  const crypto = require('crypto');

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(request.body));
  const digest = shasum.digest('hex');

  if (digest === request.headers['x-razorpay-signature']) {
    console.log('Request is legit!');
    // Handle the event
    const event = request.body;

    switch (event.event) {
      case 'order.paid':
        const orderId = event.payload.order.entity.id;
        const paymentId = event.payload.payment.entity.id;
        const userId = event.payload.order.entity.receipt.split('-')[2]; // Assuming receipt is in the format ORD-RCPT-{userId}

        // Update order status in the database
        await OrderModel.updateMany(
          { orderId: orderId },
          { paymentId: paymentId, payment_status: 'PAID' }
        );

        // Clear the user's cart
        await UserModel.findByIdAndUpdate(userId, { shopping_cart: [] });
        await CartProductModel.deleteMany({ userId: userId });

        break;
      default:
        console.log(`Unhandled event type ${event.event}`);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  } else {
    // Pass it down the line
    response.status(400).json({ error: 'Invalid signature' });
  }
}


export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
