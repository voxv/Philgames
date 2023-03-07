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

function to_word (chardict, prefix) {
    var w =[]

    for (var i = 0 ; i < prefix.length ; i++)
    {
        w.push(chardict[prefix[i][0]+','+prefix[i][1]])
    }
    return w.join('')
}


function find_words(graph, chardict, position, prefix, prefixes, words)
{
    var word = to_word(chardict, prefix).toLowerCase();
	if (prefixes[word]==undefined)
	{
		return false
	}

	if (words[word]!=undefined && !inArray(word,results))
	{
        results.push(word)
    }

	for (var i = 0 ; i < graph[position].length ; i++)
	{
        if(!inArray(graph[position][i], prefix))
        {
            var newprefix = prefix.slice(0);
            newprefix.push(graph[position][i])
            find_words(graph, chardict, graph[position][i][0]+','+graph[position][i][1], newprefix, prefixes, words);
        }
    }
}


function solve(a,minlets)
{
	var fsa = require('fs');
/*$boggle = "fxiea
           amlob
           ewbxe
           astuc";*/

/*$boggle = " tie
           amloe
          pebxepo
           oetre
            pia";*/

	var row1 = a['0']+a['1']+a['2']+a['3']+a['4']+"\n"
	var row2 = a['5']+a['6']+a['7']+a['8']+a['9']+"\n"
	var row3 = a['10']+a['11']+a['12']+a['13']+a['14']+"\n"
	var row4 = a['15']+a['16']+a['17']+a['18']+a['19']+"\n"
	var row5 = a['20']+a['21']+a['22']+a['23']+a['24']+"\n"
	var boggle = row1+row2+row3+row4+row5


	var rows = boggle.split("\n")

	rows.splice(rows.length-1,1)
	var alphabet = rows

	var dictionary = []

	var array = fsa.readFileSync('BoggleList.txt').toString().split("\n");
	for(i in array)
	{
		dictionary.push(array[i].toLowerCase());
	}



	prefixes = {}
	prefixes[''] = ''
	words = {}

	var al_joined = alphabet.join('')

	var regex = new RegExp('[' +al_joined+ ']{'+minlets+',}$', 'i')

	for (var i = 0 ; i < dictionary.length ; i++) {

	    var value = dictionary[i]

	   // if (!empty($rejected[$value])) continue;

	    var lengthv = value.length

	    var match = value.match(regex)
	    //console.log(value)
	    if (match)
	    {
			//console.log('match:'+match)
	        for(var x = 0; x < lengthv; x++) {
	            var letter = value.substring(0, x+1);
	            if(letter == value) {
	                prefixes[letter] = 1;
	                words[value] = 1;
	            } else {
	                prefixes[letter] = 1;
	            }
	        }


		}


	}




	var graph = {}
	var chardict = {}
	var positions = {}
	graph['None'] = []
	var c = rows.length
	for(var i = 0; i < c; i++) {
	    var l = rows[i].length
	    for(var j = 0; j < l; j++) {
	        chardict[i+','+j] = rows[i][j];
	        var children = []
	        var pos = [-1,0,1]
	        for (var k = 0 ; k < pos.length ; k++){
	            var xCoord = pos[k] + i;
	            if(xCoord < 0 || xCoord >= rows.length) {
	                continue;
	            }
	            var len = rows[0].length
	            for (var kk = 0 ; kk < pos.length ; kk++){
	                var yCoord = j + pos[kk]
	                if((yCoord < 0 || yCoord >= len) || (pos[kk] == 0 && pos[k] == 0)) {
	                    continue;
	                }
	                children.push([xCoord,yCoord])

	            }
	        }

	        graph['None'].push([i, j])
	        graph[i+','+j] = children
	    }
	}

	find_words(graph, chardict, 'None', [], prefixes,words);

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


						solve(client.game.gamecore.letters,3)
						//console.log('RESULT:'+JSON.stringify(results))
						//console.log(results.length)
						client.game.player_host.send('s.cls.'+JSON.stringify(results))
						this.sendToAllClients('s.cls.'+JSON.stringify(results),client)

						break
					case 'submit':
						var dat = JSON.parse(commanddata)
						console.log('GOT SUBMIT:')
						console.log(dat)
						var words = dat['words']
						words = words.slice(0, -1)

						if (words.length!=0)
						{
							words = words.toLowerCase()
							words = words.replace("é", "e");
							words2 = words.replace(/é/g, "e")
							console.log('ee disparu'+words2)
							words = words.replace("ê", "e");
							words = words.replace("è", "e");
							words = words.replace("ç", "e");
							words = words.replace("ô", "e");
							words = words.replace("û", "e");
							words = words.replace("î", "e");
							words = words.replace("ë", "e");
							words = words.replace("à", "e");
							words = words.replace("â", "e");

							console.log('got submitted: '+words)
							//console.log('result:');
							//console.log(results)
							//console.log('words:'+words)
						}
						break
				}
			break;
		}
	};
