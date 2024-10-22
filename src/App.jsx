import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import List from './components/list/list.jsx';
import Chat from './components/chat/chat.jsx';
import Detail from './components/detail/detail.jsx';
import Login from './components/login/login.jsx';
import Notification from './components/Notification/Notification.jsx';
import { onAuthStateChanged } from 'firebase/auth';
import { useUserStore } from './lib/Userstore.js';
import { Auth } from './lib/firebase.js';
import { usechatStore } from './lib/chatStore.js';

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const [authChecked, setAuthChecked] = useState(false); // State to track auth status
  const { chatId } = usechatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(Auth, async (user) => {
      if (user) {
        await fetchUserInfo(user.uid); // Fetch user info on auth state change
      } else {
        console.log("No user is authenticated");
      }
      setAuthChecked(true); // Set auth check as completed after the listener fires
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  // If the authentication status is still being checked or loading, show a loading indicator
  

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route
            path="/login"
            element={currentUser ? <Navigate to="/main" replace /> : <Login />}
          />
          <Route
            path="/main"
            element={
              currentUser ? (
                <>
                  <List />
                  {chatId && <Chat />}
                  {chatId && <Detail />}
                  <Notification />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* Default route, redirects to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
