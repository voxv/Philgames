var trouble_server = module.exports = { handler : null }



trouble_server.handler  = function(client,message) {
		var commands = message.split('.');
		var command = commands[0];
		var subcommand = commands[1] || null;
		var commanddata = commands[2] || null;
		console.log('trouble got message:'+message);
		switch(command) {
			case 'c': //client message

				switch(subcommand) {
					case 'l' : // login

						if (client.hosting)
						{
							client.game.gamecore.players.self.login_name=commanddata
							client.game.gamecore.players.self.id = client.userid
							client.send('s.hid.'+client.userid)
						}
						else
						{
							client.game.gamecore.addClient(client,commanddata)
							
							var logininfo = { id: client.userid, login_name:commanddata , color: client.game.gamecore.players.others[client.userid].color }

							var logininfo_str = JSON.stringify(logininfo)
							client.game.player_host.send('s.l.'+logininfo_str)
							this.sendToAllClients('s.l.'+logininfo_str,client,true)
							client.send('s.l.'+logininfo_str)
							//client.send('s.gmi.'+logininfo)
							//console.log('sending to me: '+'s.l.'+logininfo_str)

							var tot = {}
							tot['host'] = { id: client.game.player_host.userid, login_name: client.game.gamecore.players.self.login_name, color:client.game.gamecore.players.self.color }
							tot['clients'] = {}
							for (var i in client.game.player_clients)
							{
								if (client.game.player_clients.hasOwnProperty(i) && i!=client.userid)
								{
									var oneclient = client.game.player_clients[i]
									tot['clients'][oneclient.userid] = { id: oneclient.userid, login_name: client.game.gamecore.players.others[i]['login_name'], color: client.game.gamecore.players.others[i].color }
								}
							}
							var totstr = JSON.stringify(tot)
							//console.log('sending log multiple to myself:'+totstr)
							client.send('s.lm.'+totstr)    // logmultiple
							client.send('s.hid.'+client.userid)
						}
						this.broadcastLobbyUpdates(client);
						break;

					case 'gpi':   // get player info
						var thegamecore = client.game.gamecore
						thegamecore.getPlayerInfo(client,commanddata)
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
						var tot = {}
						var hsc = client.game.gamecore.players.self.score
						
						var others = client.game.gamecore.players.others

						for (var i in others)
						{
							if (others.hasOwnProperty(i))
							{
								
								if (others[i].score==undefined)
									others[i].score = 0
								tot[i] = others[i].score
							}
						}
						tot[client.game.gamecore.players.self.id] =  hsc
						var tot_str = JSON.stringify(tot);
					
						client.send('s.sc.'+tot_str)

						break;

					case 'sg':    // start game

						var thegame = client.game
						var thegamecore = thegame.gamecore

						thegamecore.initOrder(thegame)

						thegame.started = true;

						thegame.player_host.send('s.sg.'+JSON.stringify(thegamecore.player_order))
						this.sendToAllClients('s.sg.'+JSON.stringify(thegamecore.player_order),client)
						//console.log('Sending ORDER: s.sg.'+JSON.stringify(thegamecore.player_order))
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
							//console.log('Game '+client.game.id+' ended')
							if (client.hosting)
							{
								//console.log('sending lb')
								client.send('s.lb.'+commanddata);
							}
							else
							{
								var thehost = client.game.player_host
								thehost.send('s.lb.'+commanddata);
								//console.log('sending lb')
							}

							thegamecore.players_ended = []
							thegamecore.current_turn = ''
							thegamecore.player_order = { }
					
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

					case 'gid':
						client.send('s.gid.'+client.userid)
						break;

					case 'win':

						client.game.player_host.send('s.win.'+commanddata)
						this.sendToAllClients('s.win.'+commanddata,client)
						break

					case 'usc':   // update score
						if (client.hosting)
						{
							if (client.game.gamecore.players.self.score==undefined)
								client.game.gamecore.players.self.score=0
							client.game.gamecore.players.self.score+=parseInt(commanddata)
							
						}
						else
						{
							if (client.game.gamecore.players.others[client.userid].score==undefined)
								client.game.gamecore.players.others[client.userid].score=0
							client.game.gamecore.players.others[client.userid].score+=parseInt(commanddata)
						}
						break
						
					case 'stm' :  // show start message
						
						client.game.player_host.send('s.stm.')
						this.sendToAllClients('s.stm.',client)
						break

					case 'ppp' :  // play popper pre
						var ret = {}
						ret['played'] = parseInt(commanddata);
						if (client.hosting)
						{
							client.game.gamecore.players.self.pre_played = ret['played']
						}
						else
						{
							client.game.gamecore.players.others[client.userid].pre_played =  ret['played']
						}
						
						var thegamecore = client.game.gamecore
						//console.log('going in analyze')
						var ret = thegamecore.analyzeDiceRoll()
						ret['played'] = parseInt(commanddata);
						ret['player'] = client.userid;						

						//console.log('analyze results:'+JSON.stringify(ret))
						
						client.game.player_host.send('s.ppp.'+JSON.stringify(ret))
						this.sendToAllClients('s.ppp.'+JSON.stringify(ret),client)
						
						break
						
					case 'ct': // change turn
						//console.log('got ct')
						var thegamecore = client.game.gamecore
						thegamecore.sendChangePlayerTurn(client)
						break;
						
					case 'spw' : // show pre win
						var ret = {}
						var thegamecore = client.game.gamecore
						ret['winner'] = commanddata
						thegamecore.initOrder(client.game,ret['winner'])
						ret['currentTurn'] = thegamecore.player_order[1]
						client.game.player_host.send('s.spw.'+JSON.stringify(ret))
						this.sendToAllClients('s.spw.'+JSON.stringify(ret),client)						
						break
						
					case 'udc':   // update player color
						var tot = JSON.parse(commanddata)
						var thegamecore = client.game.gamecore
						if (tot['player']==client.game.player_host.userid)
						{
							thegamecore.players.self.color = tot['color']
							client.game.player_host.myprofile.tosave = { 'color': tot['color'] }
							//console.log('updating host ('+thegamecore.players.self.id+') color:'+thegamecore.players.self.color)
						}
						else
						{
							thegamecore.players.others[tot['player']].color = tot['color']
							client.game.player_clients[tot['player']].myprofile.tosave = { 'color': tot['color'] }
							//console.log('updating client ('+tot['player']+') color:'+thegamecore.players.others[tot['player']].color)
						}
						client.game.player_host.send('s.udc.'+commanddata)
						this.sendToAllClients('s.udc.'+commanddata,client)							
						break
						
					case 'rd': // roll dice 
						client.game.player_host.send('s.rd.'+commanddata)
						this.sendToAllClients('s.rd.'+commanddata,client)							
						break
						
					case 'ssp':   // show play second time 
						client.game.player_host.send('s.ssp.'+commanddata)
						this.sendToAllClients('s.ssp.'+commanddata,client)							
						break
						
					case 'scp':   // show cannot play
						//console.log('Got SCP:'+commanddata)
						client.game.player_host.send('s.scp.'+commanddata)
						this.sendToAllClients('s.scp.'+commanddata,client)							
						break
						
					case 'ctg':   // change turn in game
						if (commanddata==1)
							client.game.gamecore.sendChangePlayerTurnInGame(client)
						client.game.player_host.send('s.ctg.'+commanddata)
						this.sendToAllClients('s.ctg.'+commanddata,client)							
						break
						
					case 'sem': // show player end game message
						var ret = {}
						ret['player'] = client.userid
						ret['animpos'] = JSON.parse(commanddata)
						
						var themax = 0;
						var won_players = []
						var no_won_players = []
						var thegamecore = client.game.gamecore
						if (parseInt(thegamecore.players.self.game_won)>0)
						{
							won_players.push(thegamecore.players.self.id)
							themax = parseInt(thegamecore.players.self.game_won)
						}
						else
						{
							no_won_players.push(thegamecore.players.self.id)
						}
						for (var i in thegamecore.players.others)
						{
							if (thegamecore.players.others.hasOwnProperty(i))
							{
								var p = thegamecore.players.others[i]
								if (parseInt(p.game_won)>0)
								{
									if (parseInt(p.game_won)>themax)
										themax = parseInt(p.game_won)
									won_players.push(p.id)
								}
								else
								{
									no_won_players.push(p.id)
								}
							}
						}
						themax++
						
						if (client.hosting)
						{
							thegamecore.players.self.game_won = themax
						}
						else
						{
							thegamecore.players.others[client.userid].game_won = themax
						}
						ret['won_pos']=themax
						
						ret['totplayersremaining']=(no_won_players.length-1)
	
						thegamecore.initOrder(client.game)
						thegamecore.current_turn=1
						
						ret['current_turn'] = thegamecore.player_order[thegamecore.current_turn]
						client.game.player_host.send('s.sem.'+JSON.stringify(ret))
						this.sendToAllClients('s.sem.'+JSON.stringify(ret),client)	
						//console.log('send s.sem.'+JSON.stringify(ret))
						break
						
					case 'sf':  // show final
						client.game.player_host.send('s.sf.')
						this.sendToAllClients('s.sf.',client)							
						break
						
					case 'mov':   // execute player move
						var ret = {}
						ret['player']=client.userid
						ret['data']=JSON.parse(commanddata)
						client.game.player_host.send('s.mov.'+JSON.stringify(ret))
						this.sendToAllClients('s.mov.'+JSON.stringify(ret),client)	
						//console.log('MOVE:'+JSON.stringify(ret))
						break
				}
			break;
		}
	};
