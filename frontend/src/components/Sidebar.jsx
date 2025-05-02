import { useChatStore } from "../store/useChatStore";
import SidebarChats from "./SidebarChats";
import UserContacts from "./UserContacts";


const Sidebar = () => {

  const {ContactSelected} = useChatStore();

  if (ContactSelected) return <UserContacts />

  return (
      <SidebarChats />
  );
};
export default Sidebar;