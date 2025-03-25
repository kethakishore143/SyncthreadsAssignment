const express = require('express');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');
const Registeruser = require('./model');
const middelware = require('./middleware');
const cors = require('cors');



const app = express();
mongoose.connect("mongodb+srv://kishor1992k:Monika%40153@cluster0.dam2s94.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(
    () => console.log("Db connected")
)

app.use(express.json());
app.use(cors({origin:"*"}));

app.post('/register', async (req,res)=> {

    try{
      const {username,email,password,confirmpassword} = req.body;
      let exist = await Registeruser.findOne({email: email});

      if(exist){
        return res.status(400).send("user Already existed")
      }

      if(password !== confirmpassword){
        return res.status(400).send("passwords are not matching")
      }

     let newuser = new Registeruser({
        username,
        email,
        password,
        confirmpassword
     })
     await newuser.save();
     res.status(200).send("User Registred successfully");

    }
    catch(err){
      console.log(err);
      return res.status(500).send("Internal server Error");
    }
})

app.post('/login', async (req, res) => {
    try {
        const {email,password} = req.body;
        let exist = await Registeruser.findOne({email:email})
        if(!exist){
            return res.status(400).send("User not found")
        }
        if(exist.password !== password){
            return res.status(400).send("Invalid Cridentials")

        }

        let payload = {
            user : {
                id : exist.id
            }
        }
        
        jwt.sign(payload,'jwtsecurekey',{expiresIn:3600000},
            (err,token)=> {
                if (err) throw err;
                return res.json({token})
            }
        )
    }
    catch(err){
        console.log(err);
        return res.status(500).send("Server Error");
    }
});


app.get('/myprofile',middleware, async (req,res)=>{

    try{
        let exist = await Registeruser.findById(req.user.id);

        if(!exist){
            return res.status(400).send("User not found");
        }
        res.json(exist);
    }catch(err){
        console.log(err);
        return res.status(500).send("Server Error");
    }

})

app.listen(5000, () => {
    console.log("Server is running...");
});