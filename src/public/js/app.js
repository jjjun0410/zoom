const messageList = document.querySelector("ul");
const nickNameForm = document.querySelector("form#nickName");
const messageForm = document.querySelector("form#message");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload){
    const msg = { type, payload };
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("♥ Connected to Server ♥");
});

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
    console.log("New message: ", message.data);
});

socket.addEventListener("close", () => {
    console.log("☆ Disconnected from Sever ☆");
});

// setTimeout(() => {
//     socket.send("hello from the browser!");
// }, 10000);

function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    const li = document.createElement("li");
    li.innerText = `You: ${input.value}`;
    messageList.append(li);
    //socket.send(input.value);
    // console.log(input.value);
    input.value = '';
}

function handleNickNameSubmit(event){
    event.preventDefault();
    const input = nickNameForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = '';
    //socket.send(input.value);
    // socket.send({
    //     type:"nickname",
    //     payload:input.value,
    // });
}

messageForm.addEventListener("submit", handleSubmit);
nickNameForm.addEventListener("submit", handleNickNameSubmit);