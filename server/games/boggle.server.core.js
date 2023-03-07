var boggle_server = module.exports = { handler : null }
var results = []

function inArray(needle, haystack) {
	var length = haystack.length;
	for(var i = 0; i < length; i++) {
		if(''+haystack[i] == ''+needle)
		{
			return true;
		}
	}
	return false;
}


boggle_server.handler  = function(client,message) {
		var commands = message.split('.');
		var command = commands[0];
		var subcommand = commands[1] || null;
		var commanddata = commands[2] || null;
		console.log('boggle got message:'+message);
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

							var logininfo = { id: client.userid, login_name:commanddata  }

							var logininfo_str = JSON.stringify(logininfo)
							client.game.player_host.send('s.l.'+logininfo_str)
							this.sendToAllClients('s.l.'+logininfo_str,client,true)
							client.send('s.l.'+logininfo_str)
							//client.send('s.gmi.'+logininfo)
							//console.log('sending to me: '+'s.l.'+logininfo_str)

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

								if (others[i].score==undefined){
									others[i].score = 0
									console.log('Criss:'+i)
								}
								tot[i] = others[i].score
								console.log('ONE '+i+' sc: '+others[i].score)
							}
						}
						tot[client.game.gamecore.players.self.id] =  hsc
						var tot_str = JSON.stringify(tot);
						//console.log('sending scores:'+tot_str)
						client.send('s.sc.'+tot_str)

						break;
					case 'cm':
						var thegame = client.game
						thegame.player_host.send('s.cm.'+commanddata)
						this.sendToAllClients('s.cm.'+commanddata,client)

						break
					case 'sg':    // start game

						var thegame = client.game
						var thegamecore = thegame.gamecore

    					thegamecore.wordsSubmitted = {}
    					thegamecore.wordsComputed = []
    					thegamecore.results = null
						if (client.hosting)
						{
							thegamecore.letters = client.game.gamecore.brasseCube()
							console.log('brasse:'+JSON.stringify(thegamecore.letters))
						}

						thegame.started = true;

						thegame.player_host.send('s.sg.')
						this.sendToAllClients('s.sg.',client)

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
							//thegamecore.current_turn = ''
							//thegamecore.player_order = { }

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

					case 'ggi' :  // get game info
						var thegamecore = client.game.gamecore

						var ret = {}
						ret['letters'] = thegamecore.letters
						ret['gameduration'] = thegamecore.gameduration
						ret['minletters'] = thegamecore.minletters
						//client.game.player_host.send('s.ggi.'+JSON.stringify(ret))
						//this.sendToAllClients('s.ggi.'+JSON.stringify(ret),client)
						console.log('Sending ggi:'+JSON.stringify(ret))
						client.send('s.ggi.'+JSON.stringify(ret))
						break

					case 'cls': // calculate solution
						console.log('Got cls')
						var tot = JSON.parse(commanddata)

						client.game.gamecore.gameduration = tot['gameduration']
						client.game.gamecore.minletters = parseInt(tot['minletters'])
						if (client.hosting) {
							console.log('HOST is solving')
							client.game.gamecore.solve(client.game.gamecore.letters,3)
							client.game.gamecore.getDefinitions(client);
							//console.log('RESULT:'+JSON.stringify(client.game.gamecore.wordsComputed))
							//console.log(results.length)
							//client.game.player_host.send('s.cls.'+JSON.stringify(client.game.gamecore.wordsComputed))
							//this.sendToAllClients('s.cls.'+JSON.stringify(client.game.gamecore.wordsComputed),client)
						}

						break
					case 'submit':
						var dat = JSON.parse(commanddata)
						//console.log('GOT SUBMIT:')
						//console.log(dat)
						var words = dat['words']
						//words = words.slice(0, -1)

						if (words.length!=0)
						{

							words = words.toLowerCase()
							words = words.replace("é", "e");
							words = words.replace("ê", "e");
							words = words.replace("è", "e");
							words = words.replace("ç", "c");
							words = words.replace("ô", "o");
							words = words.replace("û", "u");
							words = words.replace("î", "i");
							words = words.replace("ë", "e");
							words = words.replace("à", "a");
							words = words.replace("â", "a");

							//console.log('submited by: '+client.myprofile.login_name);
							//console.log('got submitted: '+words)
							var cleanWords = []
							var wspl =  words.split(',')
							for (var i = 0 ; i < wspl.length ; i++) {
								if (wspl[i]!='') {
									cleanWords.push(wspl[i])
								}
							}

							client.game.gamecore.wordsSubmitted[client.myprofile.id] = cleanWords

						} else {
							client.game.gamecore.wordsSubmitted[client.myprofile.id] = []
						}

						var c= 0;
						for(var p in client.game.gamecore.wordsSubmitted)
							if(client.game.gamecore.wordsSubmitted.hasOwnProperty(p))
								++c;


						var total_players = 0
						for (var pp in client.game.gamecore.players.others){
							if(client.game.gamecore.players.others.hasOwnProperty(pp))
								++total_players;
						}
						total_players+=1
						if (c==total_players) {
							client.game.gamecore.calcPointage(client)
							//console.log('MY RESULTS:')
							//console.log(client.game.gamecore.results)
							this.sendToAllClients('s.pointage.'+JSON.stringify(client.game.gamecore.results),client)
							client.game.player_host.send('s.pointage.'+JSON.stringify(client.game.gamecore.results))
							//console.log('WOW:')
							//console.log(ret)
						}
						break

					case 'getpointage':
						//client.game.gamecore.calcPointage()
						//this.sendToAllClients('s.pointages.'+JSON.stringify(ret),client)
						//console.log('Sending s.pointage:'+JSON.stringify(client.game.gamecore.results))

						if (client.game.gamecore.results){
							var r = {}
							r['solution'] = client.game.gamecore.results
							r['letters'] = client.game.gamecore.letters
							r['scores'] = client.game.gamecore.scores
							//console.log('sending scores:')
							//console.log(r)
							client.send('s.pointages.'+JSON.stringify(r))
						}
						break
				}
			break;
		}
	};
