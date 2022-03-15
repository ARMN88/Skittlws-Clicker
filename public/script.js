/* ************************* TODO LIST *************************

    PRIORITY
    X Implement item price, increment, and value as its own variable

    SUGGESTIONS
    X Fix prices and increments
    - Add how much each item produces next to the item name in buy section
    X Normal Bateekh shows up and when you click on it you get a random normal upgrade (+15% to total, etc)
    X Golden Bateekh that is more rare and gives you random OP upgrade (double score for 30 seconds, 5x current amount)
    X something (idk what) that has .001 percent chance spawning and gives you +350% of total and gives you 10 billion skittlws and buying an upgrade gives you x2
    X add Naful the Waffle as a last item
    X Grand Finale at >50 Mufti Qittas and >8 Naful the Waffles
    - Store player data in Firebase
    X Fix Text to show correct message
    X Chat
    - Sell option
*/
// ************************* VARIABLES *************************
// console
eruda.init();

let random = {
  bateekh: Math.floor(Math.random() * 10000),
  golden: Math.floor(Math.random() * 100000),
  ultimate: Math.floor(Math.random() * 1000000),
  interval: {
    bateekh: undefined,
    golden: undefined,
    ultimate: undefined
  }
}

// import worker
var worker = new Worker('worker.js');

//document.querySelector("#loading-section").style.display = "none";

// make player
let player;

// make items
let items = {
  cursor: {
    price: 100,
    increment: 5,
    value: .01,
    multiplier: 1
  },
  kidnapper: {
    price: 500,
    increment: 25,
    value: .1,
    multiplier: 1
  },
  farm: {
    price: 2000,
    increment: 100,
    value: .5,
    multiplier: 1
  },
  factory: {
    price: 10000,
    increment: 500,
    value: 1,
    multiplier: 1
  },
  masjid: {
    price: 100000,
    increment: 5000,
    value: 5,
    multiplier: 1
  },
  sihrunMubeen: {
    price: 1000000,
    increment: 50000,
    value: 10,
    multiplier: 1
  },
  muftiQitta: {
    price: 10000000,
    increment: 500000,
    value: 50,
    multiplier: 1
  },
  nafulTheWaffle: {
    price: 100000000,
    increment: 5000000,
    value: 100,
    multiplier: 1
  }
}

// make leaderboard
let leaderboard = [];

// make rates
let rate = {
  withPlayer: 0,
  withoutPlayer: 0,
  average: 1
};

// connect to socket server
let socket = io();

// initilize text prompts
let textPrompts = [{
  text: "The Beginning",
  when: 0,
  isUsed: false
},
{
  text: "Remove the haters...",
  when: items.kidnapper.price,
  isUsed: false
},
{
  text: "Plant the seeds of growth!",
  when: items.farm.price,
  isUsed: false
},
{
  text: "Mass production is key to success.",
  when: items.factory.price,
  isUsed: false
},
{
  text: "Profit! Prophet!! Profit!!!",
  when: items.masjid.price,
  isUsed: false
},
{
  text: "What is this magic???",
  when: items.sihrunMubeen.price,
  isUsed: false
},
{
  text: "The final stage is almost here...",
  when: items.muftiQitta.price,
  isUsed: false
},
{
  text: "Labor till death... or death till labor?",
  when: 100000000000,
  isUsed: false
}];
textPrompts.reverse();
// ************************* FUNCTIONS *************************
// Init Function
function Init() {
  // get save data
  if(localStorage.player) {
    player = JSON.parse(localStorage.player);
    if(player.max) {
      player.max = 0;
    }
    if(!player.done) {
      player.done = false;
    }
    if(!player.items.nafulTheWaffle) {
    player.items.nafulTheWaffle =  {
          amount: 0,
          price: 100000000,
          increment: 5000000,
          value: 100,
          multiplier: 1
        }
    }
    applyPreviousSave();
  }else {
    player = {
      id: getUUID(),
      max: 0,
      counter: 0,
      showing: [],
      levels: {
        cursor: 0,
        kidnapper: 0,
        farm: 0,
        factory: 0,
        masjid: 0,
        sihrunMubeen: 0,
        muftiQitta: 0,
      },
      items: {
        cursor: {
          amount: 0,
          //price: 100,
          //increment: 5,
          //value: .02,
          multiplier: 1
        },
        kidnapper: {
          amount: 0,
          //price: 500,
          //increment: 25,
          //value: .15,
          multiplier: 1
        },
        farm: {
          amount: 0,
          //price: 2000,
          //increment: 100,
          //value: .5,
          multiplier: 1
        },
        factory: {
          amount: 0,
          //price: 10000,
          //increment: 500,
          //value: 1.2,
          multiplier: 1
        },
        masjid: {
          amount: 0,
          //price: 100000,
          //increment: 5000,
          //value: 3.5,
          multiplier: 1
        },
        sihrunMubeen: {
          amount: 0,
          //price: 1000000,
          //increment: 50000,
          //value: 10,
          multiplier: 1
        },
        muftiQitta: {
          amount: 0,
          //price: 10000000,
          //increment: 500000,
          //value: 10,
          multiplier: 1
        },
        nafulTheWaffle: {
          amount: 0,
          //price: 100000000,
          //increment: 5000000,
          //value: 100,
          multiplier: 1
        }
      }
    }
    player.name = prompt("Enter Your Name:");
    if(player.name === null || player.name === "" || player.name === undefined) {
      player.name = "Player"+String(Math.floor(Math.random()*10))+String(Math.floor(Math.random()*10))+String(Math.floor(Math.random()*10))+String(Math.floor(Math.random()*10));
    }
    localStorage.player = JSON.stringify(player);
  }

  document.querySelector("#cookie-section #main-text").innerHTML = player.name + "\'s Journey Begins...";
  
  if(player.id !== "R3f62ce09-1c36-4c3b-9e85-6458074d4cf8") {
    document.querySelector("#loading-section").style.display = "none";
  }else {
    document.querySelector("#loading-section").innerHTML = "Banned";
  }
  document.querySelector(".upgrade.hidden").classList.remove("hidden");
  localStorage.player = JSON.stringify(player);
  ShowAvaliableOptions();
}

// Update Function
function Update() {
  ShowAvaliableOptions();
  if(player.counter > player.max) {
    player.max = player.counter;
  }
  for(let text of textPrompts) {
    if(text.when <= player.max) {
      if(!text.isUsed) {
        Text(text.text);
        text.isUsed = true;
      }
      break;
    }
  }
  for(let [type, number] of Object.entries(random)) {
    if(number === Math.floor(Math.random() * 10000)) {
      if(type === "bateekh") {
        console.log("bateekh");
        document.querySelector(`#${type}`).style.left = Math.floor(Math.random() * 60) + "vw";
        document.querySelector(`#${type}`).style.top = Math.floor(Math.random() * 60) + "vh";
        document.querySelector(`#${type}`).style.display = "block";
        random.interval[type] = setTimeout(function(){
          document.querySelector(`#bateekh`).style.display = "none";
        }, 300000);
      }
      if(type === "golden") {
        console.log("golden");
        document.querySelector(`#${type}`).style.left = Math.floor(Math.random() * 60) + "vw";
        document.querySelector(`#${type}`).style.top = Math.floor(Math.random() * 60) + "vh";
        document.querySelector(`#${type}`).style.display = "block";
        random.interval[type] = setTimeout(function(){
          document.querySelector(`#golden`).style.display = "none";
        }, 180000);
      }
      if(type === "ultimate") {
        console.log("ultimate");
        document.querySelector(`#${type}`).style.left = Math.floor(Math.random() * 60) + "vw";
        document.querySelector(`#${type}`).style.top = Math.floor(Math.random() * 60) + "vh";
        document.querySelector(`#${type}`).style.display = "block";
        random.interval[type] = setTimeout(function(){
          document.querySelector(`#ultimate`).style.display = "none";
        }, 30000);      
      }
    }
    if(type === "bateekh") {
      random[type] = Math.floor(Math.random() * 10000);
      }
    if(type === "golden") {
      random[type] = Math.floor(Math.random() * 100000);
    }
    if(type === "ultimate") {
      random[type] = Math.floor(Math.random() * 1000000);
    }
  }
  requestAnimationFrame(Update);
}

// Fixed Update Function
let tick = 0;
function FixedUpdate() {
  //update scores
  for(let [key, value] of Object.entries(player.items)) {
    AddSkittlws(value.amount*items[key].value*value.multiplier);
  }

  // send score to server and get average rate
  if(tick % 100 === 0) {
    player.counter = Math.round(player.counter);
    socket.emit("score", player);
    document.querySelector("#rate-counter").innerHTML = `${rate.withPlayer.toLocaleString()} Skittlw(s)/second`;
    rate.average = rate.withoutPlayer*0.20;
    rate.withPlayer = 0;
    rate.withoutPlayer = 0;
  }

  // update game tick
  tick++;
}

// add skittlws to score
function AddSkittlws(amount, isPlayer=false) {
  if(amount === 0) {
    return;
  }
  player.counter += amount;
  if(player.counter > Math.pow(10, 12)) {
    let userScoreRegex = /(e\+)(\d*)/;

    let gmatch = userScoreRegex.exec(player.counter.toExponential(3));
      
    document.querySelector("#cookie-counter").innerHTML = (player.counter.toExponential(3).replace(userScoreRegex, ` * 10<sup>${gmatch[2]}</sup>`) + " Skittlws");
  }else {
    document.querySelector("#cookie-counter").innerHTML = Math.floor(player.counter).toLocaleString() + " Skittlws";
  }
  
  if(amount > 0) {
    if(!isPlayer) {
      rate.withoutPlayer+=amount;
    }
    rate.withPlayer+=amount;
  }
  localStorage.player = JSON.stringify(player);
}

// write text to text display
function Text(msg) {
  document.querySelector("#cookie-section #main-text").innerHTML = "";
  let message = msg.split("");
  let textIndex = 0;
  let textInterval = setInterval(function() {
    document.querySelector("#cookie-section #main-text").innerHTML += message[textIndex];
    textIndex++;
    if(textIndex >= message.length) {
      document.querySelector("#cookie-section #main-text").innerHTML = message.join("");
      clearInterval(textInterval);
    }
  },50);
}

// show avaliable options
function ShowAvaliableOptions() {
  for(let x = 0;x<player.showing.length;x++) {
    if(document.querySelector(".upgrade.hidden#"+player.showing[x])) {
      document.querySelector(".upgrade.hidden#"+player.showing[x]).classList.remove("hidden");
      document.querySelector(".level.hidden#l"+player.showing[x]).classList.remove("hidden");
      if(player.showing[x] === "nafulTheWaffle") {
        document.querySelector("#hidd").classList.add("hidden");
      }
    }
  }
  
  for(let [key, value] of Object.entries(player.items)) {
    document.querySelector(`#${key}`).style.filter = "grayscale(100%)";
    if(player.counter >= items[key].price+(items[key].increment*value.amount)) {
      document.querySelector(`#${key}`).style.filter = "grayscale(0%)";
    }
    if(document.querySelector(".upgrade.hidden#"+key) && player.counter >= items[key].price/4*3) {
      player.showing.unshift(key);
      document.querySelector(".upgrade.hidden#"+key).classList.remove("hidden");
      document.querySelector(".level.hidden#l"+key).classList.remove("hidden");
      if(key === "nafulTheWaffle") {
        document.querySelector("#hidd").classList.add("hidden");
      }
      }
  }
}

function applyPreviousSave() {
  document.querySelector("#cookie-counter").innerHTML = player.counter.toLocaleString() + " Skittlws";
  for(let key of Object.keys(player.items)) {
    document.querySelector(`div#${key}.upgrade h2`).innerHTML = player.items[key].amount.toLocaleString();
    document.querySelector(`div#${key}.upgrade div p`).innerHTML = (items[key].price+(items[key].increment*player.items[key].amount)).toLocaleString() + " Skittlws";
    for(let i = 0;i<player.levels[key];i++) {
      if(document.querySelector(`div#l${key} img.nop`)) {
        document.querySelector(`div#l${key} img.nop`).style.marginTop = `${Math.floor(Math.random() * 13)}vh`;
        document.querySelector(`div#l${key} img.nop`).style.animationDelay = `${Math.floor(Math.random() * 1000)}ms`
        document.querySelector(`div#l${key} img.nop`).classList.remove("nop");
      }
    }
  }
}

// generate UUID
function getUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
// ************************* DOCUMENT EVENT HANDLERS *************************
// send messages
document.querySelector("#chat-section input").onkeydown = function(e) {
  if(e.keyCode === 13 && this.value) {
    socket.emit("message", {name: player.name, message: this.value});
    this.value = "";
  }
}

// send messages
document.querySelector("#chat-section button").onclick = function() {
  if(document.querySelector("#chat-section input").value) {
    socket.emit("message", {name: player.name, message: document.querySelector("#chat-section input").value});
    document.querySelector("#chat-section input").value = "";
  }
}


// get messages
socket.on("message", data => {{
    document.querySelector("#messages p").innerHTML += `<br/><br/>${data.name}: ${data.message}`;
  }
});

// if the cookie is clicked update the score
document.querySelector("#main-cookie").onmousedown = function(e) {
  if(rate.withoutPlayer > 0) {
    AddSkittlws(Math.ceil(rate.average), true);
    }else {
    AddSkittlws(1, true);
  }
  this.style.transform = "scale(.95)";

  let instanceParticle = document.getElementById('particle');
  let newParticle = instanceParticle.cloneNode(true);
  newParticle.style.filter = `hue-rotate(${Math.floor(Math.random() * 361)}deg)`;
  newParticle.style.top = e.clientY + "px";
  newParticle.style.left = e.clientX + "px";
  document.body.append(newParticle);
  newParticle.onload = function() {
    this.style.opacity = 0;
    this.style.transform = `translate(${Math.floor(Math.random() * 201)-100}px, 50vh)`;
    setTimeout(function(){
      newParticle.remove();
    }, 2000);
  }
  localStorage.player = JSON.stringify(player);
}

// mouse up resize cookie to normal size
document.querySelector("#main-cookie").onmouseup = function() {
  this.style.transform = "scale(1)";
}

// buying upgrades
window.onclick = function(e) {
  if(player.counter >= 100000000000 && !player.done) {
    player.done = true;
    localStorage.player = JSON.stringify(player);
    window.location = "https://Skittlws-Finale.armn8811.repl.co";
  }
  for(let [key, value] of Object.entries(player.items)) {
    if(e.target.id === key && player.counter >= items[key].price+(items[key].increment*value.amount)) {
      AddSkittlws(-(items[key].price+(items[key].increment*value.amount)));
      //player.items[key].price += items[key].increment; // we will just see how many the player has to find out the increment
      player.items[key].amount++;
      document.querySelector(`div#${key}.upgrade div p`).innerHTML = (items[key].price+(items[key].increment*value.amount)).toLocaleString() + " Skittlws";
      document.querySelector(`div#${key}.upgrade h2`).innerHTML = player.items[key].amount.toLocaleString();
      if(document.querySelector(`div#l${key} img.nop`)) {
        document.querySelector(`div#l${key} img.nop`).style.marginTop = `${Math.floor(Math.random() * 13)}vh`;
        document.querySelector(`div#l${key} img.nop`).style.animationDelay = `${Math.floor(Math.random() * 1000)}ms`
        document.querySelector(`div#l${key} img.nop`).classList.remove("nop");
        player.levels[key]++;
      }
      localStorage.player = JSON.stringify(player);
    }
  }
  if(e.target.id === "bateekh") {
    AddSkittlws(rate.average*20);
    document.querySelector("#"+e.target.id).style.display = "none";
    clearTimeout(random.interval[e.target.id]);
  }
  if(e.target.id === "golden") {
    AddSkittlws(player.counter*1.5);
    document.querySelector("#"+e.target.id).style.display = "none";
    clearTimeout(random.interval[e.target.id]);
  }
  if(e.target.id === "ultimate") {
    AddSkittlws(player.counter*3);
    AddSkittlws(player.max*3);
    document.querySelector("#"+e.target.id).style.display = "none";
    clearTimeout(random.interval[e.target.id]);
  }
}

// prevent user from right clicking and dragging
document.addEventListener('contextmenu', event => event.preventDefault());
document.ondragstart = function() { return false; };

// update leaderboard
socket.on("leaderboard", data => {
  leaderboard = Object.values(data);
  let place = 1;
  leaderboard.sort((a, b) => (a.score < b.score) ? 1 : (a.score === b.score) ? ((a.name > b.name) ? 1 : -1) : -1 )
  removeAllChildNodes(document.querySelector("table"));

  let tableTitle = document.createElement("tr");
  let titleLeaderboard = document.createElement("th");
    titleLeaderboard.setAttribute("colspan", 3);
    titleLeaderboard.innerHTML = "LEADERBOARD";
    tableTitle.appendChild(titleLeaderboard);
    
    let tableTitles = document.createElement("tr");
    let titlePlace = document.createElement("th");
    titlePlace.innerHTML = "Place";
    let titleName = document.createElement("th");
    titleName.innerHTML = "Name";
    let titleScore = document.createElement("th");
    titleScore.innerHTML = "Score";
    tableTitles.appendChild(titlePlace);
    tableTitles.appendChild(titleName);
    tableTitles.appendChild(titleScore);

    document.querySelector("table").appendChild(tableTitle);
    document.querySelector("table").appendChild(tableTitles);

  for(let user of leaderboard) {
    let tableRow = document.createElement("tr");

    let tablePlace  = document.createElement("td");
    let tablePlaceText = document.createTextNode(place.toLocaleString());
    tablePlace.appendChild(tablePlaceText);

    tableRow.appendChild(tablePlace);

    let tableName  = document.createElement("td");
    let tableNameText; 
    if(place === 1) {
      tableNameText = document.createTextNode("👑 "+user.name);
    }else {
      tableNameText = document.createTextNode(user.name);
    }
    tableName.appendChild(tableNameText);

    if(user.finale) {
      tableName.style.color = "dodgerblue";
      tableName.style.fontWeight = "bold";
    }

    tableRow.appendChild(tableName);

    let tableScore  = document.createElement("td");

    let tableScoreText;

    if(user.score >= Math.pow(10, 15)) {

      let userScoreRegex = /(e\+)(\d*)/;

      let gmatch = userScoreRegex.exec(user.score.toExponential(3));
      
      tableScore.innerHTML = (user.score.toExponential(3).replace(userScoreRegex, ` * 10<sup>${gmatch[2]}</sup>`) + " Skittlws");
    }else {
     tableScore.innerHTML = (Math.round(user.score).toLocaleString() + " Skittlws");
    }
    if(user.id === player.id) {
      tableRow.style.background = "green";
    }
    
    tableRow.appendChild(tableScore);

    document.querySelector("table").appendChild(tableRow);
    place++;
  }
});

// open leaderboard
document.querySelector("#info-icon").onclick = () => {
  document.querySelector("#info-section").classList.toggle("close");
  document.querySelector("#info-section").classList.toggle("open");
  socket.emit("score", player);
};

// open chat on enter
window.onkeydown = function(e) {
  if(e.keyCode === 13) {
    document.querySelector("#chat-section input").focus();
  }
}

// show chat
document.querySelector("#chat-section input").onfocus = function() {
  document.querySelector("#chat-section").style.height = "min(40vh, 40vw)";
  document.querySelector("#chat-section").style.background = "rgba(24, 24, 24, 0.6)";
}

// minimize chat
document.querySelector("#chat-section input").onblur = function() {
  document.querySelector("#chat-section").style.height = "min(10vh, 10vw)";
  document.querySelector("#chat-section").style.background = "rgba(24, 24, 24, 0.3)";
}

// ************************* START GAME *************************
window.onload = function() {
  Init();
  Update();
  worker.onmessage = function() {
    FixedUpdate();
  }
}