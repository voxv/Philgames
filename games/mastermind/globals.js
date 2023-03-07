var CACHE_PREFIX = GAME_NAME;
var login_name = '';
var say
var gamestarted = false;
var Game = null;
var thisapp = null;
var debug = false;
var reconnected = false;
var checkothermovesTO = null;
var old_number_message = 0
var players_info = {}
var otherplayername=''
var otherplayerid=''
var myplayerid = '';
var otherplayerid = ''
var is_in_anim = false;
var gamestarted = false
var boardview = null;
var boardviewplayer = null;
var selectorview = null;
var current_master = 0;
var masterstart_button = null;
var masterstart_button_enable = false;
var playerstart_button = null;
var playerstart_button_enable = false;
var colors_set = false;
var eventOne = 0;
var eventTwo = 0;
var current_row = 9;
var current_row_str = '';
var trigger_current_row_dec = false;
var inv_lookup = { 0:9,1:8,2:7,3:6,4:5,5:4,6:3,7:2,8:1,9:0 }
var id_inv = {}
var current_hints_str = '';
var endgame = 0;
var hidewinlose = null;
var solution = [];
var loopback = null;
var master_locked_in = false;
var loopback_delay = 5000
var endgameshown = false;

for (var i = 0 ; i < 40 ; i+=4)
{
	var ii = i;
	for (var j = (39-i) ; j > (39-i)-4 ; j--)
	{
		id_inv[ii++]=j;
	}
}
var lookupAdjustementsMaster= {
	0:[7,0,5],
	1:[7,0,5],
	2:[7,0,5],
	3:[7,0,5],

	4:[6,0,4],
	5:[6,0,4],
	6:[6,0,4],
	7:[6,0,4],

	8: [6,0,3],
	9: [6,0,3],
	10:[6,0,3],
	11:[5,0,3],

	12:[6,2,3],
	13:[6,2,3],
	14:[6,2,3],
	15:[5,2,3],

	16:[6,2,2],
	17:[4,2,2],
	18:[4,2,2],
	19:[4,2,2],

	20:[6,2,2],
	21:[4,2,2],
	22:[4,2,2],
	23:[4,2,2],

	24:[6,2,1],
	25:[4,2,1],
	26:[4,2,1],
	27:[4,2,1],

	28:[6,2,1],
	29:[4,2,1],
	30:[4,2,1],
	31:[5,2,1],

	32:[6,2,0],
	33:[4,2,0],
	34:[4,3,0],
	35:[5,4,0],

	36:[6,3,0],
	37:[4,4,0],
	38:[4,5,0],
	39:[5,6,0],
}

var lookupAdjustements= {
	0:[3,-1,4],
	1:[3,-1,4],
	2:[2,-1,4],
	3:[1,1,4],

	4:[3,-2,4],
	5:[3,-2,4],
	6:[4,-2,4],
	7:[5,-2,4],

	8:[5,-2,4],
	9:[5,-2,4],
	10:[6,-2,4],
	11:[5,-2,4],

	12:[7,1,3],
	13:[7,1,3],
	14:[5,1,3],
	15:[5,1,3],

	16:[7,5,3],
	17:[7,5,3],
	18:[5,5,3],
	19:[5,5,3],

	20:[7,9,2],
	21:[7,9,2],
	22:[5,9,2],
	23:[5,9,2],

	24:[7,9,1],
	25:[7,9,1],
	26:[5,9,1],
	27:[5,9,1],

	28:[7,10,1],
	29:[7,10,1],
	30:[6,10,1],
	31:[5,10,1],

	32:[10,10,0],
	33:[10,10,0],
	34:[7,10,0],
	35:[5,10,0],

	36:[10,10,0],
	37:[10,10,0],
	38:[8,10,0],
	39:[5,10,0],
}