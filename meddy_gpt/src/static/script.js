function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    const chatBox = document.getElementById("chat-box");

    // Append user message
    const userMessage = document.createElement("p");
    userMessage.className = "user-message";
    userMessage.textContent = "You: " + userInput;
    chatBox.appendChild(userMessage);

    // Send request to Flask chatbot
    fetch("http://127.0.0.1:8080/get", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ msg: userInput }),
    })
    .then(response => {
        console.log("Response received:", response);
        return response.text();
    })
    .then(data => {
        console.log("Parsed bot response:", data);  // Log it!

        const botMessage = document.createElement("p");
        botMessage.className = "bot-message";
        botMessage.textContent = "Bot: " + data;
        chatBox.appendChild(botMessage);

        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => console.error("Error:", error));

    // Clear input field
    document.getElementById("user-input").value = "";
}
