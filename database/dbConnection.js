import mongoose from "mongoose";

export const connection = ()=>{

    mongoose.connect(process.env.MONGO_URI,{
       // dbName : "MERN_AUTHENTICATION"
    }).then(()=>{

        console.log("connected to  database successfully")
    }).catch(err=>{
  console.log("failed to connect mongodb", err);
    })
}