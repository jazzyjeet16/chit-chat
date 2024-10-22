import React, { useEffect, useState } from 'react';
import AddUser from './adduser/adduser.jsx';
import './chatlist.css';
import { useUserStore } from '../../../lib/Userstore.js';
import { db } from '../../../lib/firebase.js';
import { doc, onSnapshot, getDoc } from "firebase/firestore"; 
import { usechatStore } from '../../../lib/chatStore.js';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const { currentUser } = useUserStore();
  const { changeChat } = usechatStore();

  useEffect(() => {
    if (!currentUser) return; 

    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      const items = res.data()?.chats || []; 

      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);
        const user = userDocSnap.data();

        return { ...item, user };  // Add user info to the chat object
      });
      
      const chatData = await Promise.all(promises);
      // Filter out duplicate chats and those with undefined users
      const uniqueChats = chatData.filter((chat, index, self) =>
        chat.user && 
        self.findIndex(c => c.chatId === chat.chatId) === index
      );
      setChats(uniqueChats.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = (chat) => {
    if (chat.user) {
      changeChat(chat.chatId, chat.user);
    }
  }

  return (
    <div className='chatlist'>
      <div className='search'>
        <div className='searchbar'>
          <img src='./search.png' alt="" />
          <input type='text' placeholder='search' />
        </div>
        <img src={addMode ? "./minus.png" : './plus.png'} alt="" onClick={() => setAddMode((prev) => !prev)} />
      </div>
      {chats.map((chat) => (
        <div className='item' key={chat.chatId} onClick={() => handleSelect(chat)} style={{backgroundColor:chat?.isSeen ? 'transparent':"blue"}}>
          <img src={chat.user?.avatar || "./avatar.png"} alt="" /> {/* Safe access */}
          <div className="texts">
            <span>{chat.user.username}</span> {/* No default "Unknown" */}
            <p>{chat.lastMessage || "No messages yet."}</p> {/* Default message */}
          </div>
        </div>
      ))}
      {addMode && <AddUser />}
    </div>
  );
}

export default ChatList;
