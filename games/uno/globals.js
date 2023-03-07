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
var deckStackMod = 7
var unoAlreadyShouted = false
var boardimage = null

var cardviews = {}
var gridview
var deck
var trash = 0
var givexcardsfirst = 7
var cardwidth = 90
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
var topCardTrash=0
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
var groupboardview
var cardsinited = false;
var won = false
var deckX = 540
var deckY = 195
var trashX = 680
var trashY = 195
var handY = 515
var scoreviewer = 0
var is_swap = false
var old_current_cell = -1
var temp_hand = []
var olddragzindex = 0;
var inboard = false;
var page_drag_offset = 0
var highlighted_name_color = '#ffff99'
var normal_name_color = '#ffffff'
var pickedCard = 0
var colorselectedblockheight = cardheight+59
var colorselectedblockwidth = cardwidth+22
var current_turn_change_pending = 0
var winner_name = ''

var selectedColorId = 0

var card_data = [{"id":"1","color":"yellow","number":"-1","type":"special","special_id":"5"}, {"id":"2","color":"blue","number":"-1","type":"special","special_id":"5"}, {"id":"3","color":"blue","number":"6","type":"normal","special_id":"6"}, {"id":"4","color":"blue","number":"6","type":"normal","special_id":"6"}, {"id":"5","color":"blue","number":"5","type":"normal","special_id":"6"}, {"id":"6","color":"yellow","number":"5","type":"normal","special_id":"6"}, {"id":"7","color":"yellow","number":"9","type":"normal","special_id":"6"}, {"id":"8","color":"yellow","number":"9","type":"normal","special_id":"6"}, {"id":"9","color":"yellow","number":"4","type":"normal","special_id":"6"}, {"id":"10","color":"yellow","number":"3","type":"normal","special_id":"6"}, {"id":"11","color":"yellow","number":"0","type":"normal","special_id":"6"}, {"id":"12","color":"yellow","number":"2","type":"normal","special_id":"6"}, {"id":"13","color":"yellow","number":"7","type":"normal","special_id":"6"}, {"id":"14","color":"yellow","number":"7","type":"normal","special_id":"6"}, {"id":"15","color":"green","number":"7","type":"normal","special_id":"6"}, {"id":"16","color":"green","number":"7","type":"normal","special_id":"6"}, {"id":"17","color":"green","number":"3","type":"normal","special_id":"6"}, {"id":"18","color":"green","number":"4","type":"normal","special_id":"6"}, {"id":"19","color":"blue","number":"4","type":"normal","special_id":"6"}, {"id":"20","color":"blue","number":"1","type":"normal","special_id":"6"}, {"id":"21","color":"blue","number":"7","type":"normal","special_id":"6"}, {"id":"22","color":"blue","number":"4","type":"normal","special_id":"6"}, {"id":"23","color":"none","number":"-1","type":"special","special_id":"3"}, {"id":"24","color":"green","number":"-1","type":"special","special_id":"1"}, {"id":"25","color":"yellow","number":"-1","type":"special","special_id":"5"}, {"id":"26","color":"green","number":"6","type":"normal","special_id":"6"}, {"id":"27","color":"green","number":"9","type":"normal","special_id":"6"}, {"id":"28","color":"yellow","number":"3","type":"normal","special_id":"6"}, {"id":"29","color":"none","number":"-1","type":"special","special_id":"3"}, {"id":"30","color":"blue","number":"3","type":"normal","special_id":"6"}, {"id":"31","color":"blue","number":"9","type":"normal","special_id":"6"}, {"id":"32","color":"blue","number":"-1","type":"special","special_id":"5"}, {"id":"33","color":"blue","number":"2","type":"normal","special_id":"6"}, {"id":"34","color":"blue","number":"1","type":"normal","special_id":"6"}, {"id":"35","color":"blue","number":"-1","type":"special","special_id":"1"}, {"id":"36","color":"red","number":"4","type":"normal","special_id":"6"}, {"id":"37","color":"red","number":"-1","type":"special","special_id":"2"}, {"id":"38","color":"red","number":"2","type":"normal","special_id":"6"}, {"id":"39","color":"red","number":"-1","type":"special","special_id":"5"}, {"id":"40","color":"red","number":"9","type":"normal","special_id":"6"}, {"id":"41","color":"blue","number":"9","type":"normal","special_id":"6"}, {"id":"42","color":"green","number":"-1","type":"special","special_id":"5"}, {"id":"43","color":"green","number":"-1","type":"special","special_id":"1"}, {"id":"44","color":"yellow","number":"6","type":"normal","special_id":"6"}, {"id":"45","color":"yellow","number":"-1","type":"special","special_id":"1"}, {"id":"46","color":"blue","number":"3","type":"normal","special_id":"6"}, {"id":"47","color":"red","number":"3","type":"normal","special_id":"6"}, {"id":"48","color":"red","number":"7","type":"normal","special_id":"6"}, {"id":"49","color":"yellow","number":"1","type":"normal","special_id":"6"}, {"id":"50","color":"green","number":"0","type":"normal","special_id":"6"}, {"id":"51","color":"yellow","number":"2","type":"normal","special_id":"6"}, {"id":"52","color":"red","number":"-1","type":"special","special_id":"1"}, {"id":"53","color":"green","number":"-1","type":"special","special_id":"5"}, {"id":"54","color":"blue","number":"5","type":"normal","special_id":"6"}, {"id":"55","color":"yellow","number":"-1","type":"special","special_id":"2"}, {"id":"56","color":"red","number":"1","type":"normal","special_id":"6"}, {"id":"57","color":"green","number":"-1","type":"special","special_id":"2"}, {"id":"58","color":"red","number":"0","type":"normal","special_id":"6"}, {"id":"59","color":"green","number":"-1","type":"special","special_id":"2"}, {"id":"60","color":"none","number":"-1","type":"special","special_id":"3"}, {"id":"61","color":"red","number":"4","type":"normal","special_id":"6"}, {"id":"62","color":"red","number":"7","type":"normal","special_id":"6"}, {"id":"63","color":"blue","number":"7","type":"normal","special_id":"6"}, {"id":"64","color":"yellow","number":"8","type":"normal","special_id":"6"}, {"id":"65","color":"yellow","number":"-1","type":"special","special_id":"2"}, {"id":"66","color":"red","number":"2","type":"normal","special_id":"6"}, {"id":"67","color":"green","number":"8","type":"normal","special_id":"6"}, {"id":"68","color":"none","number":"-1","type":"special","special_id":"3"}, {"id":"69","color":"yellow","number":"8","type":"normal","special_id":"6"}, {"id":"70","color":"red","number":"8","type":"normal","special_id":"6"}, {"id":"71","color":"green","number":"8","type":"normal","special_id":"6"}, {"id":"72","color":"green","number":"3","type":"normal","special_id":"6"}, {"id":"73","color":"yellow","number":"-1","type":"special","special_id":"1"}, {"id":"74","color":"blue","number":"8","type":"normal","special_id":"6"}, {"id":"75","color":"red","number":"-1","type":"special","special_id":"2"}, {"id":"76","color":"green","number":"9","type":"normal","special_id":"6"}, {"id":"77","color":"none","number":"-1","type":"special","special_id":"4"}, {"id":"78","color":"yellow","number":"6","type":"normal","special_id":"6"}, {"id":"79","color":"blue","number":"-1","type":"special","special_id":"2"}, {"id":"80","color":"red","number":"3","type":"normal","special_id":"6"}, {"id":"81","color":"yellow","number":"5","type":"normal","special_id":"6"}, {"id":"82","color":"red","number":"1","type":"normal","special_id":"6"}, {"id":"83","color":"blue","number":"8","type":"normal","special_id":"6"}, {"id":"84","color":"green","number":"5","type":"normal","special_id":"6"}, {"id":"85","color":"blue","number":"0","type":"normal","special_id":"6"}, {"id":"86","color":"blue","number":"-1","type":"special","special_id":"2"}, {"id":"87","color":"none","number":"-1","type":"special","special_id":"4"}, {"id":"88","color":"yellow","number":"4","type":"normal","special_id":"6"}, {"id":"89","color":"blue","number":"-1","type":"special","special_id":"1"}, {"id":"90","color":"blue","number":"2","type":"normal","special_id":"6"}, {"id":"91","color":"red","number":"8","type":"normal","special_id":"6"}, {"id":"92","color":"red","number":"5","type":"normal","special_id":"6"}, {"id":"93","color":"red","number":"9","type":"normal","special_id":"6"}, {"id":"94","color":"green","number":"5","type":"normal","special_id":"6"}, {"id":"95","color":"green","number":"2","type":"normal","special_id":"6"}, {"id":"96","color":"green","number":"1","type":"normal","special_id":"6"}, {"id":"97","color":"green","number":"6","type":"normal","special_id":"6"}, {"id":"98","color":"none","number":"-1","type":"special","special_id":"4"}, {"id":"99","color":"green","number":"2","type":"normal","special_id":"6"}, {"id":"100","color":"red","number":"6","type":"normal","special_id":"6"}, {"id":"101","color":"red","number":"6","type":"normal","special_id":"6"}, {"id":"102","color":"red","number":"-1","type":"special","special_id":"1"}, {"id":"103","color":"yellow","number":"1","type":"normal","special_id":"6"}, {"id":"104","color":"green","number":"1","type":"normal","special_id":"6"}, {"id":"105","color":"red","number":"-1","type":"special","special_id":"5"}, {"id":"106","color":"red","number":"5","type":"normal","special_id":"6"}, {"id":"107","color":"green","number":"4","type":"normal","special_id":"6"}, {"id":"108","color":"none","number":"-1","type":"special","special_id":"4"}]


/*
this.won_audio = new Audio('sounds/card_flip1.mp3');
this.shuffle_audio = new Audio('sounds/shuffle.mp3');
unobutton_audio = new Audio('sounds/uno_button.mp3');
*/