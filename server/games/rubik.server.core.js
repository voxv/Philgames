var rubik_server = module.exports = { handler : null }

rubik_server.handler  = function(client,message) {

		var commands = message.split('.');
		var command = commands[0];
		var subcommand = commands[1] || null;
		var commanddata = commands[2] || null;
		//console.log('Rubik got message:'+message);
		switch(command) {
			case 'c': //client message

				switch(subcommand) {

					case 'l' : // login

						if (client.hosting)
						{
							client.game.gamecore.players.self.login_name=commanddata
							//console.log('Settinghost login name to :'+client.game.gamecore.players.self.login_name)
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

						break;

					case 'sg':    // start game
						var thegame = client.game
						client.game.player_host.send('s.sg')

						var clients = client.game.player_clients
						for (var i in clients)
						{
							if (clients.hasOwnProperty(i))
							{
								clients[i].send('s.sg');   // send start game
							}
						}
						thegame.started = true;
						this.broadcastLobbyUpdates(client);
						break;

					case 'ssg':  // set start grid

						if (!client.hosting) return;
						var clients = client.game.player_clients
						client.send('s.ssg.'+commanddata);
						for (var i in clients)
						{
							if (clients.hasOwnProperty(i))
							{
								clients[i].send('s.ssg.'+commanddata)
							}
						}

						break;

					case 'ssm':    // setstartmini

						var clients = client.game.player_clients
						for (var i in clients)
						{
							if (clients.hasOwnProperty(i))
							{
								clients[i].send('s.ssm.'+commanddata)
							}
						}
						client.game.player_host.send('s.ssm.'+commanddata)
						break;

					case 'bm':
						if (client.hosting)
						{
							var clients = client.game.player_clients
							for (var i in clients)
							{
								if (clients.hasOwnProperty(i))
								{
									clients[i].send('s.bm.'+commanddata)
								}
							}
						}
						else
							client.game.player_host.send('s.bm.'+commanddata)

						break;

					case 'rw':   // request win

						if (!client.game.gamecore.haswinner)
						{
							client.game.gamecore.haswinner = true;
							if (client.hosting)
							{
								var clients = client.game.player_clients
								for (var i in clients)
								{
									if (clients.hasOwnProperty(i))
									{
										clients[i].send('s.opw.'+commanddata)
										//console.log('Im host, i request win, send s.opw. to client '+clients[i].userid)
									}
								}
								client.game.gamecore.players.self.score++;
							}
							else
							{
								var clients = client.game.player_clients
								for (var i in clients)
								{
									if (clients.hasOwnProperty(i) && i!=client.userid)
									{
										clients[i].send('s.opw.'+commanddata)
										//console.log('Im client, i request win, send s.opw. to client '+clients[i].game.player_host.userid)
									}
								}
								client.game.player_host.send('s.opw.'+commanddata)

								//console.log('Im client, i request win, send s.opw. to host '+client.game.player_host.userid)
								if (client.game.player_host.userid == client.userid)
									console.log('big fuck here client')

								client.game.gamecore.players.other.score++;
							}
							client.send('s.rw.1')
							//console.log('s.rw.1')
						}
						else
						{
							client.send('s.rw.0')
							//console.log('s.rw.0')
						}
						break;

					case 'eg':   // notify end game

						var thegamecore = client.game.gamecore
						var players_ended = thegamecore.players_ended;
						var thegame = client.game
						thegame.started = false;
						this.broadcastLobbyUpdates(client);

						players_ended.push(client.userid);

						if (players_ended.length==this.games[client.game.gamename]['max_players'])
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

					case 'cm':    // chat message

						var clients = client.game.player_clients
						client.game.player_host.send('s.cm.'+commanddata)
						for (var i in clients)
						{
							if (clients.hasOwnProperty(i))
							{
								clients[i].send('s.cm.'+commanddata);
							}
						}
						break;

					case 'nrs':   // notify real start

						var thegamecore = client.game.gamecore
						var players_started = thegamecore.players_started;

						players_started.push(client.userid);

						if (players_started.length==this.games[client.game.gamename]['max_players'])
						{
							var clients = client.game.player_clients
							for (var i in clients)
							{
								if (clients.hasOwnProperty(i))
								{
									clients[i].send('s.rs.')   // real start
								}
							}
							client.game.player_host.send('s.rs.')
							thegamecore.players_started = []
						}
						break;

					case 'sd':   // send danger sound

						if (client.hosting)
						{
							var clients = client.game.player_clients
							for (var i in clients)
							{
								if (clients.hasOwnProperty(i))
								{
									clients[i].send('s.sd.');
								}
							}
						}
						else
						{
							var clients = client.game.player_clients
							for (var i in clients)
							{
								if (clients.hasOwnProperty(i) && i!=client.userid)
								{
									clients[i].send('s.sd.');
								}
							}
						}

						break;
				}
			break;
		}
    };