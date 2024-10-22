// src/components/list/userinfo/userinfo.jsx

import React from 'react';
import './userinfo.css';
import { useUserStore } from '../../../lib/Userstore';

const UserInfo = () => {
  const { currentUser, isLoading } = useUserStore(); // Destructure state from Zustand store

  // Show loading state if user info is still being fetched
  if (isLoading) {
    return <div className='Loading'>Loading user information...</div>;
  }

  return (
    <div className='userinfo'>
      <div className='user'>
        <img 
          src={currentUser.avatar ? (currentUser.avatar) : ("./avatar.png")}  // Optional chaining to prevent errors
          alt="User Avatar" 
        />
        <h2>{currentUser?.username || "Guest"}</h2> 
      </div>
      <div className='icon'>
        <img src="./more.png" alt="More options" />
        <img src='./video.png' alt="Video" />
        <img src='./edit.png' alt="Edit" />
      </div>
    </div>
  );
};

export default UserInfo;
