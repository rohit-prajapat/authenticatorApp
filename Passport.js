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
