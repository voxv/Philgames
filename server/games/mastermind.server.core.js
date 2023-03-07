var mastermind_server = module.exports = { handler : null }
	var inverseSol = function(sol)
	{
		var ret = {}
		var mmap = { 0:3,1:2,2:1,3:0 }
		for (var i in sol)
		{
			if (sol.hasOwnProperty(i))
			{
					ret[mmap[i]] =sol[i]
			}
		}
		return ret

	};

    var inArray = function(needle, haystack) {
	var length = haystack.length;
	for(var i = 0; i < length; i++) {
		if(haystack[i] == needle) return true;
	}
	return false;
}
mastermind_server.handler  = function(client,message) {
		var commands = message.split('.');
		var command = commands[0];
		var subcommand = commands[1] || null;
		var commanddata = commands[2] || null;
		console.log('Mastermind got message:'+message);
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

						break;

					case 'sg':    // start game

						var thegame = client.game
						var thegamecore = thegame.gamecore

						thegame.started = true;

						var ret = 'host'
						if (thegamecore.last_won!='')
						{
							ret = thegamecore.last_won
						}
						thegame.player_host.send('s.sg.'+ret)
						this.sendToAllClients('s.sg.'+ret,client)

						this.broadcastLobbyUpdates(client);
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
							if (client.hosting)
							{
								client.send('s.lb.'+commanddata);
							}
							else
							{
								var thehost = client.game.player_host
								thehost.send('s.lb.'+commanddata);
							}
							thegame.gamecore.current_turn = 'host'
							thegame.gamecore.players_ended = []
							if (thegame.gamecore.current_master=='host')
								thegame.gamecore.current_master = 'other'
							else
								thegame.gamecore.current_master = 'host'
							thegame.gamecore.last_won = ''
							thegame.gamecore.solution = {}
							thegame.gamecore.current_row ={}

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

					case 'et':  // end turn
						var vv = JSON.parse(commanddata)

						break;
					case 'gid':
						client.send('s.gid.'+client.userid)
						break;
					case 'god':
						if (client.hosting)
						{
							var clients = client.game.player_clients
							var oid = '';
							for (var i in clients)
							{
								if (clients.hasOwnProperty(i))
								{
									oid = clients[i].userid
								}
							}
							client.send('s.god.'+oid);
						}
						else
						{
							client.send('s.god.'+client.game.player_host.myprofile.id);
							client.game.player_host.send('s.god.'+client.userid);
						}
						break;
					case 'gcm':    // get current master
						client.send('s.gcm.'+client.game.gamecore.current_master)
						//console.log('sending: s.gcm.'+client.game.gamecore.current_master)
						break;
					case 'ss':    // send solution
						var temp =  JSON.parse(commanddata)
						var themin = 9999
						for (var i in temp)
						{
							if (temp.hasOwnProperty(i))
							{
								if (parseInt(i)<themin)
								{
									themin = parseInt(i)
								}
							}
						}
						var news = {}
						for (var i in temp)
						{
							if (temp.hasOwnProperty(i))
							{
								var ind = parseInt(i)
								news[(ind-themin)] = temp[i]
							}
						}

						client.game.gamecore.solution = news

						//console.log('got solution:'+client.game.gamecore.solution)
						if (client.hosting)
						{
							this.sendToAllClients('s.ss.'+JSON.stringify(client.game.gamecore.solution),client)
						}
						else
						{
							client.game.player_host.send('s.ss.'+JSON.stringify(client.game.gamecore.solution))
						}
						//client.send('s.ss.'+JSON.stringify(client.game.gamecore.solution))
						//console.log('sending: s.ss.'+JSON.stringify(client.game.gamecore.solution))
						break;
					case 'cs': // calculate solution


						//console.log('calc solution')
						//console.log('original sol:'+JSON.stringify(client.game.gamecore.solution))

						var attempt = JSON.parse(commanddata)

						var themin = 9999
						for (var i in attempt)
						{
							if (attempt.hasOwnProperty(i))
							{
								if (parseInt(i)<themin)
								{
									themin = parseInt(i)
								}
							}
						}
						var new_attempt = {}
						for (var i in attempt)
						{
							if (attempt.hasOwnProperty(i))
							{
								var ind = parseInt(i)
								new_attempt[(ind-themin)] = attempt[i]
							}
						}

						//console.log('attempt:'+JSON.stringify(new_attempt))
						var attempt_inv = inverseSol(new_attempt)
						//console.log('inv attempt:'+JSON.stringify(attempt_inv))

						var tot_black = 0;
						var tot_white = 0;
						var checked_whites = [];
						for (var i in attempt_inv)
						{
							if (attempt_inv.hasOwnProperty(i))
							{
								//console.log('compare '+attempt_inv[i]+' --- '+client.game.gamecore.solution[i]);
								if (attempt_inv[i]==client.game.gamecore.solution[i])
								{
									//logproduce('toblack++');
									tot_black++;
									//checked_blacks.push(i)
								}
								else
								{
									for (var j in client.game.gamecore.solution)
									{
										if (client.game.gamecore.solution.hasOwnProperty(j))
										{

											if (!inArray(j,checked_whites) && client.game.gamecore.solution[j]==attempt_inv[i] && client.game.gamecore.solution[j]!=attempt_inv[j])
											{
												//logproduce('towhite++');
												checked_whites.push(j)
												tot_white++;
												break;
											}

										}
									}
								}
							}
						}
						var tot = [tot_black,tot_white]
						//console.log(JSON.stringify(tot))
						client.game.player_host.send('s.cs.'+JSON.stringify(tot))
						this.sendToAllClients('s.cs.'+JSON.stringify(tot),client)
						//console.log('sending s.cs.'+JSON.stringify(tot))
						break;

					case 'ur':   // update current row on master
						//console.log('current_master:'+client.game.gamecore.current_master+'  myid:'+client.userid)
						if (client.hosting && client.game.gamecore.current_master!='host')
						{
							this.sendToAllClients('s.ur.'+commanddata,client)
						}
						else if (client.game.gamecore.current_master=='host')
						{
							client.game.player_host.send('s.ur.'+commanddata)
						}
						//console.log('send update to master row:'+commanddata)
						break
			}
			break;
		}
	};

