const socket = io();

Vue.component("chat-message", {
  props: ["message", "user"],
  template: `
      <div class="message" :class="{'owner': message.id === user.id}">
          <div class="message-content z-depth-1">
          {{message.name}}: {{message.text}}
          </div>
      </div>
    `
});

new Vue({
  el: "#app",
  data: {
    message: "",
    messages: [],
    users: [],
    user: {
      name: "",
      room: ""
    }
  },
  methods: {
    sendMessage() {
      const message = {
        text: this.message,
        name: this.user.name,
        id: this.user.id
      };

      socket.emit("message:create", message, err => {
        if (err) {
          console.error(err);
        } else {
          this.message = "";
        }
      });
    },
    initConnection() {
      socket.on("users:update", users => {
        this.users = [...users];
      });

      socket.on("message:new", message => {
        scrollToBottom(this.$refs.messages);
        this.messages.push(message);
      });
      scrollToBottom(this.$refs.messages);
    }
  },
  created() {
    const params = window.location.search.split("&");
    const name = params[0].split("=")[1].replace("+", " ");
    const room = params[1].split("=")[1].replace("+", " ");
    this.user = { name, room };
  },

  mounted() {
    socket.emit("join", this.user, data => {
      if (typeof data === "string") console.error(data);
      else {
        this.user.id = data.userId;
      }
    });
    this.initConnection();
  }
});

function scrollToBottom(node) {
  setTimeout(() => {
    node.scrollTop = node.scrollHeight;
  });
}
