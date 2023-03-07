var yum_server = module.exports = { handler : null }

yum_server.handler  = function(client,message) {
		var commands = message.split('.');
		var command = commands[0];
		var subcommand = commands[1] || null;
		var commanddata = commands[2] || null;
		console.log('Yum got message:'+message);
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

							thegamecore.players_ended = []
							thegamecore.current_turn = 'host'
							//this.scorecard_host = {1:10,0:5,2:15,3:20,4:25,5:25,6:6,7:7,8:8,9:9,10:10,11:11,12:12}
							//this.scorecard_other = {1:10,0:5,2:15,3:20,4:25,5:30,6:6,7:7,8:8,9:9,10:10,11:11,12:12}
							thegamecore.scorecard_host = {}
    						thegamecore.scorecard_other = {}
							thegamecore.scorecard_host_count = 0
							thegamecore.scorecard_other_count = 0
							thegamecore.host_has_bonus = false;
							thegamecore.other_has_bonus = false

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

					case 'pdc':   // put dice in cup

						if (client.hosting)
						{
							this.sendToAllClients('s.pdc.'+commanddata,client)
						}
						else
						{
							client.game.player_host.send('s.pdc.'+commanddata)
						}
						break;
					case 'td':  // throw dice
						if (client.hosting)
						{
							this.sendToAllClients('s.td.'+commanddata,client)
						}
						else
						{
							client.game.player_host.send('s.td.'+commanddata)
						}

						break;
					case 'tb':  // throw dice anim completed, notify initiater
						if (client.hosting)
						{
							this.sendToAllClients('s.tb.',client)
						}
						else
						{
							client.game.player_host.send('s.tb.')
						}
						break;
					case 'et':  // end turn
						var vv = JSON.parse(commanddata)
						var score = vv['cellscore']
						var rowId = score[0];
						var rowScore = score[1];
						var thegamecore = client.game.gamecore
						if (client.hosting)
						{
							thegamecore.scorecard_host[rowId] = rowScore
							thegamecore.scorecard_host_count++
						}
						else
						{
							thegamecore.scorecard_other[rowId] = rowScore
							thegamecore.scorecard_other_count++
						}

						if (thegamecore.current_turn == 'host')
							thegamecore.current_turn = 'other'
						else
							thegamecore.current_turn = 'host'

						var scorecards = { 'host':thegamecore.scorecard_host , 'other':thegamecore.scorecard_other }

						var isended = false
						if (thegamecore.scorecard_other_count==12 && thegamecore.scorecard_host_count==12)
							isended = true

						var tot = { 'scorecards':scorecards, 'current_turn':thegamecore.current_turn, 'isended':isended }



						var totret = JSON.stringify(tot)
						this.sendToAllClients('s.et.'+totret,client)
						client.game.player_host.send('s.et.'+totret)
						//console.log('sending: s.et.'+totret)
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
						}
						break;
					case 'gb':  // get bonuses

						var thegamecore = client.game.gamecore
						var sch = thegamecore.scorecard_host
						var tothost = 0;
						for (var i in sch)
						{
							if (sch.hasOwnProperty(i))
							{
								if (parseInt(i)>5) break;
								tothost+=parseInt(sch[i])
							}
						}
						if (tothost!=0)
							client.game.gamecore.host_has_bonus = true;

						var totother = 0;
						var sco = thegamecore.scorecard_other
						for (var i in sco)
						{
							if (sco.hasOwnProperty(i))
							{
								if (parseInt(i)>5) break;
								totother+=parseInt(sco[i])
							}
						}

						if (totother!=0)
							client.game.gamecore.other_has_bonus = true;

						var tot = {'host':tothost,'other':totother }
						client.game.player_host.send('s.gb.'+JSON.stringify(tot))
						this.sendToAllClients('s.gb.'+JSON.stringify(tot),client)
						break;
					case 'gus':  // get upper scores

						var thegamecore = client.game.gamecore
						var sch = thegamecore.scorecard_host
						var tothost = 0;

						for (var i in sch)
						{
							if (sch.hasOwnProperty(i))
							{
								if (parseInt(i)>5) break;
								tothost+=parseInt(sch[i])
							}
						}
						if (thegamecore.host_has_bonus)
							tothost+=25

						var totother = 0;
						var sco = thegamecore.scorecard_other
						for (var i in sco)
						{
							if (sco.hasOwnProperty(i))
							{
								if (parseInt(i)>5) break;
								totother+=parseInt(sco[i])
							}
						}
						if (thegamecore.other_has_bonus)
							totother+=25

						var tot = {'host':tothost,'other':totother }
						client.game.player_host.send('s.gus.'+JSON.stringify(tot))
						this.sendToAllClients('s.gus.'+JSON.stringify(tot),client)
						break;

					case 'gt':  // get total scores

						var thegamecore = client.game.gamecore
						var sch = thegamecore.scorecard_host
						var tothost = 0;

						for (var i in sch)
						{
							if (sch.hasOwnProperty(i))
							{
								if (parseInt(i)==6) continue
								if (parseInt(i)==7) continue
								if (parseInt(i)==14) continue

								tothost+=parseInt(sch[i])
							}
						}
						if (thegamecore.host_has_bonus)
							tothost+=25

						var totother = 0;
						var sco = thegamecore.scorecard_other
						for (var i in sco)
						{
							if (sco.hasOwnProperty(i))
							{
								if (parseInt(i)==6) continue
								if (parseInt(i)==7) continue
								if (parseInt(i)==14) continue
								totother+=parseInt(sco[i])
							}
						}
						if (thegamecore.other_has_bonus)
							totother+=25

						if (client.hosting)
						{
							if (tothost>totother)
							{
								thegamecore.players.self.score++
								thegamecore.last_won='host'
							}
							else if (totother>tothost)
							{
								thegamecore.players.other.score++
								thegamecore.last_won='other'
							}
						}

						var tot = {'host':tothost,'other':totother }
						client.send('s.gt.'+JSON.stringify(tot))

						break;
					case 'ssh':
						if (client.hosting)
						{
							this.sendToAllClients('s.ssh.',client)   // start shake
						}
						else
						{
							client.game.player_host.send('s.ssh.')
						}
						break;
					case 'esh':
						if (client.hosting)
						{
							this.sendToAllClients('s.esh.',client)   // end shake
						}
						else
						{
							client.game.player_host.send('s.esh.')
						}
						break;
				}
			break;
		}
	};