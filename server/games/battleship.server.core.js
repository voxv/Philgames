var battleship_server = module.exports = { handler : null }

battleship_server.handler  = function(client,message) {
		var commands = message.split('.');
		var command = commands[0];
		var subcommand = commands[1] || null;
		var commanddata = commands[2] || null;
		console.log('Battleship got message:'+message);
		switch(command) {
			case 'c': //client message

				switch(subcommand) {
					case 'l' : // login

						if (client.hosting)
						{
							client.game.gamecore.players.self.login_name=commanddata
						}
						else
						{
							client.game.player_host.send('s.l.'+commanddata)
							client.game.gamecore.addClient(client,commanddata)
							client.game.gamecore.players.other.login_name=commanddata
							client.game.player_clients[client.userid].send('s.l.'+client.game.gamecore.players.self.login_name)
						}
						this.broadcastLobbyUpdates(client);
						break;

					case 'cfg': // confirm a game

						var cc = commanddata.split('|||');
						var gameid = cc[0];
						var gamename = cc[1];
						var ret = '';
						if (gameid=='debug' || this.games[gamename]['games'][gameid])
						{
							ret = '1';
							if (gameid!='debug')
							{
								var thegame = this.games[gamename]['games'][gameid];
								if (thegame.player_host.userid==client.userid)
									ret += '|||1';  // is host
								else
									ret += '|||0';  // is client
							}
							client.emit('confirm',ret);
						}
						else
						{
							ret = '0|||0';
							client.emit('confirm',ret);
						}
						break;

					case 'sc':  // get scores

						if (!client.game.gamecore.players.other || client.game.gamecore.players.other==undefined)
							ret = 0
						else
							ret = client.game.gamecore.players.other.score;
						var tosend = client.game.gamecore.players.self.score+'-'+ret;
						client.send('s.sc.'+tosend)
						//console.log('sending: s.sc.'+tosend)
						break;

					case 'sg':    // start game

						var thegame = client.game
						thegame.player_host.send('s.sg')
						this.sendToAllClients('s.sg',client)

						thegame.started = true;
						this.broadcastLobbyUpdates(client);
						break;

					case 'ss':    // submit ships
						var thegame = client.game
						var thegamecore = thegame.gamecore
						if (client.hosting)
						{
							thegamecore.host_ships = commanddata
							thegamecore.host_ships_count++;
						}
						else
						{
							thegamecore.client_ships = commanddata
							thegamecore.client_ships_count++;
						}

						if (thegamecore.client_ships_count>0 && thegamecore.host_ships_count>0)
						{
							var ret = {}
							ret['host']=thegamecore.host_ships
							ret['other']=thegamecore.client_ships
							ret['current_turn'] = thegamecore.current_turn

							thegame.player_host.send('s.srg.'+JSON.stringify(ret))  // start real game
							this.sendToAllClients('s.srg.'+JSON.stringify(ret),client)
							//console.log('sending s.srg.'+JSON.stringify(ret))
						}
						else
						{
							client.send('s.wo.')
						}
						break;
					case 'rm':    // record move
						var thegame = client.game
						var thegamecore = thegame.gamecore

						commanddata = JSON.parse(commanddata)
						var sq_id = commanddata['square']
						var is_hit = commanddata['ishit']
						var is_completed = commanddata['completed']

						if (!is_hit)
						{
							if (thegamecore.current_turn=='host')
								thegamecore.current_turn='other'
							else
								thegamecore.current_turn='host'
						}

						var ret = {}
						ret['current_turn'] = thegamecore.current_turn
						ret['square'] = sq_id
						ret['ishit'] = is_hit
						ret['completed'] = is_completed

						if (client.hosting)
						{
							this.sendToAllClients('s.rm.'+JSON.stringify(ret),client)
							//console.log('sending:'+'s.rm.'+JSON.stringify(ret)+' to other')
						}
						else
						{

							this.sendToAllClients('s.rm.'+JSON.stringify(ret),client,true)
							thegame.player_host.send('s.rm.'+JSON.stringify(ret))  // client player won
							//console.log('sending:'+'s.rm.'+JSON.stringify(ret)+' to host')
						}

						break;
					case 'eg':   // notify end game

						var thegamecore = client.game.gamecore
						var players_ended = thegamecore.players_ended;
						var thegame = client.game
						thegame.started = false;
						this.broadcastLobbyUpdates(client);

						players_ended.push(client.userid);

						if (players_ended.length==thegame.player_count)
						{
							//console.log('Game '+client.game.id+' ended')
							if (client.hosting)
							{
								client.send('s.lb.'+commanddata);
							}
							else
							{
								var thehost = client.game.player_host
								thehost.send('s.lb.'+commanddata);
							}
							thegamecore.haswinner = false;
							thegamecore.players_ended = []
							thegamecore.client_ships_count = 0;
							thegamecore.host_ships = {}
							thegamecore.client_ships  = {}
							thegamecore.current_turn = 'host'
						}
						break;

					case 'hl' :   // host is back home

						var clients = client.game.player_clients
						for (var i in clients)
						{
							if (clients.hasOwnProperty(i))
							{
								clients[i].send('s.hl.'+commanddata)
							}
						}
						break;
					case 'iw':   // I win
						//console.log('I win')
						if (client.hosting)
							client.game.gamecore.players.self.score++;
						else
							client.game.gamecore.players.other.score++;
						//console.log(client.game.gamecore.players.self.score+'-'+client.game.gamecore.players.other.score)
						break;
				}
			break;
		}
	};