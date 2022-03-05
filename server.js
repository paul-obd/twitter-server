//modules consts
const express =  require('express')
const path = require('path')
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser'); 
const cors = require('cors')
const multer = require('multer')

//routes consts
const productsRoutes = require('./routes/posts.routes')
const userRoutes = require('./routes/user.routes')


//multer consts
const fileStorage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'images')
    },
    filename: (req, file, cb)=>{
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
    }
})

const fileeFilter = (req, file, cb)=>{
   if (file.mimetype === 'image/png' ||
   file.mimetype === 'image/jpg'||
   file.mimetype === 'image/jpeg')
    {
        cb(null, true)
    }
    else{
        cb(null, false)
    }
}

//CORS middelwear
app.use(cors({
    origin: '*'
}))

//parsing middelwaers
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))


//using multer and adding the static images folder
app.use(multer({storage: fileStorage, fileFilter: fileeFilter}).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))




//routes middelwears
app.use('/posts', productsRoutes )

app.use('/user', userRoutes )


//error handling middelwears
app.use((err, req, res, next)=>{

    const status = err.statusCode || 500;
    res.status(status).json({
        message: err.message,
        data: err.data
    })
    
})




//connecting to db and statring the server
mongoose.connect('mongodb+srv://paul:paul@cluster0.gieey.mongodb.net/myFirstDatabase?retryWrites=true&w=majority').then(
     
    () => app.listen(3000, console.log('listening on port 3000 and connected to db'))
)
.catch(err => console.log('connecting to db err: ' + err))

