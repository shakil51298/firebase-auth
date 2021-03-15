import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';


// firebase.initializeApp(firebaseConfig)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function App() {

  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isLogedIn: false,
    email: '',
    name: '',
    emailStutus: 'non-verified',
    photo: '',
  })
  const [massage, setMassage] = useState({
    massage: ""
  })
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleClick = () => {
    firebase.auth().signInWithPopup(googleProvider)
      .then(res => {
        const { email, displayName, emailVerified, photoURL } = res.user
        const logedInUser = {
          isLogedIn: true,
          email: email,
          name: displayName,
          emailStutus: emailVerified,
          photo: photoURL,
        }
        setUser(logedInUser)
      })
      .catch(err => {
        console.log(err);
        console.log(err.message);
      })
  }
  const handleFacebook = () => {
    firebase.auth().signInWithPopup(fbProvider).then((result) => {
        // /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;
        var accessToken = credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
       
        console.log('facebook user : ',user);

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        // ...
      });
  }
  const handleOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const oUTuser = {
          isLogedIn: false,
          email: "",
          name: '',
          emailStutus: '',
          photo: '',
          error: '',
          success: ''
        }
        setUser(oUTuser)
      })
      .catch((error) => {
        // An error happened.
      });
  }


  const getValuebByonBlur = (event) => {
    let isFieldValid;
    if (event.target.name === 'name') {
      isFieldValid = event.target.value;
    }
    if (event.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(event.target.value)
      // console.log(isEmailValidate);
    }
    if (event.target.name === 'password') {
      const isPsswordValid = event.target.value.length > 6;
      const passwordHasLatter = (/[a-zA-Z]/).test(event.target.value) //validation with regex
      isFieldValid = isPsswordValid && passwordHasLatter;
    }
    // update to state
    if (isFieldValid) {
      const newUserInfo = { ...user } // copy user state
      newUserInfo[event.target.name] = event.target.value; //-*--*-*-important
      setUser(newUserInfo)
    }
  }
  const handleSubmit = (event) => {
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user }
          newUserInfo.error = ''
          newUserInfo.success = true;
          setUser(newUserInfo)
          updateUserName(user.name);
        })
        .catch((error) => {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message
          newUserInfo.success = false;
          setUser(newUserInfo)
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user }
          newUserInfo.error = ''
          newUserInfo.success = true;
          setUser(newUserInfo)
          console.log("sign in user info", res.user);
        })
        .catch((error) => {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message
          newUserInfo.success = false;
          setUser(newUserInfo)
        });
    }
    event.preventDefault();
  }
  const updateUserName = (name) => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    })
      .then(function () {
        console.log("user name updated successfully")
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  
  return (
    <div className="App">
      <button className="btn btn-warning" onClick={handleFacebook}>sign in with facebook</button>
      {
        user.isLogedIn ? <button className="btn btn-primary" onClick={handleOut}>Sign Out</button> :
          <button className="btn btn-primary" onClick={handleClick}>Sign In</button>

      }
      {
        user.isLogedIn ? <div>
          <p>welcome , {user.name}</p>
          <p>{user.email}</p>
          <img src={user.photo} alt="shakil" />
        </div> : <p>{massage.massage}</p>
      }
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New User sign</label>
      <form action="">
        {
          newUser && <input type="text" name="name" onBlur={getValuebByonBlur} id="" required placeholder="name" />
        }
        <br />
        <input type="email" onBlur={getValuebByonBlur} name="email" required id="" placeholder="Email" />
        <br />
        <input type="password" onBlur={getValuebByonBlur} name="password" required id="" placeholder="Password" />
        <br />
        <input type="submit" onClick={handleSubmit} value={newUser ? "Sign Up " : "sign in"} />
        <input type="reset" value="Reset" />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      {user.success && <p style={{ color: 'green' }}>
        user {newUser ? 'created' : "logged in"}  successfully!
        </p>}
    </div>
  );
}

export default App;
