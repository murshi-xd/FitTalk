export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, 
    });
  }

  export function formatMessageDate(date) {
    const messageDate = new Date(date);
    const today = new Date();
  
    const isToday = messageDate.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
  
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();
  
    const options = { month: "short", day: "numeric", year: "numeric" };
  
    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
  
    // If within the last 7 days, show the day name (e.g., "Monday")
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
  
    if (messageDate > sevenDaysAgo) {
      return messageDate.toLocaleDateString("en-US", { weekday: "long" });
    }
  
    // Otherwise, return the full date
    return messageDate.toLocaleDateString("en-US", options);
  }
  

  export function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  