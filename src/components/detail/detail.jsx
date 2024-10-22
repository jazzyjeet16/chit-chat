import React from 'react';
import './detail.css';
import { Auth,db } from '../../lib/firebase';
import { useUserStore } from '../../lib/Userstore.js'; // Import useUserStore
import { usechatStore } from '../../lib/chatStore.js';
const Detail = () => {
  const { fetchUserInfo,currentUser } = useUserStore(); // Destructure fetchUserInfo from the user store
  const { chatId, user,isCureentUserBlocked,isReceiverBlocked,changeBlock } = usechatStore();

  const handleLogout = async () => {
    try {
      await Auth.signOut(); // Call Firebase signOut
      console.log("User logged out successfully");
      // Optionally, you can reset any local user state if needed
      await fetchUserInfo(null); // Clear user info after logout
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };
  const handleBlock=async()=>{
    if(!user) return;
    const userDocRef=doc(db,"users",currentUser.id)

    try{
      await updateDoc(userDocRef,{
        blocked:isReceiverBlocked ?arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();

    }catch(err){
      console.log(err);
    }

  }

  return (
    <div className='detail'>
      <div className="user">
        <img src={user.avatar || './avatar.png'} alt='User Avatar' />
        <h2>{user.username ||'Jane Doe'}</h2>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="Arrow Up" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" alt="Arrow Up" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="Arrow Down" />
          </div>
          <div className="photos">
            <div className="photoitem">
              <div className="photoDetail">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9SRRmhH4X5N2e4QalcoxVbzYsD44C-sQv-w&s"
                  alt="Shared Photo"
                />
                <span>photo_2024.png</span>
              </div>
              <img src='./download.png' alt='Download Icon' className='icon' />
            </div>

            <div className="photoitem">
              <div className="photoDetail">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9SRRmhH4X5N2e4QalcoxVbzYsD44C-sQv-w&s"
                  alt="Shared Photo"
                />
                <span>photo_2024.png</span>
              </div>
              <img src='./download.png' alt='Download Icon' className='icon' />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="Arrow Up" />
          </div>
        </div>
        <button className='block-button'onClick={handleBlock}>{isCureentUserBlocked ?"you are blocked" : isReceiverBlocked ?"user blocked":"Block User"}</button>
        <button className='logout' onClick={handleLogout}>Logout</button> {/* Call handleLogout on click */}
      </div>
    </div>
  );
};

export default Detail;
