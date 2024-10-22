import React, { useEffect, useState, useRef } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usechatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/Userstore';
import upload from '../../lib/upload';

const Chat = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); 
  const [img, setImg] = useState({ file: null, url: '' });
  const { chatId, user,isCureentUserBlocked,isReceiverBlocked, } = usechatStore();
  const { currentUser } = useUserStore();
  const fileInputRef = useRef(null); 

  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const sendMessage = async () => {
    if (message.trim() === '' && !img.file) return; 
    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      const newMessage = {
        senderId: currentUser.id,
        text: message,
        createdAt: new Date().toISOString(),
        img: imgUrl || null,
      };

      await updateDoc(doc(db, 'chats', chatId), {
        messages: [...messages, newMessage],
      });

      const userIds = [currentUser.id, user.id];
      userIds.forEach(async (id) => {
        const userchatRef = doc(db, 'userchats', id);
        const userChatSnapshot = await getDoc(userchatRef);

        if (userChatSnapshot.exists()) {
          const userChatsdata = userChatSnapshot.data();
          const chatIndex = userChatsdata.chats.findIndex((c) => c.chatId === chatId);
          userChatsdata.chats[chatIndex].lastMessage = message;
          userChatsdata.chats[chatIndex].isSeen = id === currentUser.id;
          userChatsdata.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userchatRef, { chats: userChatsdata.chats });
        }
      });

      setMessage('');
      setImg({ file: null, url: '' });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  useEffect(() => {
    const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
      const data = res.data();
      if (data && data.messages) {
        setMessages(data.messages);
      }
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user.avatar || './avatar.png'} alt='User Avatar' />
          <div className="texts">
            <span>{user.username || 'Jane Doe'}</span>
            <p>Active now</p>
          </div>
        </div>
        <div className="icon">
          <img src="./phone.png" alt="Phone Call" />
          <img src="./video.png" alt="Video Call" />
          <img src="./info.png" alt="Info" />
        </div>
      </div>

      <div className="centre">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.senderId === currentUser.id ? 'sent' : 'received'}`}>
              <p>{msg.text || 'No message text available'}</p>
              {msg.img && <img src={msg.img} alt="sent" className="sent-file" />} 
              <span className="time">{new Date(msg.createdAt).toLocaleTimeString()}</span>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
        {img.url && (
          <div className='message own'>
            <img src={img.url} alt='Selected' />
          </div>
        )}
      </div>

      <div className="bottom">
        <div className="icons">
          <img src="./camera.png" alt="Send Camera" className="icon-camera" />
          <img src="./mic.png" alt="Send Audio" className="icon-mic" />
          <img
            src="./img.png"
            alt="Send Image"
            className="icon-img"
            onClick={() => fileInputRef.current.click()} 
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleImg}
          />
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          className='textbox'
          onChange={(e) => setMessage(e.target.value)}
          disabled={isCureentUserBlocked || isReceiverBlocked}
        />
        <div className='emoji'>
          <img
            src="./emoji.png"
            alt="Emoji"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />
          {showEmojiPicker && (
            <div className="emojiPicker">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
        <button className="sendButton" onClick={sendMessage} disabled={isCureentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
