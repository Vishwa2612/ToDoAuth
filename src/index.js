import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import './auth.js';
import { taskModel } from "./task.js";
import { userModel } from "./user.js";

dotenv.config();

function isLog(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => {
    console.log(e);
    console.log("Error connection to db");
  });

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({secret:'cats'}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/',(req,res)=>{
    res.sendFile('D:/FullStackCourse/GoogleToDoList/main/login.html');
});


app.get('/auth/google',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] })
);


app.get('/google/callback',
    passport.authenticate('google',{
        successRedirect:'/protected',
        failureRedirect:'auth/failure'
    })
);


app.get('/todo',(req,res)=>{
  res.sendFile('D:/FullStackCourse/GoogleToDoList/main/home.html');
})


app.get('/protected',isLog, (req,res)=>{
    res.sendFile('D:/FullStackCourse/GoogleToDoList/main/home.html');
});


app.get('/auth/failure',(req,res)=>{
    res.send("Inoru vatti try pannu...");
});

app.use(session({
  secret:"secret",
  resave:false,
  saveUninitialized:false,
  store:MongoStore.create({
      client:mongoose.connection.getClient(),
      collectionName:"user",
      stringify:true
  })
}));
app.use(passport.session());

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.post("/signin" ,async (req, res) => {
const { username, password } = req.body;
const newUser = new userModel({username})
userModel.register(newUser,password,(err,acc)=>{
  if (err) {
    console.log(err);
    res.sendStatus(500);
  }else{
    passport.authenticate('local')(req,res,()=>{
      res.sendStatus(200);
      });
    }
  });
});

app.post('/signup',async(req,res)=>{
  try {
    const { username, password } =req.body;
    const newUser = new userModel({ username, password});
    await  newUser.save();
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.get('/tasks', async (req, res) => {
  const { task } =req.body;
  const tasks = await taskModel.find({task});
  res.json(tasks);
});



app.post('/task',async(req,res)=>{
  const newTodo = await taskModel.create(req.body);
  res.json(newTodo);
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});