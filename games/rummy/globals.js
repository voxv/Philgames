var CACHE_PREFIX = GAME_NAME;
var login_name = '';
var say
var gamestarted = false;
var Game = null;
var thisapp = null;
var debug = false;
var reconnected = false;
var checkothermovesTO = null;
var top_anim_duration_fadein = 0.3;
var top_anim_duration_sustain = 2
var winlose_anim_delay = 5
var players_info = {}
var myplayerid = '';
var otherplayermodels = {}
var is_in_anim = false;
var gamestarted = false
var myturn = false;
var total_players = 1;

var cardviews = {}
var gridview
var deck
var trash = 0
var givexcardsfirst = 7
var cardwidth = 80
var cardwidthinhand = 130
var cardwidthingroup = 80
var gridviewoffset = 10
var gridtighness = 100
var othergridtighness = 35
var cardheight = 100
var groups_spacing_x = 270
var groups_spacing_y = 125
var playerOrder
var mastercards = {}
var latestTrashOrder = 0
var latestHandOrder = 0
var currentTurn = 0
var totalCardsInDeck =0;
var topDeckCard=0
var verticalCenter = 270
var horizontalCenter = 620
var hand = [];
var hands = {}
var oldZIndex = 0;
var xdrag=0;
var ydrag=0;
var cardsinited = 0;
var canplaceOnTrash = false;
var trashorder = 0
var in_anim = false
var turnstep = 0;  //0 must pick, 1 can meld/layout
var groupboardview
var cardsinited = false;
var won = false
var deckX = 570
var deckY = 140
var trashX = 680
var trashY = 140
var playerwon = '';
var scoreviewer = 0
var is_swap = false
var old_current_cell = -1
var temp_hand = []
var olddragzindex = 0;
var inboard = false;
var page_drag_offset = 0
var highlighted_name_color = '#ffff99'
var normal_name_color = '#ffffff'
var boardimage = null

var card_data = [{"id":"1","number":"1","type":"t"}, {"id":"2","number":"1","type":"p"}, {"id":"3","number":"1","type":"c"}, {"id":"4","number":"1","type":"ca"}, {"id":"5","number":"13","type":"t"}, {"id":"6","number":"13","type":"p"}, {"id":"7","number":"13","type":"c"}, {"id":"8","number":"13","type":"ca"}, {"id":"9","number":"12","type":"t"}, {"id":"10","number":"12","type":"p"}, {"id":"11","number":"12","type":"c"}, {"id":"12","number":"12","type":"ca"}, {"id":"13","number":"11","type":"t"}, {"id":"14","number":"11","type":"p"}, {"id":"15","number":"11","type":"c"}, {"id":"16","number":"11","type":"ca"}, {"id":"17","number":"10","type":"t"}, {"id":"18","number":"10","type":"p"}, {"id":"19","number":"10","type":"c"}, {"id":"20","number":"10","type":"ca"}, {"id":"21","number":"9","type":"t"}, {"id":"22","number":"9","type":"p"}, {"id":"23","number":"9","type":"c"}, {"id":"24","number":"9","type":"ca"}, {"id":"25","number":"8","type":"t"}, {"id":"26","number":"8","type":"p"}, {"id":"27","number":"8","type":"c"}, {"id":"28","number":"8","type":"ca"}, {"id":"29","number":"7","type":"t"}, {"id":"30","number":"7","type":"p"}, {"id":"31","number":"7","type":"c"}, {"id":"32","number":"7","type":"ca"}, {"id":"33","number":"6","type":"t"}, {"id":"34","number":"6","type":"p"}, {"id":"35","number":"6","type":"c"}, {"id":"36","number":"6","type":"ca"}, {"id":"37","number":"5","type":"t"}, {"id":"38","number":"5","type":"p"}, {"id":"39","number":"5","type":"c"}, {"id":"40","number":"5","type":"ca"}, {"id":"41","number":"4","type":"t"}, {"id":"42","number":"4","type":"p"}, {"id":"43","number":"4","type":"c"}, {"id":"44","number":"4","type":"ca"}, {"id":"45","number":"3","type":"t"}, {"id":"46","number":"3","type":"p"}, {"id":"47","number":"3","type":"c"}, {"id":"48","number":"3","type":"ca"}, {"id":"49","number":"2","type":"t"}, {"id":"50","number":"2","type":"p"}, {"id":"51","number":"2","type":"c"}, {"id":"52","number":"2","type":"ca"}]



