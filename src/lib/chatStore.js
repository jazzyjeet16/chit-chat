import { create } from 'zustand';

import { useUserStore } from './Userstore';

export const usechatStore = create((set) => ({
  chatId:null,
  user: null,
  isCureentUserBlocked:false,
  isReceiverBlocked:false,
  changeChat:(chatId,user)=>{
    const currentUser= useUserStore.getState().currentUser
  

    //Chek if current user is blocked
    if(user.blocked.includes(currentUser.Id)){
        return set({
            chatId,
            user: null,
            isCureentUserBlocked:true,
            isReceiverBlocked:false,

        })
    }
    else if(currentUser.blocked.includes(user.Id)){
        return set({
            chatId,
            user: user,
            isCureentUserBlocked:false,
            isReceiverBlocked:true,

        })
    }else{
    return set({
        chatId,
        user,
        isCureentUserBlocked:false,
        isReceiverBlocked:false,
    });
}
    changeBlock: ()=>{
        set(state=>({...state,isReceiverBlocked:!state.isReceiverBlocked}))

    }
}

}));
