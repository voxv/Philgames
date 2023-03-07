var CACHE_PREFIX = GAME_NAME;
var login_name = '';
var say
var endgamesent=false;
var gamestarted = false;
var Game = null;
var thisapp = null;
var debug = false;
var reconnected = false;
var audio_sea = null;
var lobby_audio = null;

var startendgame;
var gotoendgame;
var login_name = '';
var players_ships = {}
var REFRESHPLAYERDELAY = 5000;
var submitted = false;
var otherplayerid = '';
var otherplayername = '';
var found_ships = {"c1":[],"c2":[],"c3":[],"c4":[],"c5":[]}
var myturn = true;
var lastsquarepicked = -1;
var ships_sunken = 0;
var ships_enemy_sunken = 0;
var won = -1;
var lobby_audio = null;
var audio_sea = null;
var rotate_audio = null;
var place_audio = null;
var won_audio = null;
var lose_audio = null;
var gamerestarted = false;
var dd = null;
var startbuttonclicked = false;
var lastwon = '';
var old_number_message = 0;
var dc_message = '';
var lockrotate = false;
var playerlistview_glob = null;
var clickblock = false;

