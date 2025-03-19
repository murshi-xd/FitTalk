import { Search } from 'lucide-react'
import React from 'react'

const ChatSearch = () => {
  return (
    <label className="input">

        <Search className="size-4"/>
        <input type="search" required placeholder="Search"/>

    </label>
  )
}

export default ChatSearch
