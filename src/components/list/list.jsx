import React from 'react'
import './list.css'
import Userinfo from'./userinfo/userinfo.jsx'
import Chatlist from'./chatlist/chatlist.jsx'
const list = () => {
  return (
    <div className='list'>
      <Userinfo/>
      <Chatlist/>
    </div>
  )
}

export default list
