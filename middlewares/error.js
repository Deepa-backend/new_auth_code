import { Error } from "mongoose";

class Errorhandler extends Error{

    constructor(message,statusCode){

        super (message);

        this.statusCode =statusCode;


    }

}

export const errorMiddleware = (err,req,res,next)=>{

    err.statusCode = err.statusCode || 500,
    err.message  = err.message || "internal server error";

    console.log(err);

    if(err.name==="CastError")
    {
        const message = `Invalid $(err.path)`;
        err = new Errorhandler(message,400)

    }

      if(err.name==="JsonWebTokenError")
    {
        const message = `Json web token is invalid , Try again later`;
        err = new Errorhandler(message,400)

    }

       if(err.name==="TokenExpiredError")
    {
        const message = `Json web token is invalid , Try again later`;
        err = new Errorhandler(message,400)

    }

    if(err.code===11000){

        const messgae =`Duplicate $(object.keys(err.keyValue)) Entered`
      err = new Errorhandler(messgae,400);
    }

    return res.status(err.statusCode).json({
        success : false,
        message : err.message
    })
};
export default  Errorhandler