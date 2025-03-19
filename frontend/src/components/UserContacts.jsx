import { Contact, Search, X } from 'lucide-react'
import React from 'react'
import { useChatStore } from '../store/useChatStore'

const UserContats = () => {

  const {setContactSelected} = useChatStore();


  return (

    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
      <div className="flex items-center gap-2">
        <Contact className="size-5" />
        <span className="font-medium hidden lg:block text-2xl">Contacts</span>
          <button className="ml-auto hidden lg:block"   onClick={() => setContactSelected(false)} >
            <X className="size-5 "  />
          </button>
      </div>

      <div className="mt-3 hidden lg:flex items-center gap-2">
        <label className="input">
          <Search className="size-4"/>
          <input type="search" required placeholder="Search"/>
        </label>
      </div>

      </div>
    </aside>
  )
}

export default UserContats
