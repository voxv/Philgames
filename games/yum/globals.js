var CACHE_PREFIX = GAME_NAME;
var login_name = '';
var say
var gamestarted = false;
var Game = null;
var thisapp = null;
var debug = false;
var reconnected = false;
var checkothermovesTO = null;
var otherplayername=''
var otherplayerid=''
var myplayerid = ''
var gamestarted = false
var msg_duration = 1.5
var currentTurn = ''
var players_info = {}
var myturn = false
var firstThrowDone = false;
var subturnbusted = false
var gameended = false;
var totalPlayers = 0;
var shake_audio_block = false;
var dice_throw_after_anim = {}
var has_dice_throw_after_anim = false;
var is_in_anim_dice = false
var last_dice_anim = 0
var my_is_in_anim = false;
var dice_anim_speed = 0.3
var listeners_already_init = false;
var dropped = false;
var dddrop = null
var animsqueue = null;
var firstPutInCupDone = false;
var otherhasthrown = true;
var shake_anim = null;
var stop_shake = false;
var tot = {}



