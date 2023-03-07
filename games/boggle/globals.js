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
var otherplayermodels = {}
var is_in_anim = false;
var gamestarted = false
var myturn = false;
var total_players = 1;
var checkothermovesTO = null
var message_top = null
var digitImages = {}

var GAMETIME = 35;
var siteurl = 'https://philgames.herokuapp.com/';
var app;
var global_results;
var has_results = false;
var result_view = null;
var players = [];
var loginname_ById = {};
var letters;
var got_results = false;
var botmsg_received = [];
var already_played = false;
var in_game = false;
var got_initial_messages = false;
var got_start_button = false;
var loading_panel = null;
var definition_shown = false;
var colorRestore = { };
var is_word_no_def = false;
var password_panel = null;
var definition_panel = null;
var has_grant = false;
var global_deletedwords = [];
var global_addedwords = [];
var admin_name = '';
var addword_panel = null;
var addword = '';
var animtoggle=1;
var pathnodes = [];
var foundwordlist = null;
var rgrid_attached = false;
var playersingame = [];
var game_config_container = null;
var in_game_got_duration=true;
var config_minletters = 0;
var solution_empty = false;
var empty_tots = {}
var fromchange = false;
var started=false;
var old_number_message = 0;
var currentDuration = '';
var fin_confirm_panel = null;
var result_hash = '';
var letters_refreshed = [];




