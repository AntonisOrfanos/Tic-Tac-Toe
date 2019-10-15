var socket = io();

var app = new Vue({
    el: '#vue-app',
    data: {
        players: {},
        board: {},
        clickedCell: {},
        title: 'Speak your mind ! ! !',
        msgs: [],
        msgObj: {
            sender: "",
            text: "",
            time: "",
            href: "",
            color: ""
        },
        message: "",
        chatOpen: true
    },
    computed: {
        playerCount: function () {
            return Object.keys(this.players).length;
        }
    },
    methods: {
        clickedOnCell: function (column, row) {

            //console.log(column, row);
            if (this.board[column][row] == "") socket.emit('clicked', {
                column: column,
                row: row
            });

        },
        resetBoard: function () {
            socket.emit('resetBoard');
        },
        sendMessage: function () {
            if (this.message == "") return;
            socket.emit('chat message', this.message);
            this.resetMessage();
            this.focusInput();
            //this.scrollToBottom();
        },
        addMessage: function (msg) {
            this.msgs.push(msg);
        },
        resetMessage: function () {
            this.message = "";
        },
        focusInput: function () {
            this.$refs.msgInput.focus();
        },
        scrollToBottom: function () {
            document.getElementById("messages").scrollTo(0, (3000000000));
        },
        requestUsername: function () {
            var person = prompt("Please enter your name", "");

            if (person == null || person == "") {
                this.requestUsername();
            } else {
                socket.emit('login name', person);
            }
        },
        toggleChat: function () {
            if (this.chatOpen) {
                this.chatOpen = false;
                app.$refs.chat.style.height = "33px";
                app.$refs.chat.style.top = "calc(100% - 53px)";
                app.$refs.toggle.innerHTML = "+";
            } else {
                this.chatOpen = true;
                app.$refs.chat.style.height = "500px";
                app.$refs.chat.style.top = "calc(100% - 520px)";
                app.$refs.toggle.innerHTML = "-";
            }
        }
    },
    mounted: function () {
        socket.on("newPlayer", function (players) {
            app.players = players;
        });
        socket.on("cannotPlay", function (msg) {
            alert(msg)
        });
        socket.on("getBoardStatus", function (board) {
            app.board = board;
        });
        this.requestUsername();

        this.focusInput();

        socket.on('chat message', function (msg) {
            app.addMessage(msg);
            app.scrollToBottom();
            if (!document.hasFocus()) beep();
        });
    }
})