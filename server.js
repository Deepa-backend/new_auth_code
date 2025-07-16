import { app } from "./app.js";

app.listen (process.env.PORT,()=>{

    console.log(`Server  is running on this ${process.env.PORT} port number`)

})

