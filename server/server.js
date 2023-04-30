    var
        game_server = module.exports = { games : {}, game_count:0, playerProfiles : {} },
        UUID        = require('node-uuid'),
        verbose     = true;

    global.window = global.document = global;

    require('./server.core.js');


	game_server.games  = {
		rubik: {
			max_players:2,
			games: { },
			game_count: 0
		},
		battleship: {
			max_players:2,
			games: { },
			game_count: 0
		},
		yum: {
			max_players:4,
			games: { },
			game_count: 0
		},
		mastermind: {
			max_players:2,
			games: { },
			game_count: 0
		},
		rummy: {
			max_players:4,
			games: { },
			game_count: 0
		},
		trouble: {
			max_players:4,
			games: { },
			game_count: 0
		}
		,
		uno: {
			max_players:4,
			games: { },
			game_count: 0
		}
		,
		boggle: {
			max_players:4,
			games: { },
			game_count: 0
		}
		/*,
		ulcer: {
			max_players:4,
			games: { },
			game_count: 0
		}*/
	}
	game_server.joinlocks = { }

    game_server.log = function() {
        if(verbose) console.log.apply(this,arguments);
    };

    game_server.loadGameHandlers = function() {
		var h = require('./games/lobby.server.core.js');
		eval('this.onMessage_lobby = '+h.handler)
		for (var i in this.games)
		{
			if (this.games.hasOwnProperty(i))
			{
				//console.log('./games/'+i+'.server.core.js')
				var h = require('./games/'+i+'.server.core.js');
				eval('this.onMessage_'+i+' = '+h.handler)
			}
		}
	};

	game_server.loadGameHandlers();
	game_server.sendToAllClients = function(msg,client,exclude)
	{
		var thegame = client.game
		var clients = client.game.player_clients
		for (var i in clients)
		{
			if (clients.hasOwnProperty(i))
			{
				if (exclude && i==client.userid) continue;
				clients[i].send(msg);   // send start game
			}
		}
	};
	game_server.getAllRoomsDetails = function()
	{
		var ret = {};
		for (var i in this.games)
		{
			if (this.games.hasOwnProperty(i))
			{
				ret[i]=this.getRoomDetails(i);
			}
		}

		return JSON.stringify(ret);
	}

	game_server.getRoomDetails = function(gamename)
	{
		if (this.games==undefined) { console.log('game '+gamename+' doesnt exist!'); return; }
		var thegames = this.games[gamename]['games'];

		var maxplayers = this.games[gamename]['max_players'];

		var rettot = {}
		var retrooms = []
		for (var i in thegames)
		{
			if (thegames.hasOwnProperty(i))
			{
				var totplayers = 1;
				var ret = {}
				var onegame = thegames[i];
				var gameid = onegame.id;
				var host_name = onegame.player_host.myprofile.login_name;
				ret['host_name'] = host_name
				var client_names = [];
				for (var i in onegame.player_clients)
				{
					if (onegame.player_clients.hasOwnProperty(i))
					{
						client_names.push(onegame.player_clients[i].myprofile.login_name);
						totplayers++;
					}
				}
				ret['clients_name'] = client_names
				ret['totplayers'] = onegame.player_count;
				ret['gameid'] = gameid
				ret['started'] = onegame.started;
				ret['isfull'] = onegame.isfull;
				retrooms.push(ret);
			}
		}
		rettot['rooms'] = retrooms
		rettot['splashpath'] = gamename+'/images/splash';
		rettot['gamename'] = gamename;

		return rettot;
	};
	game_server.logPlayer = function(player)
	{
		var playerprofile = {
			id:player.userid,
			login_name:'',
			currentGame:'',
			player_instance:player,
			tosave: {}
		};

		player.myprofile = playerprofile
		this.playerProfiles[ playerprofile.id ] = playerprofile;
	};

    game_server.createGame = function(player,theclients,isdebug) {

		var gamename = player.myprofile.currentGame

        var thegame = {
                id : UUID(),
                player_host:player,
                player_clients:{},
                player_count:1,
                gamename:gamename,
                started:false,
                full:false,
                max_players:this.games[gamename].max_players,
                debug:false
            };

        this.games[gamename]['games'][thegame.id] = thegame;

        this.game_count++;
        this.games[gamename].game_count++;
        if (isdebug)
        	thegame.debug=true;
		player.game = thegame;
		player.hosting = true;
		var ex = ''
		if (isdebug)
			ex = ' debug';
        console.log('Player ' + player.userid + ' created a'+ex+' game of '+gamename+' with id ' + player.game.id);

 		thegame.gamecore = eval('new game_core_'+gamename+'( thegame )');

		if (theclients)
		{
			for (var i in theclients)
			{
				if (theclients.hasOwnProperty(i))
				{
					theclients[i].gamecore = thegame.gamecore
					this.joinGame(thegame,theclients[i]);
				}
			}
		}

		var retsh = thegame.id+'||||'+thegame.gamename
        player.send('s.h.'+retsh);

		this.broadcastLobbyUpdates(player);
        return thegame;
    };

	game_server.joinGame = function(thegame,theclient) {
		thegame.player_clients[theclient.userid] = theclient;
		thegame.gamecore.players.others[theclient.userid] = theclient;
		thegame.gamecore.players.other = theclient;
		thegame.player_count++;
		if (thegame.player_count==this.games[thegame.gamename].max_players)
			thegame.isfull = true;
		console.log('Player ' + theclient.userid + ' joined game '+thegame.id);
		this.startGame(thegame,theclient.userid);
		delete this.joinlocks[thegame.id]
		this.broadcastLobbyUpdates(theclient);
	}


    game_server.startGame = function(game,clientid) {

        game.player_clients[clientid].send('s.jac.' + game.id);
        game.player_clients[clientid].game = game;
    };

	game_server.removeProfile = function(player) {

		var theprofile = this.playerProfiles[player.userid];
		var thegame = player.game;
		var isdebug = null;

		if (thegame)
		{
			if (thegame.debug)
				isdebug=true;
			if (thegame.player_count>1)
			{
				if (player.hosting)  // the host is leaving
				{
					var clients = thegame.player_clients

					var first = null;
					var others = {};
					var count = 1;
					var first_id = -1
					for (var i in clients)
					{
						if (clients.hasOwnProperty(i))
						{
							clients[i].myprofile.currentGame=thegame.gamename;
							if (count==1)
							{
								first=clients[i];   // pick client to become host
								first_id = i
							}
							else
							{
								others[clients[i].id] = clients[i]
							}
							if (clients[i])
							{
								var tot = {}
								tot['id_dc'] = player.userid
								tot['newhost'] = first_id
								clients[i].send('s.e.'+JSON.stringify(tot));
								//console.log('sending s.e.'+JSON.stringify(tot))
							}
							count++;
						}
					}
					this.createGame(first,others,isdebug)

				}
				else   // a client is leaving
				{
						var tot = {}
						tot['id_dc'] = player.userid
						tot['newhost'] = thegame.player_host.userid

						var thehost = thegame.player_host
						thehost.send('s.e.'+JSON.stringify(tot));

						var clients = thegame.player_clients
						var others = {};
						for (var i in clients)
						{
							if (clients.hasOwnProperty(i))
							{
								if (i==player.userid) continue;
								clients[i].myprofile.currentGame=thegame.gamename;
								others[clients[i].id] = clients[i]
								if (clients[i])
								{

									clients[i].send('s.e.'+JSON.stringify(tot));
									//console.log('sending s.e.'+JSON.stringify(tot))
								}
							}
						}
						this.createGame(thehost,others,isdebug)
				}
			}

			this.game_count--;
			this.games[thegame.gamename].game_count--;
			//console.log('There are now ' + this.games[thegame.gamename].game_count +' '+thegame.gamename+ ' games' );
			delete this.games[thegame.gamename]['games'][thegame.id];
		}

		delete this.playerProfiles[player.userid];
		this.broadcastLobbyUpdates(player);
	};

	game_server.broadcastLobbyUpdates = function(player) {
		for (var i in this.playerProfiles)
		{
			if (this.playerProfiles.hasOwnProperty(i))
			{
				if (this.playerProfiles[i].player_instance.current_room=='lobby')
					this.playerProfiles[i].player_instance.send('s.ggl.'+this.getAllRoomsDetails())
			}
		}
		//player.broadcast.in('lobby').send('s.ggl.'+this.getAllRoomsDetails());
		//player.send('s.ggl.'+this.getAllRoomsDetails());
		//console.log('broadcast'+JSON.stringify(this.getAllRoomsDetails()))
	}
