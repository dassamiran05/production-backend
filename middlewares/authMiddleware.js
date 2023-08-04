import JWT from 'jsonwebtoken';
import userModel from '../models/userModels.js';

//Protected routes token based
export const requireSignin = async (req, res, next) => {
    try {
        const decode = JWT.verify(req.headers.authorization, process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        console.log(error);
    }
}

//admin access
export const isAdmin = async(req, res, next) => {
    try{
        const user = await userModel.findById(req.user._id);
        if(user?.role !== 1){
            res.status(401).send({
                success:false,
                message:"Unauthorized access",
            });
        }else{
            next();
        }
    }catch(error){
        res.status(401).send({
            success:true,
            messgae:"Error in admin middleware",
            error
        })
    }
}