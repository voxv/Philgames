var lobby_server = module.exports = { handler : null }

lobby_server.handler  = function(client,message) {

		var commands = message.split('.');
		var command = commands[0];
		var subcommand = commands[1] || null;
		var commanddata = commands[2] || null;
		console.log('Lobby got message:'+message);
		switch(command) {
			case 'c': //client message
				switch(subcommand) {
					case 'l' : // login
						client.myprofile.login_name=commanddata
						client.myprofile.tosave = {}
						console.log('\nclient '+ client.myprofile.id+' logged in with name:'+ client.myprofile.login_name );
						this.broadcastLobbyUpdates(client);
						break;
					case 'ggl': // get lobby info
						var ret = this.getAllRoomsDetails();
						client.send('s.ggl.'+ret);
						break;
					case 'cr' : // create game
						client.myprofile.currentGame=commanddata
						game_server.createGame(client);
						break;
					case 'crd' : // create debug game
						client.myprofile.currentGame=commanddata
						game_server.createGame(client,null,true);
						break;
					case 'dih':  // debug game , is host?
						var found = false;
						for (var i in this.games[commanddata]['games'])
						{
							if (this.games[commanddata]['games'].hasOwnProperty(i))
							{
								var g = this.games[commanddata]['games'][i];
								if (g.debug)
								{
									found = true;
									break;
								}
							}
						}
						client.send('s.dih.'+found);
						//console.log('sending: s.dih.'+found);
						break;
					case 'cg' : // clear games related to this client
						var thegame = client.game
						var isdebug = null;

						if (thegame && thegame.debug)
							isdebug = true;
						if (!thegame) return;
						var thehost = thegame.player_host

						var theclients = thegame.player_clients;
						if (client.hosting)
						{
							var first = null;
							var others = {};
							var count = 1;
							var first_id = -1
							for (var i in theclients)
							{
								if (theclients.hasOwnProperty(i))
								{
									var c = theclients[i];
									c.myprofile.currentGame=thegame.gamename;
									if (count==1)
									{
										first=c;   // pick client to become host
										first.hosting=true;
										first_id = i
									}
									else
										others[c.id] = c

									if (c)
									{
										var tot = {}
										tot['id_dc'] = client.userid
										tot['newhost'] = first_id
										c.send('s.e.'+JSON.stringify(tot));

									}
									count++;
								}
							}
							if (first && others)
								this.createGame(first,others,isdebug)
							client.hosting = false;
							
						}
						else
						{
							var tot = {}
							tot['id_dc'] = client.userid
							tot['newhost'] = thehost.userid
							thehost.send('s.e.'+JSON.stringify(tot));
							var others = {};
							for (var i in theclients)
							{
								if (theclients.hasOwnProperty(i))
								{
									var c = theclients[i]
									if (i==client.userid) continue;
									c.myprofile.currentGame=thegame.gamename;
									others[c.id] = c
									if (c) c.send('s.e.'+JSON.stringify(tot));
								}
							}

							if (thehost && others)
								this.createGame(thehost,others,isdebug)
						}
						this.game_count--;
						this.games[thegame.gamename].game_count--;
						//console.log('There are now ' + this.games[thegame.gamename].game_count +' '+thegame.gamename+ ' games' );
						delete this.games[thegame.gamename]['games'][thegame.id];
						delete client.game
						client.myprofile.tosave = {}
						this.broadcastLobbyUpdates(client);
						break;

					case 'jr' : // join request

						var info = commanddata.split('|||');
						var gamename = info[0];
						var gameid = info[1];

						var maxplayers = this.games[gamename].max_players;

						if (this.joinlocks[gameid])
						{
							theclient.send('s.jrj.');  // join rejected
							return;
						}
						if (gameid=='debug')
						{
							for (var i in this.games[gamename]['games'])
							{
								if (this.games[gamename]['games'].hasOwnProperty(i))
								{
									var c = this.games[gamename]['games'][i];
									if (c.debug)
									{
										gameid = c.id;
									}
								}
							}
							if (gameid=='debug')
							{
								theclient.send('s.jrj.');  // join rejected
								return;
							}
						}
						var thegame = this.games[gamename]['games'][gameid]
						if (thegame.player_count==(maxplayers-1))
						{
							this.joinlocks[gameid]=true
						}
						
						game_server.joinGame(this.games[gamename]['games'][gameid],client);

						break;

					case 'cfg': // confirm a game

						var cc = commanddata.split('|||');
						//console.log(commanddata)
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
							//console.log('sending fuck:'+ret);
						}
						break;
				}
			break;
		}
    };