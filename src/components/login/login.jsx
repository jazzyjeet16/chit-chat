import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './login.css';
import { Auth, db } from '../../lib/firebase'; // Fix import for auth and db
import upload from '../../lib/upload'; // Assuming you have an upload function for handling file uploads

const Login = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [avatar, setAvatar] = useState({
    file: null,
    url: ''
  });
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(''); // State for email input
  const [password, setPassword] = useState(''); // State for password input
  const [username, setUsername] = useState(''); // State for username input (Signup form)
  const [emailForReset, setEmailForReset] = useState(''); // State for storing email for password reset
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Toggle for forgot password

  const navigate = useNavigate();

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  // Email validation regex
  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(Auth, email, password);
      const user = userCredential.user;

      // Check if the user's email is verified
      if (!user.emailVerified) {
        toast.error('Please verify your email before logging in.');
        setLoading(false);
        return;
      }

      toast.success('Logged in successfully!');
      setTimeout(() => {
        navigate('/list');
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("No user exits! Please signup");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate email format
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(Auth, email, password);

      // Send email verification
      await sendEmailVerification(res.user);
      toast.info('Verification email sent! Please check your inbox.');

      // If user uploaded an avatar, upload it, otherwise use a default image
      let imageUrl = await upload(avatar.file) ; // Replace with your default avatar URL

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imageUrl,
        id: res.user.uid,
        blocked: [],
        emailVerified: false  // Add field to track email verification status
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: []
      });

      toast.success('Registered successfully! Please verify your email.');

      // Redirect after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error(err.message); // Handle error message
    } finally {
      setLoading(false);
    }
  };

  // Function to handle "Forgot Password"
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(Auth, emailForReset);
      toast.success('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false); // Hide the forgot password form after sending the email
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login'>
      <div className="item">
        <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>

        {showForgotPassword ? (
          // Forgot Password Form
          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              value={emailForReset}
              onChange={(e) => setEmailForReset(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Password Reset Email'}
            </button>
            <button onClick={() => setShowForgotPassword(false)}>Back to Login</button>
          </form>
        ) : isLogin ? (
          // Login Form
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              name="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" 
              required 
            />
            <input 
              type="password" 
              name="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              required 
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Sign In'}
            </button>
            <button type="button" onClick={() => setShowForgotPassword(true)}>
              Forgot Password?
            </button>
          </form>
        ) : (
          // Signup Form
          <form onSubmit={handleRegister}>
            <label htmlFor='file'>
              <img
                src={avatar.url || './avatar.png'}
                alt="Upload Avatar"
                style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
              />
              Upload an image
            </label>
            <input
              type="file"
              id="file"
              onChange={handleAvatar}
              style={{ display: 'none' }}
            />
            <input 
              type="text" 
              name="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username" 
              required 
            />
            <input 
              type="email" 
              name="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" 
              required 
            />
            <input 
              type="password" 
              name="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              required 
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </form>
        )}

        <button className="toggle" onClick={handleToggle}>
          {isLogin ? 'Create Account' : 'Already have an account? Sign In'}
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
