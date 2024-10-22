import React, { useState } from 'react';
import { collection, doc, setDoc, getDocs, updateDoc, query, serverTimestamp, where, arrayUnion } from "firebase/firestore";
import './adduser.css';
import { db } from '../../../../lib/firebase';
import { useUserStore } from '../../../../lib/Userstore';

const AddUser = () => {
  const [username, setUsername] = useState(''); // Use controlled input
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
        setError(null);
      } else {
        setError("User not found.");
        setUser(null);
      }
    } catch (err) {
      setError("An error occurred while searching.");
      console.error(err);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      // Create a new chat document
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: []
      });

      // Initialize current user chat
      const currentUserDoc = doc(userChatsRef, currentUser.id);
      const userDoc = doc(userChatsRef, user.id);

      await updateDoc(currentUserDoc, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now()
        })
      });

      await updateDoc(userDoc, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now()
        })
      });

      console.log("New chat added with ID:", newChatRef.id);
      
      // Reset input after adding
      setUsername('');
      setUser(null);
    } catch (err) {
      console.error("Error adding chat:", err);
    }
  };

  return (
    <div className='adduser'>
      <form onSubmit={handleSearch}>
        <input
          type='text'
          placeholder='Username'
          name='username'
          value={username} // Controlled input
          onChange={(e) => setUsername(e.target.value)} // Update state on change
          required
        />
        <button type="submit">Search</button>
      </form>
      {error && <div className="error">{error}</div>}
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || './avatar.png'} alt='' />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add user</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
