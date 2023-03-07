var CACHE_PREFIX = 'blopgames_';
var playerInfo = {}
var refreshplayerTO = null;
var refreshgameTO = null;
var startrefeshplayers;
var startrefreshgame;
var login_name = '';
var REFRESHPLAYERDELAY = 1000;
var old_number_message = 0;
var blockspos = {}
var spacepos = [400,400]
var modelcache ={}
var otherplayername=''
var otherplayerid=''
var currentSnap = ''
var say
var started = false;
var myscore= 0
var opponentscore=0
var click_audio = null
var win_audio = null
var loser_audio = null
var beep_audio = null
var beep_timeout = null;
var beep_timeout2 = null
var lastSnap
var initGrid=false;
var initMini=false;
var endgamesent=false;
var gamestarted = false;
var Game = null;
var blockById = {}
var cellById = {}
var blockByCellId = {}
var cellByBlockId = {}
var spaceview = null;
var is_in_anim = false;
var anims = {}
var animspeed = 0.2
var blocksToMove = []