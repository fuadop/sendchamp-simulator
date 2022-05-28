function parseQs() {
  const qs = {};
  window.location.search.substring(1).split("&").forEach((item) => {
    const [key, value] = item.split("=").map(decodeURIComponent);
    qs[key] = value;
  });
  return qs;
}

window.location.qs = parseQs();
const list = document.querySelector(".message-list")

// connect to websocket
let socket = new WebSocket(window.location.origin.replace("http", "ws") + "/ws");

socket.onopen = () => {
  console.log("Device connected to socket");
  socket.send(JSON.stringify({
    phone: window.location.qs.phone
  }));
  // set status to connected
  document.querySelector(".status-indicator").style.background = "green";
};

socket.onmessage = ({ data }) => {
  try {
    data = JSON.parse(data);
  } catch {}

  if (data.message) {
    let template = `
      <div class="message flex row justify-content-start align-items-center mt-5">
        <div class="avatar circle flex row justify-content-center align-items-center mr-3">
          ${data.sender_name?.substring(0, 2)}
        </div>
        <div class="flex column align-items-start">
          <p class="sender font-weight-bold">
            ${data.sender_name}
          </p>
          <p class="content with-divider">
            ${data.message}
          </p>
        </div>
      </div>
    `;
    list.innerHTML = template + list.innerHTML;
  }
};

socket.onclose = () => {
  console.log("Device disconnected from socket");
  // set status to idle
  document.querySelector(".status-indicator").style.background = "grey";
};