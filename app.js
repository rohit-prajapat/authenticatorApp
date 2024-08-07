const express = require('express');
const app = express();
const UserModel = require('./config/databases'); // Ensure the correct path to your user model
const { hashSync, compareSync } = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const { connection } = require('mongoose');
const { render } = require('ejs');
const LocalStrategy = require('passport-local').Strategy;

app.get('/', (req, res) => {
  
    res.render("Home");
});


passport.use(new LocalStrategy(
    async function (username, password, done) {
         console.log("Passport strategy function is called");
         try {
             const user = await UserModel.findOne({ username: username });
             console.log('User is here: ', user);
 
             if (!user) {
                 console.log("User not found");
                 return done(null, false, { message: 'Incorrect username.' });
             }
 
             console.log("Comparing passwords");
             if (!compareSync(password, user.password)) {
                 console.log("Incorrect password");
                 return done(null, false, { message: 'Incorrect password.' });
             }
 
             console.log("User authenticated successfully");
             return done(null, user);
 
         } catch (err) {
             console.log("Error finding user:", err);
             return done(err);
         }
     }
 ));

 
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    try {
        const user = await UserModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/MongoStore',
        collectionName: 'sessions'
    }),
    cookie: {
        // secure: true 
        maxAge: 1000000000
    }
}));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());
app.set('trust proxy', 1); // trust first proxy





app.get('/login', (req, res) => {
    console.log("get log in is called :");
    res.render("Login");
});

app.get('/register', (req, res) => {
    res.render('Register');
});

app.post('/login',passport.authenticate('local', {successRedirect: '/protected', failureRedirect: '/login'}));

// app.post('/register', (req, res) => {
//     let { username, password } = req.body;
//     let user = new UserModel({
//         username: username,
//         password: hashSync(password, 10)
//     });

//     user.save().then((data) => {
//         console.log("User registered successfully:", data);
//     }).catch(err => {
//         console.log("Error registering user:", err);
//     });


    

//     res.redirect('user logIn');
// });
app.post('/register', (req, res, next) => {
    const user = new UserModel({
        username: req.body.username,
        password: hashSync(req.body.password, 10)
    });

    user.save()
        .then(user => {
            // Automatically log in the user after registration
            req.login(user, (err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/protected'); // Redirect to a protected route or dashboard
            });
        })
        .catch(err => {
            res.status(500).send({ error: 'Registration failed' });
        });
});





const donefunct = () => {
    console.log('done');
};

app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            console.log('Error in logout:', err);
            return next(err);
        }
        res.redirect('/');
    });
});

app.get('/protected', (req, res) => {
    if (req.isAuthenticated()) {
        res.send("done you log in : ");
    } else {
        res.send("error : Not Authenticated");
    }
});
app.use((err,req,res,next)=>{
   
    res.send(err);
})
const port = 8012;
app.listen(port, () => {
    console.log('Server is started: at port', port);
});
