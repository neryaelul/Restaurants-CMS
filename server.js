const express = require('express')

const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');

const uri = ""; // Put here The MongoDB URI String
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');


// עלאת קבצים
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public/images'),
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});



const upload = multer({ storage });


const client = new MongoClient(uri);

function sha256(data) {
    return crypto.createHash("sha256").update(data, "binary").digest("base64");
}
function sha256_hmac(str,secert) {
    return crypto.createHmac('sha256', secert).update(str.toString()).digest("hex");
}
async function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}
secertHash = "mLXDNep7B1HugLXypbmKj8h5YszXT8fW"

// לבדוק אם id תקין
function isValidInput(arg) {
  if (typeof arg === 'string' && /^[0-9a-fA-F]{24}$/.test(arg)) {
    return true; // Valid hex string of length 24
  } else if (Number.isInteger(arg)) {
    return true; // Valid integer
  } else {
    return false; // Invalid
  }
}





const app = express();
app.use(cors());

app.use(bodyParser.json()); // פה אנחנו מבקשים את גוף ההודעה שנשלחה אלינו
const port = 2000 

app.use(express.static('public')) 
app.use(express.static(path.join(__dirname, 'public')));

// עבור שליחת קבצים
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ message: 'File uploaded successfully!' });
});

app.get('/public/images/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, '/public/images/', filename));
});

// Define a POST route
// type - 
app.post('/:type/:value', (req, res) => {

  // מפצלים את הנתיב
  const urlParts = req.url.split('/');
  const pathType = urlParts[1];
  const pathValue = urlParts[2];

  // מה שהלקוח שולח
  const postData = req.body;

  //ממיר למערך JS
  var postDataJS = JSON.parse(JSON.stringify(postData));

// בודקים התחברות למונוגו
// פונקציה סנכרונית
  async function run() { 
    try {
      var collSend;
      const database =  client.db('restaurants');
      const coll =  database.collection(pathValue);
     if(pathType == "find" && (pathValue == "coupons" || pathValue == "reviews")){
        collSend = await coll.findOne(postDataJS);
        console.log(collSend);
      }else if(pathType == "check" && pathValue == "user"){
        const checkQuery = {"token": sha256_hmac(postDataJS.login_string,secertHash)}
        findQuery = await database.collection("users").findOne(checkQuery);
        if(findQuery != null){
          collSend = {"msg":"User login!","status": true,"findQuery":findQuery};
        }else{
          collSend = { "msg": "Username or Password not defind :(", "status": false, "findQuery": findQuery };
        }
        console.log(collSend);
      }else if(pathType == "findMany" && (pathValue == "list" || pathValue == "reviews")){ 
        collSend = await coll.find(postDataJS).toArray();
     
        console.log(collSend);
      }else if(pathType == "login"){
        const loginQuery = {"username": postDataJS.username, "password":  sha256_hmac(postDataJS.password,secertHash)}
        findQuery = await database.collection("users").findOne(loginQuery);
        if(findQuery != null){
          var token = await makeid(120) + '-' + await sha256_hmac(findQuery._id,'dwg3Adg345d');
        
          var do_token_hash = await sha256_hmac(token,secertHash);
         //  var api_key = await makeid(80)
         //  var key_hash = await sha256_hmac(api_key,"MasterKeyd3d2ec859eqXlNjKpKv1c35191dc068845b4bf0e485eqXlNjKpKv16a31390e7d264c52d208b53a837ac9");
     
         const resUpdateConnections = await database.collection("users").updateOne(
           { username: postDataJS.username },
           {     
              $set: { 
                  token: do_token_hash
               }          
           }
          );
          collSend = {"msg":"User login!","status": true,"findQuery":findQuery,"token": token,"resUpdateConnections": resUpdateConnections};
        }else{
          collSend = { "msg": "Username or Password not defind :(", "status": false, "findQuery": findQuery };
        }
        console.log(collSend);
      }else if(pathType == "insert"){
      
        if(pathValue == "admin" || pathValue == "list" || pathValue == "coupons" || pathValue == "remove"){
          var login_string = postDataJS.login_string
          var token = await sha256_hmac(login_string,secertHash);
          const findUserFilterAdmin =  {
                token: token,
                permissions: 1
          };
        UserAccess = await database.collection("users").findOne(findUserFilterAdmin);
        
          if(UserAccess != null){
            if(pathValue == "admin"){
                  let setUpsert;
                  if(postDataJS.newUserInfo.password){
                     setUpsert = 
                      { 
                        "username": postDataJS.newUserInfo.username,
                        "permissions":  parseInt(postDataJS.newUserInfo.permissions, 10),
                        "password": sha256_hmac(postDataJS.newUserInfo.password,secertHash)
                      } 
                  }else{
                     setUpsert = 
                      { 
                        "username": postDataJS.newUserInfo.username,
                        "permissions":  parseInt(postDataJS.newUserInfo.permissions, 10),
                        "password":sha256_hmac(postDataJS.newUserInfo.password,secertHash)
                      } 
                  }
                  queryInsert = await database.collection('users').updateOne(
                      {
                        "username": postDataJS.newUserInfo.username
                      },
                      { 
                        $set: setUpsert
                      },
                      { 
                        upsert: true 
                      }
                    )
                  collSend = await {"msg":"User upsert!","queryInsert":queryInsert};
             
            }else if(pathValue == "list"){
              findResFilter = await {"resrestaurant_name": postDataJS.newResInfo.resrestaurant_name}
              checkIfTheNewResExist = await database.collection("list").findOne(findResFilter);
              console.log(checkIfTheNewResExist);
              if(checkIfTheNewResExist == null){
                queryInsert = await database.collection("list").insertOne(postDataJS.newResInfo);
                collSend = await queryInsert;
              }else {
                collSend = await {"msg": "res exist"};
              }
                
            }else if(pathValue == "coupons"){
              findCouponFilter = await {"name": postDataJS.newCouponInfo.name}
              checkIfTheNewCouponExist = await database.collection("coupons").findOne(findCouponFilter);
              console.log(checkIfTheNewCouponExist);
              if(checkIfTheNewCouponExist == null){

                queryInsert = await  database.collection("coupons").insertOne(postDataJS.newCouponInfo);
                console.log(queryInsert);
                collSend = await {"msg": "Cupon added successfully ","queryInsert": queryInsert};
              }else {
                collSend = await {"msg": "Cupon exist"};
              }
            }else if(pathValue == "remove"){
                if(pathValue == "user"){
                  findUserFilter = await {"username": postDataJS.removeUserInfo.username}
                  checkIfTheNewUserExist = await coll.findOne(findUserFilter);
                  console.log(checkIfTheNewUserExist);
                  if(checkIfTheNewUserExist != null){
                      queryInsert = await coll.findOneAndDelete(postDataJS.removeUserInfo);
                      doQuerySend = await queryInsert;
                      collSend = await {"msg": "user remove"};
                    
                  }else {
                    collSend = await {"msg": "user exist"};
                  }
                }else{
                  collSend = await {"msg":"m not found or not have premissions :("}
                }
              }
            
            
        }else{
          collSend = await {"msg":"user not found or not have premissions :("}
        }
      
        console.log(UserAccess);
      
      }else if(pathValue == "reviews" || pathValue == "guest"){
        if(pathValue == "reviews"){
          var do_token_hash = await sha256_hmac(postDataJS.login_string,secertHash);
          var findUserFilter = { token: do_token_hash}
          User = await database.collection("users").findOne(findUserFilter);
          if(User != null){
            
            findResFilter = await {_id:  new ObjectId(postDataJS.restaurant_id)}
            checkIfTheResExist = await database.collection("list").findOne(findResFilter);
            console.log(checkIfTheResExist);
            if(checkIfTheResExist != null){
              const currentDate = new Date();

              const insertQ = await {
                  user_id: new ObjectId(postDataJS.user_id),
                  restaurant_id: new ObjectId(postDataJS.restaurant_id),
                  title: postDataJS.title,
                  body: postDataJS.body,
                  rate: postDataJS.rate,
                  images: postDataJS.images,
                  date: currentDate
      
              }
              collSend = await coll.insertOne(insertQ);
              console.log(collSend);

            }else {
              collSend = await {"msg": "res not exist"};
            }
              
            
            
          }else{
            collSend = await {"msg":"user not found :("}
          }
          console.log(User);
        }else if(pathValue == "guest"){
          
          var findUserFilter = { "username": postDataJS.newUserInfo.username }
          User = await database.collection("users").findOne(findUserFilter);
          
          if(User == null){
              var username = await postDataJS.newUserInfo.username;
              var password = await sha256_hmac(postDataJS.newUserInfo.password,secertHash);
              var token = await makeid(120);
              var do_token_hash = await sha256_hmac(token,secertHash);
              queryInsert = await database.collection("users").insertOne({username: username,password: password,permissions: 0,token:do_token_hash});
              
              collSend = await {"msg": "Welcome, for our new friend!","status": true,"queryInsert": queryInsert,"token": token};
            
          }else {
            collSend = await {"msg": "user exist","status": false};
          }
        }
      }
      }else if(pathType == "findById"){
          var find_login_string = await { token: sha256_hmac(postDataJS.login_string,secertHash) }
          findUserFilter = await database.collection("users").findOne(find_login_string);
          if(findUserFilter != null){
            if(isValidInput(postDataJS.id)){
              var id = await { _id: new ObjectId(postDataJS.id) }
              qFindById = await coll.findOne(id);
              if(qFindById != null){
                collSend = await  {"msg":"found","status_user": true,"status": true,"qFindById":qFindById}
              }else{
                collSend =  {"msg":"not found","status_user": true,"status": false,"qFindById":qFindById}
              }
              
            }else{
              collSend = await {"msg":"not found","status_user": true,"status": false}
            }
          }else{
            collSend = await {"msg":"user not found or not have premissions :(","status_user": false,"status": false}
          }
          console.log(collSend);
        
      }else if(pathType == "findByUserId"){
        if(isValidInput(postDataJS.user_id)){
          var id = await { _id: new ObjectId(postDataJS.user_id) }
          findUserFilter = await database.collection("users").findOne(id);
          if(findUserFilter != null){
            
              collSend = await {"msg":"login...","status": true,"info":findUserFilter}
            }
          }else{
            collSend = await {"msg":"user not found or not have premissions :(","status": false}
          }
          console.log(collSend);
        
        
      }else if(pathType == "reviews_and_users"){

        collSend = await client.db('restaurants').collection("reviews").aggregate([
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "users"
            }
          },
          {
            $unwind: "$users" // If you want to flatten the product array
          }, 
          {
            $match: {
              "restaurant_id": new ObjectId(postDataJS.restaurant_id)
            }
          }
        ]).project({"users.username":1,"rate":1,"body": 1, "date": 1, "images": 1,"title": 1}).toArray()
        console.log(collSend);
      }

 
      // תשובה 
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        res.json({
          pathValue: urlParts[1],
          postData: postData,
          coll: collSend
        });

        
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);




});



app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`)

})
