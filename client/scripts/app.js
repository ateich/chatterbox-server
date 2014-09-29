// YOUR CODE HERE:
var parseUrl = 'http://127.0.0.1:3000/?order=-createdAt';
var postUrl = 'http://127.0.0.1:3000';
var app = {
  index: 0,
  server: parseUrl,
  rooms: {},
  currentRoom: 'lobby',
  currentUser: null,
  mostRecentPost:{},
  pushChatAnimation:null,
  friends:{},
  init: function() {
    var name = window.location.search.split('username=')[1];
    var text = $('.name').text();
    this.currentUser = name;
    $('.name').text(text +" " +name);

    //Start in lobby by default
    this.addRoom('lobby');
    $('#lobby').addClass('active');
  },
  send: function(message) {
    $.ajax({
      type: 'POST',
      url: postUrl,
      data: JSON.stringify(message),
      contentType: 'application/json'
    });
    app.fetch();
  },
  fetch: function() {
    $.ajax({
      type: 'GET',
      url: parseUrl,
      success: function(data){
        data = JSON.parse(data);
        // console.log(data);
        // data = data.results;
        var totalItems = 0;
        for(var key in app.rooms){
          key = key+'';
          totalItems += app.rooms[key].length;
        }

        console.log('fetch: ', data.length);

        app.displayMessages(data);
      },
      error: function(data){
        console.log("ERROR: ", data);
      }
    });
  },
  displayMessages: function(data) {
    if (data === undefined) {
      return;
    }
    console.log(data);
    console.log(data.length);
    //data = data.reverse();

    for (var i = 0; i < data.length; i++) {
      // console.log('display message check: ' , this.mostRecentPost[this.currentRoom])
      if(!this.mostRecentPost[this.currentRoom] || this.mostRecentPost[this.currentRoom] < data[i].createdAt){
        console.log('about to add message');
        app.addMessage(data[i]);
      }
    }
  },
  clearMessages: function() {
    $('#chats').html('');
  },
  addMessage: function(message) {
    //Check for blank message
    if(message.roomname === 'FOREVER ROOM!'){
      console.log(document.event);
      console.log(message);
    }
    if(!message.text || message.text.length < 1){
      return;
    }

    if(!message.username){
      message.username = 'anonymous';
    }

    //Check for blank room
    if(message.roomname === undefined || message.roomname.length <= 1) {
      message.roomname = 'lobby';
    }

    //Check if this is a new message
    if (!this.mostRecentPost[this.currentRoom] || this.mostRecentPost[this.currentRoom] < message.createdAt) {
      this.mostRecentPost[this.currentRoom] = message.createdAt;
      for (var key in message) {
        // SUPER AWESOME REGEX
        // key = "'"+key+"'";
        if(message[key]){
          message[key] = message[key].replace(/(<([^>]+)>)/ig,"");
          message[key] = message[key].replace(/(addEventListener)/ig,"");
        }

        var roomNameArray = app.rooms[message.roomname];
        if(roomNameArray === undefined){
          roomNameArray = new Array();
        }
        roomNameArray.push(message);
      }
    }

    //Add room if it has not been used before
    if (app.rooms[message.roomname] === undefined && message.roomname.length) {
      app.addRoom(message.roomname);
    }

    //If we are currently in this room, add the message to the screen
    if (message.roomname === app.currentRoom) {
      var msgHeight = 100;
      if (message.text.length > 1000) {
        message.text = message.text.substr(0, 1000);
      }
      var multiplier = Math.ceil(message.text.length/335);
      msgHeight *= multiplier;
      msgHeight += 10*(multiplier-1);
      var $user = $('<div class="username">').text(message.username);
      var timestamp = moment(message.createdAt).fromNow();
      var $time = $('<div class="timestamp">').text(timestamp);
      var $msg = $('<div data-name="' + message.username + '">').addClass('message well')
                  .text(message.text)
                  .append($user)
                  .append($time)
                  .css('height', msgHeight + 'px');

      $user.on('click', function(){
        console.log('clicked friend');
        app.friends[message.username] = true;
        $('div').find("[data-name='" + message.username + "']").addClass('friend');
      });
      if(this.friends[message.username]){
        $msg.addClass('friend');
      }
      $('#chats').append($msg);
      $('.username').on('click', function() {
        app.addFriend();
      });
      $('#chats').css('overflow-y', 'hidden');
      $('.message').last().addClass('animated fadeInUpBig');
      clearInterval(this.pushChatAnimation);
      this.pushChatAnimation = setTimeout(function() {
        $('#chats').css('overflow-y', 'auto');
        $("#chats").animate({ scrollTop: $("#chats")[0].scrollHeight}, 1000);
      }, 800);
    }
  },

  addRoom: function(roomName) {
    // console.log(roomName);
    // roomName = roomName.replace('#', '');

    roomName = roomName.replace(/[!#]/g, "");
    roomName = roomName + '';
    app.rooms[roomName] = new Array();

    var $room = $('<a href="#" id="' + roomName +'">').addClass('room list-group-item').text(roomName);
    $('#roomSelect').append($room);
    //CHANGE ROOM
    $('.room').on('click', function(e) {
      app.mostRecentPost[app.currentRoom] = null;
      e.stopPropagation();
      e.preventDefault();
      app.clearMessages();
      // app.mostRecentMessageAdded = 0;
      var roomName = $(e.currentTarget).text();
      $('#roomSelect > .room').removeClass('active');
      $(this).addClass('active');
      app.currentRoom = roomName;

      app.fetch();
      //app.displayMessages(app.rooms[roomName]);
    });
  },
  addFriend: function() {

  }
};

