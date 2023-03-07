var rummy_server = module.exports = { handler : null }



rummy_server.handler  = function(client,message) {
		var commands = message.split('.');
		var command = commands[0];
		var subcommand = commands[1] || null;
		var commanddata = commands[2] || null;
		console.log('Rummy got message:'+message);
		switch(command) {
			case 'c': //client message

				switch(subcommand) {
					case 'l' : // login

						if (client.hosting)
						{
							client.game.gamecore.players.self.login_name=commanddata
							client.game.gamecore.players.self.id = client.userid
							//client.game.gamecore.players.self.others = {}
							client.send('s.hid.'+client.userid)
							//console.log('sending s.hid.'+client.userid)
						}
						else
						{
							var logininfo = { id: client.userid, login_name:commanddata }

							var logininfo_str = JSON.stringify(logininfo)
							//console.log('sending s.l.'+logininfo_str+' to host')
							client.game.player_host.send('s.l.'+logininfo_str)
							this.sendToAllClients('s.l.'+logininfo_str,client,true)
							client.game.gamecore.addClient(client,commanddata)

							var tot = {}
							tot['host'] = { id: client.game.player_host.userid, login_name: client.game.gamecore.players.self.login_name }
							tot['clients'] = {}
							for (var i in client.game.player_clients)
							{
								if (client.game.player_clients.hasOwnProperty(i) && i!=client.userid)
								{
									var oneclient = client.game.player_clients[i]
									tot['clients'][oneclient.userid] = { id: oneclient.userid, login_name: client.game.gamecore.players.others[i]['login_name'] }
								}
							}
							var totstr = JSON.stringify(tot)
							//console.log('sending log multiple to myself:'+totstr)
							client.send('s.lm.'+totstr)    // logmultiple
							client.send('s.hid.'+client.userid)
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
						var tot = {}
						var hsc = client.game.gamecore.players.self.score
						tot =  { }
						var others = client.game.gamecore.players.others

						for (var i in others)
						{
							if (others.hasOwnProperty(i))
							{
								//console.log('OTHERS:'+i)
								if (others[i].score==undefined)
									others[i].score = 0
								tot[i] = others[i].score
							}
						}
						tot[client.game.gamecore.players.self.id] =  hsc
						var tot_str = JSON.stringify(tot);
						//console.log('sending s.sc.'+tot_str)
						client.send('s.sc.'+tot_str)

						break;

					case 'sg':    // start game

						var thegame = client.game
						var thegamecore = thegame.gamecore

						thegamecore.initOrder(thegame)
						thegamecore.deck.initDeckWithMaster()

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
							thegamecore.deck = null

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
					case 'gxc':   // give x cards to all
						var gc = client.game.gamecore
						var deck = gc.deck
						deck.giveToAll(commanddata)

						client.game.player_host.send('s.gxc.'+JSON.stringify(deck.hands))
						//console.log('sending s.gxc to host:'+JSON.stringify(deck.hands[client.game.player_host.userid]))
						for (var i in client.game.player_clients)
						{
							if (client.game.player_clients.hasOwnProperty(i))
							{
								client.game.player_clients[i].send('s.gxc.'+JSON.stringify(deck.hands))
								//console.log('sending s.gxc to client '+i+':'+JSON.stringify(deck.hands[client.game.player_clients[i].userid]))
							}
						}
						break;
					case 'gcpt':
						var ret = {}
						ret['pickedplayer']=client.userid
						ret['pickedcard']=commanddata

						var gc = client.game.gamecore
						var deck = gc.deck


						deck.removeFromTrashOrder();
						deck.addToHand(ret['pickedplayer'],ret['pickedcard']);
						deck.sendHands()
						deck.sendState()
						var thegame = client.game
						thegame.player_host.send('s.gcpt.'+JSON.stringify(ret))
						this.sendToAllClients('s.gcpt.'+JSON.stringify(ret),client)
						break
					case 'pot':  // put 1st card on trash
						var ret = client.game.gamecore.deck.transferOneOnTrash()
						var current_turn = client.game.gamecore.getPlayerTurn()
						var tot = {}
						tot['current_turn'] = current_turn
						tot['first_card'] = ret
						client.game.player_host.send('s.pot.'+JSON.stringify(tot))
						for (var i in client.game.player_clients)
						{
							if (client.game.player_clients.hasOwnProperty(i))
							{
								client.game.player_clients[i].send('s.pot.'+JSON.stringify(tot))

							}
						}
						client.game.gamecore.sendChangePlayerTurn()
						//console.log('sending s.pot.'+JSON.stringify(tot))
						break;
					//case 'gto':  // get trash order
					//	client.send('s.gto.'+JSON.stringify(client.game.gamecore.deck.trashOrder))
					//	break
					//case 'gh':   // get hands

					//	break;
					case 'trs':   // transfer
						var d = client.game.gamecore.deck
						var ret = d.transfer(0)
						client.game.player_host.send('s.trs.'+JSON.stringify(ret))
						for (var i in client.game.player_clients)
						{
							if (client.game.player_clients.hasOwnProperty(i))
							{
								client.game.player_clients[i].send('s.trs.'+JSON.stringify(ret))
							}
						}
						break
					case 'gcp':   // give a card to player
						//console.log('going in')
						var ret = {}
						var d = client.game.gamecore.deck
						ret['pickedplayer']=client.userid;
						ret['pickedcard']=commanddata;

						d.removeFromDeck();
						//d.addToHand(client.userid,ret['pickedcard']);
						
						d.addToHandOrdered(client.userid,ret['pickedcard']);
						d.sendHands()
						d.sendState()
						var thegame = client.game
						thegame.player_host.send('s.gcp.'+JSON.stringify(ret))
						this.sendToAllClients('s.gcp.'+JSON.stringify(ret),client)
						//console.log(JSON.stringify(d.state))
						break
					case 'gh':  // get hands
						client.game.gamecore.deck.sendHands()
						break
					case 'pont':  // play on trash
						var d = client.game.gamecore.deck
						var ret = {}
						ret['pickedplayer']=client.userid
						//console.log('GIVE A CARD:'+ret['pickedcard'])
						ret['pickedcard']=commanddata
						d.addToTrashOrder(ret['pickedcard']);

						d.removeFromHand(ret['pickedplayer'],ret['pickedcard']);
						this.current_turn++

						var thegame = client.game
						thegame.player_host.send('s.pont.'+JSON.stringify(ret))
						this.sendToAllClients('s.pont.'+JSON.stringify(ret),client)
						client.game.gamecore.sendChangePlayerTurn()
						//$tm->next();
						break
					case 'uh':   // update hand order
						var tot = JSON.parse(commanddata)
						var d = client.game.gamecore.deck
						d.hands[client.userid] = tot
						//console.log('updated hand to :'+JSON.stringify(d.hands))
						break
					case 'crg': // create group
						var d = client.game.gamecore.deck
						var tot = JSON.parse(commanddata)
						var ret = {}
						ret['player_played'] = client.userid
						ret['card_data'] = tot

						d.removeFromHand(client.userid,tot[0]);

						client.game.player_host.send('s.crg.'+JSON.stringify(ret))
						this.sendToAllClients('s.crg.'+JSON.stringify(ret),client)
						break

					case 'acg': // add card to group
						var d = client.game.gamecore.deck
						var tot = JSON.parse(commanddata)
						var ret = {}
						ret['player_played'] = client.userid
						ret['card_data'] = tot

						d.removeFromHand(client.userid,tot[0]);

						client.game.player_host.send('s.acg.'+JSON.stringify(ret))
						this.sendToAllClients('s.acg.'+JSON.stringify(ret),client)
						break

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
							//console.log(commanddata+' updated host score of '+client.game.gamecore.players.self.id+' : '+client.game.gamecore.players.self.score)
						}
						else
						{
							if (client.game.gamecore.players.others[client.userid].score==undefined)
								client.game.gamecore.players.others[client.userid].score=0
							//console.log('score before:'+client.game.gamecore.players.others[client.userid].score)
							client.game.gamecore.players.others[client.userid].score+=parseInt(commanddata)
							//console.log(commanddata+' updated client score of '+client.game.gamecore.players.others[client.userid].id+' : '+client.game.gamecore.players.others[client.userid].score)
						}
						break
				}
			break;
		}
	};
