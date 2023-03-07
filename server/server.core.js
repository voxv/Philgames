var game_player = function( game_instance, player_instance ) {

    this.instance = player_instance;
    this.game = game_instance;
    this.id = '';
    this.login_name = '';
    this.host=false;
    this.score=0;
};

////////////    RUBIK   //////////////////////

var game_core_rubik = function(game_instance){

    this.instance = game_instance;
	var hostplayer = this.instance.player_host

    this.players = {
        self : new game_player(this,hostplayer),
        others : {},
        other : null
    };
    this.haswinner = false;
    this.players_ended = []
    this.players_started = []

};

game_core_rubik.prototype.addClient = function(client,username)
{
	var oldscore = 0;
	if (this.players.other && this.players.other.score!=undefined)
		oldscore = this.players.other.score

	var thegame = client.game
	//var m = game_server.games[thegame.gamename]['max_players']

	this.players.others[client.userid] =  new game_player(this,client)
	this.players.others[client.userid].login_name=username;
	this.players.others[client.userid].id=client.userid;

	this.players.other = this.players.others[client.userid];
	this.players.other.score = oldscore;
}

if( 'undefined' != typeof global ) {
    module.exports = global.game_core_rubik = game_core_rubik;
}


////////////    BATTLESHIP   //////////////////////

var game_core_battleship = function(game_instance){

    this.instance = game_instance;
	var hostplayer = this.instance.player_host

    this.players = {
        self : new game_player(this,hostplayer),
        others : {},
        other : null,
    };

    this.host_ships = {}
    this.client_ships = {}
    this.host_ships_count = 0
    this.client_ships_count = 0
    this.current_turn = 'host'
    this.players_ended = []
};

game_core_battleship.prototype.addClient = function(client,username)
{
	var oldscore = 0;
	if (this.players.other && this.players.other.score!=undefined)
		oldscore = this.players.other.score

	var thegame = client.game
	//var m = game_server.games[thegame.gamename]['max_players']

	this.players.others[client.userid] =  new game_player(this,client)
	this.players.others[client.userid].login_name=username;
	this.players.others[client.userid].id=client.userid;

	this.players.other = this.players.others[client.userid];
	this.players.other.score = oldscore;
}

if( 'undefined' != typeof global ) {
    module.exports = global.game_core_battleship = game_core_battleship;
}

////////////    YUM   //////////////////////

var game_core_yum = function(game_instance){

    this.instance = game_instance;
	var hostplayer = this.instance.player_host

    this.players = {
        self : new game_player(this,hostplayer),
        others : {},
        other : null,
    };

    this.current_turn = 'host'
    this.players_ended = []
    //this.scorecard_host = {1:10,0:5,2:15,3:20,4:25,5:25,6:6,7:7,8:8,9:9,10:10,11:11,12:12}
    //this.scorecard_other = {1:10,0:5,2:15,3:20,4:25,5:30,6:6,7:7,8:8,9:9,10:10,11:11,12:12}
    this.scorecard_host = {}
    this.scorecard_other = {}
    this.scorecard_host_count = 0
    this.scorecard_other_count = 0
    this.host_has_bonus = false;
    this.other_has_bonus = false
    this.last_won = ''

};

game_core_yum.prototype.addClient = function(client,username)
{
	var oldscore = 0;
	if (this.players.other && this.players.other.score!=undefined)
		oldscore = this.players.other.score

	var thegame = client.game
	//var m = game_server.games[thegame.gamename]['max_players']

	this.players.others[client.userid] =  new game_player(this,client)
	this.players.others[client.userid].login_name=username;
	this.players.others[client.userid].id=client.userid;

	this.players.other = this.players.others[client.userid];
	this.players.other.score = oldscore;
}

if( 'undefined' != typeof global ) {
    module.exports = global.game_core_yum = game_core_yum;
}

////////////    MASTERMIND   //////////////////////

var game_core_mastermind = function(game_instance){

    this.instance = game_instance;
	var hostplayer = this.instance.player_host

    this.players = {
        self : new game_player(this,hostplayer),
        others : {},
        other : null,
    };

    this.current_turn = 'host'
    this.players_ended = []
	this.current_master = 'host'
    this.last_won = ''
    this.solution = {}
    this.current_row ={}

};

game_core_mastermind.prototype.addClient = function(client,username)
{
	var oldscore = 0;
	if (this.players.other && this.players.other.score!=undefined)
		oldscore = this.players.other.score

	var thegame = client.game
	//var m = game_server.games[thegame.gamename]['max_players']

	this.players.others[client.userid] =  new game_player(this,client)
	this.players.others[client.userid].login_name=username;
	this.players.others[client.userid].id=client.userid;

	this.players.other = this.players.others[client.userid];
	this.players.other.score = oldscore;
}

if( 'undefined' != typeof global ) {
    module.exports = global.game_core_mastermind = game_core_mastermind;
}


////////////    RUMMY   //////////////////////

var game_core_rummy = function(game_instance){

    this.instance = game_instance;
	var hostplayer = this.instance.player_host

    this.players = {
        self : new game_player(this,hostplayer),
        others : {}
    };

    this.current_turn = 1
    this.players_ended = []
	this.player_order = { }
	this.deck = null


};

game_core_rummy.prototype.addClient = function(client,username)
{
	var thegame = client.game
	if (this.players.others[client.userid]==undefined)
	{
		this.players.others[client.userid] =  new game_player(this,client)
	}
	this.players.others[client.userid].login_name=username;
	this.players.others[client.userid].id=client.userid;


}
game_core_rummy.prototype.getPlayerTurn = function()
{
	return this.player_order[this.current_turn]
}

game_core_rummy.prototype.sendChangePlayerTurn = function()
{
	var themax = 0;
	for (var i in this.player_order)
	{
		if (this.player_order.hasOwnProperty(i))
		{
			if (i>themax)
				themax = parseInt(i)
		}
	}
	themax++
	this.current_turn++
	this.current_turn = (this.current_turn%themax)
	if (this.current_turn==0) this.current_turn=1
	this.deck.sendToAll('s.ct.'+this.player_order[this.current_turn])
}
game_core_rummy.prototype.initOrder = function(thegame)
{
	var h = thegame.player_host.userid
	var c = thegame.player_clients
	var tot = { }
	tot[1] = h
	var count = 2
	for (var i in c)
	{
		if (c.hasOwnProperty(i))
		{
			tot[count++] = c[i].userid
		}
	}
	this.player_order = tot
	this.deck = new deck(this.player_order, thegame)
	//console.log('deck:'+JSON.stringify(this.player_order))

}

if( 'undefined' != typeof global ) {
    module.exports = global.game_core_rummy = game_core_rummy;
}



var card = function( id, type, color, number)
{
	this.id = id
	this.type = type
	this.color = color
	this.number = number

}



var deck  = function( players, game )
{
	this.card_data = [{"id":"1","number":"1","type":"t"}, {"id":"2","number":"1","type":"p"}, {"id":"3","number":"1","type":"c"}, {"id":"4","number":"1","type":"ca"}, {"id":"5","number":"13","type":"t"}, {"id":"6","number":"13","type":"p"}, {"id":"7","number":"13","type":"c"}, {"id":"8","number":"13","type":"ca"}, {"id":"9","number":"12","type":"t"}, {"id":"10","number":"12","type":"p"}, {"id":"11","number":"12","type":"c"}, {"id":"12","number":"12","type":"ca"}, {"id":"13","number":"11","type":"t"}, {"id":"14","number":"11","type":"p"}, {"id":"15","number":"11","type":"c"}, {"id":"16","number":"11","type":"ca"}, {"id":"17","number":"10","type":"t"}, {"id":"18","number":"10","type":"p"}, {"id":"19","number":"10","type":"c"}, {"id":"20","number":"10","type":"ca"}, {"id":"21","number":"9","type":"t"}, {"id":"22","number":"9","type":"p"}, {"id":"23","number":"9","type":"c"}, {"id":"24","number":"9","type":"ca"}, {"id":"25","number":"8","type":"t"}, {"id":"26","number":"8","type":"p"}, {"id":"27","number":"8","type":"c"}, {"id":"28","number":"8","type":"ca"}, {"id":"29","number":"7","type":"t"}, {"id":"30","number":"7","type":"p"}, {"id":"31","number":"7","type":"c"}, {"id":"32","number":"7","type":"ca"}, {"id":"33","number":"6","type":"t"}, {"id":"34","number":"6","type":"p"}, {"id":"35","number":"6","type":"c"}, {"id":"36","number":"6","type":"ca"}, {"id":"37","number":"5","type":"t"}, {"id":"38","number":"5","type":"p"}, {"id":"39","number":"5","type":"c"}, {"id":"40","number":"5","type":"ca"}, {"id":"41","number":"4","type":"t"}, {"id":"42","number":"4","type":"p"}, {"id":"43","number":"4","type":"c"}, {"id":"44","number":"4","type":"ca"}, {"id":"45","number":"3","type":"t"}, {"id":"46","number":"3","type":"p"}, {"id":"47","number":"3","type":"c"}, {"id":"48","number":"3","type":"ca"}, {"id":"49","number":"2","type":"t"}, {"id":"50","number":"2","type":"p"}, {"id":"51","number":"2","type":"c"}, {"id":"52","number":"2","type":"ca"}]
	this.card_data_byid = {}
	this.state = []
	this.trashOrder = []
	this.masterDeck = {}
	this.hands = {}
	this.players = players
	this.buildMasterDeck()
	this.thegame = game
}

deck.prototype.sendToAll = function(msg)
{
	this.thegame.player_host.send(msg)
	var allclients = this.thegame.player_clients
	for (var i in allclients)
	{
		if (allclients.hasOwnProperty(i))
		{
			allclients[i].send(msg)
		}
	}
}

deck.prototype.getInfoFromCardId = function(id)
{
	for (var i = 0 ; i < this.card_data.length ; i++)
	{
		if (this.card_data[i].id == id)
			return this.card_data[i]
	}
}
deck.prototype.initDeckWithMaster = function()
{
	this.hands = {}
	this.trashOrder = []
	this.state = []
	this.shuffleDeck();

	//console.log('2------------------------'+JSON.stringify(this.masterDeck))


	for (var i in this.masterDeck)
	{
		if (this.masterDeck.hasOwnProperty(i))
		{
			this.state.push(this.masterDeck[i])
		}
	}
	for (var i in this.masterDeck)
	{
		if (this.masterDeck.hasOwnProperty(i))
		{
			if (this.masterDeck[i]['id']==25)
			{
				this.state.push(this.masterDeck[i])
			}
		}
	}
	//console.log('3------------------------'+JSON.stringify(this.state))
}
deck.prototype.giveToAll = function(num)
{
	var count = 0;
	for (var i in this.players)
	{
		if (this.players.hasOwnProperty(i))
		{
			count++
		}
	}
	//console.log('GIVE TO ALL:'+count)
	for (var i in this.players)
	{
		if (this.players.hasOwnProperty(i))
		{
			for (var j = 0 ; j < num ; j++)
			{
				this.removeOneFromTopDeck(this.players[i])
			}
		}
	}
	this.sendHands()
	this.sendState()
}
deck.prototype.totalCardsInDeck = function()
{
	return this.state.length
}

deck.prototype.removeFromDeck = function()
{
	return this.state.pop()
}

deck.prototype.removeOneFromTopDeck = function(player_id)
{
	var c = this.removeFromDeck()
	//console.log('removing :'+c.id)
	this.addToHand(player_id,c.id);
	return c.id;
}
deck.prototype.peekTop = function()
{
	if (this.state.length==0) return -1
	return this.state[this.state.length-1]
}
deck.prototype.sendState = function()
{
	var totalcardsindeck = this.totalCardsInDeck()
	var topcard = this.peekTop()
	var tot = {}
	tot['totalcardsindeck'] = totalcardsindeck

	tot['topcard'] = -1
	if (topcard.id && topcard.id!=undefined)
		tot['topcard'] = topcard.id
	this.sendToAll('s.gds.'+JSON.stringify(tot))    // get deck state
	//console.log('sending Deck State:'+JSON.stringify(tot))

}

deck.prototype.addToHand = function(player_id,card_id)
{
	if (this.hands[player_id]==undefined)
		this.hands[player_id] = []
	//console.log('Adding to hand:'+card_id)
	if (!inArray(this.hands[player_id],card_id))
		this.hands[player_id].push(card_id)
}

deck.prototype.addToHandOrdered = function(player_id,card_id)
{
	if (this.hands[player_id]==undefined)
		this.hands[player_id] = []


	var h = this.hands[player_id]
	//console.log('hand before:'+JSON.stringify(this.hands[player_id]))
	//console.log('insertcard_number:'+this.card_data_byid[card_id]['number'])
	var insertcard_number = parseInt(this.card_data_byid[card_id]['number'])
	var insertcard_color = this.card_data_byid[card_id]['color']
	var insertcard_type = this.card_data_byid[card_id]['type']
	var inserted = false
	var totinhand = h.length
	var temp_hand = []

	// 1st pass (find number and color ==)
	for (var i = 0 ; i < totinhand ; i++)
	{
		if (inserted)
		{
			temp_hand.push(h[i])
			continue
		}
		var thecard = this.card_data_byid[h[i]]
		var thecardnumber = parseInt(thecard.number)
		var thecardcolor = thecard.color
		if (thecardnumber==insertcard_number && thecardcolor==insertcard_color)
		{
			temp_hand.push(card_id)
			temp_hand.push(h[i])
			inserted = true
			//console.log('found pass 1')
			continue
		}
		else
		{
			temp_hand.push(h[i])
		}
	}

	if (inserted)
	{
		this.hands[player_id]=temp_hand
		return
	}

	// 2nd pass (find > same type)

	temp_hand = []

	for (var i = 0 ; i < totinhand ; i++)
	{
		if (inserted)
		{
			temp_hand.push(h[i])
			continue
		}

		if ((i+1)==totinhand)
		{
			temp_hand.push(h[i])
			temp_hand.push(card_id)
			//inserted = true
			continue
		}
		var thenextcard = this.card_data_byid[h[(i+1)]]
		var thenextcardnumber = parseInt(thenextcard.number)
		var nextcardcolor = thenextcard.color
		if (thenextcardnumber==(insertcard_number+1) && nextcardcolor==insertcard_color)
		{
			temp_hand.push(h[i])
			temp_hand.push(card_id)
			inserted = true
			//console.log('found pass 2')
			continue
		}
		else
		{
			temp_hand.push(h[i])
		}
	}

	if (inserted)
	{
		this.hands[player_id]=temp_hand
		return
	}

	// 3nd pass (find < same type)

	temp_hand = []

	for (var i = 0 ; i < totinhand ; i++)
	{
		if (inserted)
		{
			temp_hand.push(h[i])
			continue
		}

		var thecard = this.card_data_byid[h[i]]
		var thecardnumber = parseInt(thecard.number)
		var thecardcolor = thecard.color
		if ((thecardnumber+1) == insertcard_number  && thecardcolor==insertcard_color)
		{
			temp_hand.push(h[i])
			temp_hand.push(card_id)
			inserted = true
			//console.log('found pass 3')
			continue
		}
		else
		{
			temp_hand.push(h[i])
		}
	}

	if (inserted)
	{
		this.hands[player_id]=temp_hand
		return
	}

	// pass 3.5 (same color)

	temp_hand = []

	for (var i = 0 ; i < totinhand ; i++)
	{
		if (inserted)
		{
			temp_hand.push(h[i])
			continue
		}
		var thecard = this.card_data_byid[h[i]]
		var thecardnumber = parseInt(thecard.number)
		var thecardcolor = thecard.color
		if (thecardcolor==insertcard_color)
		{
			temp_hand.push(card_id)
			temp_hand.push(h[i])
			inserted = true
			//console.log('found pass 3.5')
			continue
		}
		else
		{
			temp_hand.push(h[i])
		}
	}

	if (inserted)
	{
		this.hands[player_id]=temp_hand
		return
	}


	// 4nd pass (find >)

	temp_hand = []

	var themin = 9999
	for (var i = 0 ; i < totinhand ; i++)
	{
		if ((i+1)==totinhand) continue
		var thenextcard = this.card_data_byid[h[(i+1)]]
		var thenextcardnumber = parseInt(thenextcard.number)

		if (thenextcardnumber<themin && thenextcardnumber>insertcard_number)
		{
			themin = i
		}
	}

	for (var i = 0 ; i < totinhand ; i++)
	{
		if (inserted)
		{
			temp_hand.push(h[i])
			continue
		}

		if ((i+1)==totinhand)
		{
			temp_hand.push(h[i])
			temp_hand.push(card_id)
			//inserted = true
			continue
		}

		var thenextcard = this.card_data_byid[h[(i+1)]]
		var thenextcardnumber = parseInt(thenextcard.number)

		if (themin != 9999)
		{
			if (i==themin)
			{

				temp_hand.push(h[i])
				temp_hand.push(card_id)
				//console.log('found pass 4')
				inserted = true
				continue
			}
			else
			{
				temp_hand.push(h[i])
			}
		}
		else
		{

		}
	}

	if (inserted)
	{
		this.hands[player_id]=temp_hand
		return
	}

	// 5nd pass (find <)

	temp_hand = []

	var themax = -1
	for (var i = 0 ; i < totinhand ; i++)
	{
		var thecardnumber = parseInt(this.card_data_byid[h[i]].number)
		if (thecardnumber>themax && thecardnumber<insertcard_number)
		{
			themax = i
		}
	}
	for (var i = 0 ; i < totinhand ; i++)
	{
		if (inserted)
		{
			temp_hand.push(h[i])
			continue
		}

		var thecard = this.card_data_byid[h[i]]
		var thecardnumber = parseInt(thecard.number)

		if (themax>=0)
		{
			if (i==themax)
			{
				temp_hand.push(h[i])
				temp_hand.push(card_id)
				inserted = true
				//console.log('found pass 5 1')
				continue
			}
			else
			{
				temp_hand.push(h[i])
			}
		}
		else
		{
			if (i==0)
			{
				temp_hand.push(card_id)
				temp_hand.push(h[i])
				inserted = true
				//console.log('found pass 2')
				continue
			}
		}
	}

	if (inserted)
	{
		this.hands[player_id]=temp_hand
		return
	}




}

deck.prototype.addToHandOrdered2 = function(player_id,card_id)
{
	if (this.hands[player_id]==undefined)
		this.hands[player_id] = []
	//console.log('Adding to hand:'+card_id)

	var h = this.hands[player_id]
	//console.log('hand before:'+JSON.stringify(this.hands[player_id]))
	//console.log('before number:'+this.card_data_byid[card_id]['number'])
	var insertcard_number = this.card_data_byid[card_id]['number']
	var inserted = false
	var totinhand = h.length
	var temp_hand = []
	for (var i = 0 ; i < totinhand ; i++)
	{
		if (i==0)
		{
			var thecard = this.card_data_byid[h[i]]
			var thecardnumber = thecard.number
			if (parseInt(insertcard_number)==parseInt(thecardnumber))
			{
				//console.log('1st ('+thecardnumber+') == inserted ('+insertcard_number+')')
				temp_hand.push(card_id)
				temp_hand.push(h[i])
				inserted = true
				continue
			}
			if (parseInt(insertcard_number)<parseInt(thecardnumber))
			{
				//console.log('1st ('+thecardnumber+') > inserted ('+insertcard_number+')')
				temp_hand.push(card_id)
				temp_hand.push(h[i])
				inserted = true
				continue
			}
		}
		if ((i+1)==totinhand)
		{
			if (!inserted)
			{
				//console.log('insert last')
				temp_hand.push(h[i])
				temp_hand.push(card_id)
				inserted = true
			}
			else
			{
				temp_hand.push(h[i])
			}
			continue
		}
		//var thecard = this.card_data_byid[h[i]]
		var nextcard = this.card_data_byid[h[(i+1)]]

		//if (!inserted) console.log('next card:'+h[(i+1)]+' number:'+parseInt(nextcard['number']))

		if (!inserted && parseInt(nextcard['number'])==parseInt(insertcard_number))
		{
			temp_hand.push(h[i])
			temp_hand.push(card_id)
			inserted = true
			continue
		}
		if (!inserted && parseInt(nextcard['number'])>parseInt(insertcard_number))
		{
			temp_hand.push(h[i])
			temp_hand.push(card_id)
			inserted = true
			continue
		}

		temp_hand.push(h[i])
	}
	this.hands[player_id]=temp_hand
	//console.log('hand after:'+JSON.stringify(this.hands[player_id]))
}

deck.prototype.removeFromHand = function(player_id,card_id)
{
	var index = this.hands[player_id].indexOf(card_id)
	if (index==-1) return
	this.hands[player_id].splice(index, 1);
	//console.log('removing from hand:'+card_id)
}

deck.prototype.getHands = function()
{
	return this.hands;
}

deck.prototype.sendTrashOrder = function()
{
	this.sendToAll('s.gto.'+JSON.stringify(this.trashOrder))    // get trash order
	//console.log('sending s.gto.'+JSON.stringify(this.trashOrder))
}
deck.prototype.sendHands = function()
{
	this.sendToAll('s.gh.'+JSON.stringify(this.hands))    // get trash order
	//console.log('sending hands s.sh.'+JSON.stringify(this.hands))
}
deck.prototype.transferOneOnTrash = function()
{
	var r = this.removeFromDeck();
	var rid = r.id
	this.addToTrashOrder(rid);
	this.sendState()
	return rid;
}

deck.prototype.transfer = function(skip)
{
	if (!this.trashOrder.length) return;

	//console.log('----Before trnasfer TrashOrder:'+JSON.stringify(this.trashOrder))

	this.state = []

	var count = 0
	var ret = []
	for (var i = (this.trashOrder.length-1) ; i >=0 ; i--)
	{
		this.state.push(this.card_data_byid[this.trashOrder[i]])
		ret.push(this.card_data_byid[this.trashOrder[i]].id)
	}


	this.sendState()

	this.trashOrder = []
	this.sendTrashOrder()

	//console.log('----After trnasfer State:'+JSON.stringify(this.state))
	return ret;

}

deck.prototype.addToTrashOrder = function(id)
{
	this.trashOrder.push(id)
	this.sendTrashOrder()
}

deck.prototype.removeFromTrashOrder = function()
{
	this.trashOrder.pop()
	this.sendTrashOrder()
}

deck.prototype.shuffleDeck = function()
{
	this.masterDeck = this.shufflehelper(this.masterDeck);
}

deck.prototype.shufflehelper = function(array)
{
	var keys = []

	for (var k in array) {
	  if (array.hasOwnProperty(k)) {
		keys.push(k);
	  }
	}

    shuffle(keys);

    var newa = {}
	for (var i = 0 ; i < keys.length ; i ++)
	{
		newa[keys[i]] = array[(i+1)];

	}
    return newa;
}

deck.prototype.buildMasterDeck = function()
{
	for (var i in this.masterDeck)
	{
		if (this.masterDeck.hasOwnProperty(i))
		{
			this.card_data_byid[this.masterDeck[i].id] = this.masterDeck[i]
		}
	}
	for (var i = 0 ; i < this.card_data.length ; i++)
	{
		this.masterDeck[this.card_data[i].id] = new card(this.card_data[i].id,this.card_data[i].type,this.card_data[i].number);
		this.card_data_byid[this.card_data[i].id] = this.card_data[i]
	}
}

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function array_keys(input) {
	var ret = []
	for (var i in input)
	{
		if (input.hasOwnProperty(i))
		{
			ret.push(i)
		}
	}
	return ret

}


//////////// TROUBLE   //////////////////////

var game_core_trouble = function(game_instance){

    this.instance = game_instance;
	var hostplayer = this.instance.player_host

	var ph = new game_player(this,hostplayer)
	ph.color = 0
	ph.pre_played = 0
	ph.pre_elimine = 0
	ph.game_won = 0

	var tosave = hostplayer.myprofile.tosave
	for (var i in tosave)
	{
		if (tosave.hasOwnProperty(i))
		{
			ph.color = tosave[i]
		}
	}
	hostplayer.myprofile.tosave = {}

	hostplayer.myprofile.tosave = { 'color': ph.color }

    this.players = {
        self : ph,
        others : {}
    };

    this.current_turn = 1
    this.players_ended = []
	this.player_order = { }
    this.has_winning = 0
    this.is_pre = 1
};

game_core_trouble.prototype.addClient = function(client,username)
{
	var thegame = client.game
	if (this.players.others[client.userid]==undefined)
	{
		this.players.others[client.userid] =  new game_player(this,client)
	}
	this.players.others[client.userid].login_name=username;
	this.players.others[client.userid].id=client.userid;
	this.players.others[client.userid].score = 0

	var available = 0
	var current_cols = []
	var hostcol = this.players.self.color
	current_cols.push(hostcol)

	for (var i in this.players.others)
	{
		if (this.players.others.hasOwnProperty(i) && this.players.others[i].color!=undefined)
		{

			current_cols.push(parseInt(this.players.others[i].color))
		}
	}
	var count = 0

	for (var i = 0 ; i < current_cols.length ; i++)
	{

		if (inArray(count,current_cols))
		{
			count++
			continue
		}
		else break
	}


	this.players.others[client.userid].color = count
	this.players.others[client.userid].pre_played = 0
	this.players.others[client.userid].pre_elimine = 0
	this.players.others[client.userid].game_won = 0

	var tosave = client.myprofile.tosave
	for (var i in tosave)
	{
		if (tosave.hasOwnProperty(i))
		{
			this.players.others[client.userid].color = tosave[i]

		}
	}
	client.myprofile.tosave = {}



	client.myprofile.tosave = { 'color': this.players.others[client.userid].color }

	this.updatePlayerInfo(client)
}

game_core_trouble.prototype.updatePlayerInfo = function(client)
{
	var tot = {}
	tot['id'] = client.userid

	if (client.hosting)
	{
		tot['color'] = client.game.gamecore.players.self.color
		tot['pre_played'] = client.game.gamecore.players.self.pre_played
		tot['pre_elimine'] = client.game.gamecore.players.self.pre_elimine
		tot['game_won'] = client.game.gamecore.players.self.game_won
		tot['login_name'] = client.game.gamecore.players.self.login_name
	}
	else
	{

		tot['color'] = client.game.gamecore.players.others[client.userid].color
		tot['pre_played'] = client.game.gamecore.players.others[client.userid].pre_played
		tot['pre_elimine'] = client.game.gamecore.players.others[client.userid].pre_elimine
		tot['game_won'] = client.game.gamecore.players.others[client.userid].game_won
		tot['login_name'] = client.game.gamecore.players.others[client.userid].login_name
	}
	this.sendToAll('s.upi.'+JSON.stringify(tot),client)
	//console.log('s.upi.'+JSON.stringify(tot))
}

game_core_trouble.prototype.getPreRemaining  = function()
{
	var count = 0
	if (this.players.self.pre_elimine==0)
		count++

	for (var i in this.players.others)
	{
		if (this.players.others.hasOwnProperty(i))
		{
			if (this.players.others[i].pre_elimine==0)
			{
				count++
			}
		}
	}
	return count
}

game_core_trouble.prototype.getPreRemainingAlreadyPlayed  = function()
{
	var tot = {}
	if (this.players.self.pre_elimine==0 && this.players.self.pre_played!=0)
		tot[this.players.self.id] = this.players.self.pre_played

	for (var i in this.players.others)
	{
		if (this.players.others.hasOwnProperty(i))
		{
			if (this.players.others[i].pre_elimine==0  && this.players.others[i].pre_played!=0)
			{
				tot[i] = this.players.others[i].pre_played
			}
		}
	}
	return tot
}

var inArray = function(needle, haystack) {
	var length = haystack.length;
	for(var i = 0; i < length; i++) {
		if(haystack[i] == needle) return true;
	}
	return false;
}
function unique(arr){
  return arr.filter(function(el, index, arr) {
      return index == arr.indexOf(el);
  });
}

game_core_trouble.prototype.analyzeDiceRoll  = function()
{
	var totremaining = this.getPreRemaining()

	var totplayed = this.getPreRemainingAlreadyPlayed()
	var tienum = 0
	var ret = {}

	ret['winning'] = 0;
	ret['tie'] = [];
	ret['losing'] = [];

	//console.log('TOTPLAYED:'+JSON.stringify(totplayed))
	var count = 0
	for (var i in totplayed)
	{
		if (totplayed.hasOwnProperty(i))
			count++
	}
	if (count==totremaining)
	{

		var max = 0
		var max_player = ''
		var winning = ''
		var losing = []
		var ties = []
		var has_tie = false

		//foreach ($totplayed as $pid=>$p)
		//{

		var max_players = []
		for (var i in totplayed)
		{
			if (totplayed.hasOwnProperty(i))
			{
				var p = parseInt(totplayed[i])
				if (p>max)
				{
					max_players = []
					max_players.push(i)
					max = p
				}
				else if (p==max)
				{
					max_players.push(i)
				}

			}
		}

		if (max_players.length==1)
		{
			//console.log('got only one winner:'+max_players[0])
			this.has_winning = 1
			ret['winning'] = max_players[0]
			for (var i in totplayed)
			{
				if (totplayed.hasOwnProperty(i))
				{
					if (i!=ret['winning'])
					{
						ret['losing'].push(i)
						if (i==this.players.self.id)
						{
							this.players.self.pre_elimine = 1
						}
						else
						{
							this.players.others[i].pre_elimine = 1
						}
					}
				}
			}
		}
		else
		{
			this.has_winning = 0
			//console.log('got a tie for win:'+JSON.stringify(max_players))
			for (var i in totplayed)
			{
				if (totplayed.hasOwnProperty(i))
				{
					if (!inArray(i,max_players))
					{
						if (i==this.players.self.id)
						{
							this.players.self.pre_elimine = 1
						}
						else
						{
							this.players.others[i].pre_elimine = 1
						}
						ret['losing'].push(i)
					}
				}
			}
			for (var i = 0 ; i < max_players.length ; i++)
			{

				if (max_players[i]==this.players.self.id)
				{
					this.players.self.pre_elimine = 0
					this.players.self.pre_played = 0
				}
				else
				{
					this.players.others[max_players[i]].pre_elimine = 0
					this.players.others[max_players[i]].pre_played = 0
				}
				ret['tie'].push(max_players[i])
			}
		}
	}
		//console.log('RET:'+JSON.stringify(ret))
	return ret

}
game_core_trouble.prototype.getPlayerInfo = function(client,userid)
{
	var tot = {}
	tot['id'] = userid
	var thegame = client.game
	var thegamecore = thegame.gamecore
	var hostid = thegame.player_host.userid
	if (userid==hostid)
	{
		tot['color'] = thegamecore.players.self.color
		tot['pre_played'] = thegamecore.players.self.pre_played
		tot['pre_elimine'] = thegamecore.players.self.pre_elimine
		tot['game_won'] = thegamecore.players.self.game_won
		tot['login_name'] = thegamecore.players.self.login_name
	}
	else
	{
		if (thegamecore.players.others[userid]==undefined)
		{
			thegamecore.players.others[userid] = new game_player(this,client)
		}
		tot['color'] = thegamecore.players.others[userid].color
		tot['pre_played'] = thegamecore.players.others[userid].pre_played
		tot['pre_elimine'] = thegamecore.players.others[userid].pre_elimine
		tot['game_won'] = thegamecore.players.others[userid].game_won
		tot['login_name'] = thegamecore.players.others[userid].login_name
	}

	client.send('s.upi.'+JSON.stringify(tot))
}

game_core_trouble.prototype.sendChangePlayerTurn = function(client)
{
	//console.log('start0')
	var not_eliminated = false
	var cc = 0
	while (!not_eliminated && cc < 100)
	{
		cc++
		//console.log('start '+JSON.stringify(this.player_order))
		var themax = 0;
		for (var i in this.player_order)
		{
			if (this.player_order.hasOwnProperty(i))
			{
				if (this.player_order[i]==undefined) continue
				//console.log('WTF i:'+i+ 'this.player_order:'+this.player_order[i])
				if (parseInt(i)>themax)
				{
					themax = parseInt(i)
					//console.log('i='+i+' themax is now '+themax)
				}
			}
		}
		//console.log('themax 0 '+themax)
		themax++
		//console.log('themax 1 '+themax)
		this.current_turn++
		this.current_turn = (this.current_turn%themax)
		if (this.current_turn==0) this.current_turn=1

		var hostid = this.players.self.id

		if (this.player_order[this.current_turn]==hostid)
		{
			if (this.players.self.pre_elimine==0)
			{
				//console.log('host ('+hostid+') not elimitated')
				not_eliminated = true
			}
			else
			{
				//console.log('host ('+hostid+') is elimitated')
			}
		}
		else
		{
			//console.log('currenturn:'+this.current_turn+' player_order:'+JSON.stringify(this.player_order)+' themax:'+themax)
			if (this.players.others[this.player_order[this.current_turn]].pre_elimine==0)
			{
				//console.log('client ('+this.player_order[this.current_turn]+') not elimitated')
				not_eliminated = true
			}
			else
			{
				//console.log('client ('+this.player_order[this.current_turn]+') is elimitated')
			}
		}

	}
	//console.log('s.ct.'+this.player_order[this.current_turn])
	this.sendToAll('s.ct.'+this.player_order[this.current_turn],client)
}

game_core_trouble.prototype.sendToAll = function(msg,client)
{
	var thegame = client.game
	thegame.player_host.send(msg)
	var allclients = thegame.player_clients
	for (var i in allclients)
	{
		if (allclients.hasOwnProperty(i))
		{
			allclients[i].send(msg)
		}
	}
}
game_core_trouble.prototype.getPlayerTurn = function()
{
	return this.player_order[this.current_turn]
}

game_core_trouble.prototype.sendChangePlayerTurnInGame = function(client)
{
	//console.log('change turn before:'+this.current_turn+' player:'+this.player_order[this.current_turn])
	var themax = 0;
	for (var i in this.player_order)
	{
		if (this.player_order.hasOwnProperty(i))
		{
			if (this.player_order[i]==undefined) continue
			if (i>themax)
				themax = parseInt(i)
		}
	}
	themax++
	this.current_turn++
	this.current_turn = (this.current_turn%themax)
	if (this.current_turn==0) this.current_turn=1
	this.sendToAll('s.ct.'+this.player_order[this.current_turn],client)
	//console.log('change turn after:'+this.current_turn+' player:'+this.player_order[this.current_turn])
	//console.log('PO:'+JSON.stringify(this.player_order))
}
game_core_trouble.prototype.initOrder = function(thegame, force_player)
{
	var h = thegame.player_host.userid
	var c = thegame.player_clients
	var tot = { }

	if (force_player)
	{

		tot[1] = force_player

		var count = 2
		var themax = 0;
		var ind = 0

		for (var i in this.player_order)
		{
			if (this.player_order.hasOwnProperty(i))
			{
				if (i>themax)
					themax = parseInt(i)
				if (this.player_order[i]==force_player)
					ind = parseInt(i)
			}
		}
		themax++
		this.current_turn = ind+1
		this.current_turn = (this.current_turn%themax)
		if (this.current_turn==0) this.current_turn=1

		while (this.current_turn!=ind)
		{
			tot[count++] = this.player_order[this.current_turn]
			//console.log('ind is '+ind+' current_turn:'+this.current_turn+'-- setting tot['+(count-1)+'] to '+this.player_order[this.current_turn])
			this.current_turn++
			this.current_turn = (this.current_turn%themax)
			if (this.current_turn==0) this.current_turn=1
		}

	}
	else
	{
		var count = 1

		if (this.players.self.game_won==0)
		{
			tot[1] = h
			count = 2
		}
		for (var i in c)
		{
			if (c.hasOwnProperty(i))
			{
				if (this.players.others[c[i].userid].game_won==0)
					tot[count++] = c[i].userid
			}
		}
	}
	//console.log('NEW ORDER:'+JSON.stringify(tot))
	this.current_turn = 1
	this.player_order = tot

}

if( 'undefined' != typeof global ) {
    module.exports = global.game_core_trouble = game_core_trouble;
}


//////////// UNO   //////////////////////

var game_core_uno = function(game_instance){

    this.instance = game_instance;
	var hostplayer = this.instance.player_host

    this.players = {
        self : new game_player(this,hostplayer),
        others : {}
    };

    this.current_turn = 1
    this.players_ended = []
	this.player_order = { }
	this.deck = null
	this.selectedColor = ''
	this.order_dir = 1

};

game_core_uno.prototype.addClient = function(client,username)
{
	var thegame = client.game
	if (this.players.others[client.userid]==undefined)
	{
		this.players.others[client.userid] =  new game_player(this,client)
	}
	this.players.others[client.userid].login_name=username;
	this.players.others[client.userid].id=client.userid;


}

game_core_uno.prototype.changeTurnDir = function()
{
	if (this.order_dir==1)
	{
		this.order_dir=-1
	}
	else
	{
		this.order_dir=1
	}
}
game_core_uno.prototype.getPlayerTurn = function()
{
	return this.player_order[this.current_turn]
}
game_core_uno.prototype.getTurnNextPlayerId = function()
{
	if (this.order_dir==1)
	{
		var themax = 0;
		for (var i in this.player_order)
		{
			if (this.player_order.hasOwnProperty(i))
			{
				if (i>themax)
					themax = parseInt(i)
			}
		}
		themax++
		var nextt = (this.current_turn+1)
		nextt = (nextt%themax)
		if (nextt==0) nextt=1
		return this.player_order[nextt]
	}
	else
	{
		var nextt = (this.current_turn-1)
		if (nextt<=0)
		{
			var themax = 0;
			for (var i in this.player_order)
			{
				if (this.player_order.hasOwnProperty(i))
				{
					if (i>themax)
						themax = parseInt(i)
				}
			}
			nextt=themax
		}
		return this.player_order[nextt]
	}
}
game_core_uno.prototype.incPlayerTurn = function()
{
	if (this.order_dir==1)
	{
		var themax = 0;
		for (var i in this.player_order)
		{
			if (this.player_order.hasOwnProperty(i))
			{
				if (i>themax)
					themax = parseInt(i)
			}
		}
		themax++
		this.current_turn++
		this.current_turn = (this.current_turn%themax)
		if (this.current_turn==0) this.current_turn=1
		return this.player_order[this.current_turn]
	}
	else
	{
		this.current_turn--
		if (this.current_turn<=0)
		{
			var themax = 0;
			for (var i in this.player_order)
			{
				if (this.player_order.hasOwnProperty(i))
				{
					if (i>themax)
						themax = parseInt(i)
				}
			}
			this.current_turn=themax
		}
		return this.player_order[this.current_turn]
	}
}
game_core_uno.prototype.sendChangePlayerTurn = function()
{
	if (this.order_dir==1)
	{
		var themax = 0;
		for (var i in this.player_order)
		{
			if (this.player_order.hasOwnProperty(i))
			{
				if (i>themax)
					themax = parseInt(i)
			}
		}
		themax++
		this.current_turn++
		this.current_turn = (this.current_turn%themax)
		if (this.current_turn==0) this.current_turn=1

	}
	else
	{
		this.current_turn--
		if (this.current_turn<=0)
		{
			var themax = 0;
			for (var i in this.player_order)
			{
				if (this.player_order.hasOwnProperty(i))
				{
					if (i>themax)
						themax = parseInt(i)
				}
			}
			this.current_turn=themax
		}
	}
	this.deck.sendToAll('s.ct.'+this.player_order[this.current_turn])
}


game_core_uno.prototype.buildMasterDeck = function()
{
	for (var i in this.masterDeck)
	{
		if (this.masterDeck.hasOwnProperty(i))
		{
			this.card_data_byid[this.masterDeck[i].id] = this.masterDeck[i]
		}
	}
	for (var i = 0 ; i < this.card_data.length ; i++)
	{
		this.masterDeck[this.card_data[i].id] = Object.create(card)
		this.masterDeck[this.card_data[i].id].id = this.card_data[i].id
		this.masterDeck[this.card_data[i].id].type = this.card_data[i].type
		this.masterDeck[this.card_data[i].id].number = this.card_data[i].number
		this.masterDeck[this.card_data[i].id].color = this.card_data[i].color
		this.masterDeck[this.card_data[i].id].special_id = this.card_data[i].special_id

		this.card_data_byid[this.card_data[i].id] = this.card_data[i]
	}
	//console.log('UNO deck built '+JSON.stringify(this.deck.masterDeck))
}


game_core_uno.prototype.initOrder = function(thegame)
{
	var h = thegame.player_host.userid
	var c = thegame.player_clients
	var tot = { }
	tot[1] = h
	var count = 2
	for (var i in c)
	{
		if (c.hasOwnProperty(i))
		{
			tot[count++] = c[i].userid
		}
	}
	this.player_order = tot
	this.deck = new deck(this.player_order,thegame)

	this.deck.card_data = [{"id":"1","color":"yellow","number":"-1","type":"special","special_id":"5"}, {"id":"2","color":"blue","number":"-1","type":"special","special_id":"5"}, {"id":"3","color":"blue","number":"6","type":"normal","special_id":"6"}, {"id":"4","color":"blue","number":"6","type":"normal","special_id":"6"}, {"id":"5","color":"blue","number":"5","type":"normal","special_id":"6"}, {"id":"6","color":"yellow","number":"5","type":"normal","special_id":"6"}, {"id":"7","color":"yellow","number":"9","type":"normal","special_id":"6"}, {"id":"8","color":"yellow","number":"9","type":"normal","special_id":"6"}, {"id":"9","color":"yellow","number":"4","type":"normal","special_id":"6"}, {"id":"10","color":"yellow","number":"3","type":"normal","special_id":"6"}, {"id":"11","color":"yellow","number":"0","type":"normal","special_id":"6"}, {"id":"12","color":"yellow","number":"2","type":"normal","special_id":"6"}, {"id":"13","color":"yellow","number":"7","type":"normal","special_id":"6"}, {"id":"14","color":"yellow","number":"7","type":"normal","special_id":"6"}, {"id":"15","color":"green","number":"7","type":"normal","special_id":"6"}, {"id":"16","color":"green","number":"7","type":"normal","special_id":"6"}, {"id":"17","color":"green","number":"3","type":"normal","special_id":"6"}, {"id":"18","color":"green","number":"4","type":"normal","special_id":"6"}, {"id":"19","color":"blue","number":"4","type":"normal","special_id":"6"}, {"id":"20","color":"blue","number":"1","type":"normal","special_id":"6"}, {"id":"21","color":"blue","number":"7","type":"normal","special_id":"6"}, {"id":"22","color":"blue","number":"4","type":"normal","special_id":"6"}, {"id":"23","color":"none","number":"-1","type":"special","special_id":"3"}, {"id":"24","color":"green","number":"-1","type":"special","special_id":"1"}, {"id":"25","color":"yellow","number":"-1","type":"special","special_id":"5"}, {"id":"26","color":"green","number":"6","type":"normal","special_id":"6"}, {"id":"27","color":"green","number":"9","type":"normal","special_id":"6"}, {"id":"28","color":"yellow","number":"3","type":"normal","special_id":"6"}, {"id":"29","color":"none","number":"-1","type":"special","special_id":"3"}, {"id":"30","color":"blue","number":"3","type":"normal","special_id":"6"}, {"id":"31","color":"blue","number":"9","type":"normal","special_id":"6"}, {"id":"32","color":"blue","number":"-1","type":"special","special_id":"5"}, {"id":"33","color":"blue","number":"2","type":"normal","special_id":"6"}, {"id":"34","color":"blue","number":"1","type":"normal","special_id":"6"}, {"id":"35","color":"blue","number":"-1","type":"special","special_id":"1"}, {"id":"36","color":"red","number":"4","type":"normal","special_id":"6"}, {"id":"37","color":"red","number":"-1","type":"special","special_id":"2"}, {"id":"38","color":"red","number":"2","type":"normal","special_id":"6"}, {"id":"39","color":"red","number":"-1","type":"special","special_id":"5"}, {"id":"40","color":"red","number":"9","type":"normal","special_id":"6"}, {"id":"41","color":"blue","number":"9","type":"normal","special_id":"6"}, {"id":"42","color":"green","number":"-1","type":"special","special_id":"5"}, {"id":"43","color":"green","number":"-1","type":"special","special_id":"1"}, {"id":"44","color":"yellow","number":"6","type":"normal","special_id":"6"}, {"id":"45","color":"yellow","number":"-1","type":"special","special_id":"1"}, {"id":"46","color":"blue","number":"3","type":"normal","special_id":"6"}, {"id":"47","color":"red","number":"3","type":"normal","special_id":"6"}, {"id":"48","color":"red","number":"7","type":"normal","special_id":"6"}, {"id":"49","color":"yellow","number":"1","type":"normal","special_id":"6"}, {"id":"50","color":"green","number":"0","type":"normal","special_id":"6"}, {"id":"51","color":"yellow","number":"2","type":"normal","special_id":"6"}, {"id":"52","color":"red","number":"-1","type":"special","special_id":"1"}, {"id":"53","color":"green","number":"-1","type":"special","special_id":"5"}, {"id":"54","color":"blue","number":"5","type":"normal","special_id":"6"}, {"id":"55","color":"yellow","number":"-1","type":"special","special_id":"2"}, {"id":"56","color":"red","number":"1","type":"normal","special_id":"6"}, {"id":"57","color":"green","number":"-1","type":"special","special_id":"2"}, {"id":"58","color":"red","number":"0","type":"normal","special_id":"6"}, {"id":"59","color":"green","number":"-1","type":"special","special_id":"2"}, {"id":"60","color":"none","number":"-1","type":"special","special_id":"3"}, {"id":"61","color":"red","number":"4","type":"normal","special_id":"6"}, {"id":"62","color":"red","number":"7","type":"normal","special_id":"6"}, {"id":"63","color":"blue","number":"7","type":"normal","special_id":"6"}, {"id":"64","color":"yellow","number":"8","type":"normal","special_id":"6"}, {"id":"65","color":"yellow","number":"-1","type":"special","special_id":"2"}, {"id":"66","color":"red","number":"2","type":"normal","special_id":"6"}, {"id":"67","color":"green","number":"8","type":"normal","special_id":"6"}, {"id":"68","color":"none","number":"-1","type":"special","special_id":"3"}, {"id":"69","color":"yellow","number":"8","type":"normal","special_id":"6"}, {"id":"70","color":"red","number":"8","type":"normal","special_id":"6"}, {"id":"71","color":"green","number":"8","type":"normal","special_id":"6"}, {"id":"72","color":"green","number":"3","type":"normal","special_id":"6"}, {"id":"73","color":"yellow","number":"-1","type":"special","special_id":"1"}, {"id":"74","color":"blue","number":"8","type":"normal","special_id":"6"}, {"id":"75","color":"red","number":"-1","type":"special","special_id":"2"}, {"id":"76","color":"green","number":"9","type":"normal","special_id":"6"}, {"id":"77","color":"none","number":"-1","type":"special","special_id":"4"}, {"id":"78","color":"yellow","number":"6","type":"normal","special_id":"6"}, {"id":"79","color":"blue","number":"-1","type":"special","special_id":"2"}, {"id":"80","color":"red","number":"3","type":"normal","special_id":"6"}, {"id":"81","color":"yellow","number":"5","type":"normal","special_id":"6"}, {"id":"82","color":"red","number":"1","type":"normal","special_id":"6"}, {"id":"83","color":"blue","number":"8","type":"normal","special_id":"6"}, {"id":"84","color":"green","number":"5","type":"normal","special_id":"6"}, {"id":"85","color":"blue","number":"0","type":"normal","special_id":"6"}, {"id":"86","color":"blue","number":"-1","type":"special","special_id":"2"}, {"id":"87","color":"none","number":"-1","type":"special","special_id":"4"}, {"id":"88","color":"yellow","number":"4","type":"normal","special_id":"6"}, {"id":"89","color":"blue","number":"-1","type":"special","special_id":"1"}, {"id":"90","color":"blue","number":"2","type":"normal","special_id":"6"}, {"id":"91","color":"red","number":"8","type":"normal","special_id":"6"}, {"id":"92","color":"red","number":"5","type":"normal","special_id":"6"}, {"id":"93","color":"red","number":"9","type":"normal","special_id":"6"}, {"id":"94","color":"green","number":"5","type":"normal","special_id":"6"}, {"id":"95","color":"green","number":"2","type":"normal","special_id":"6"}, {"id":"96","color":"green","number":"1","type":"normal","special_id":"6"}, {"id":"97","color":"green","number":"6","type":"normal","special_id":"6"}, {"id":"98","color":"none","number":"-1","type":"special","special_id":"4"}, {"id":"99","color":"green","number":"2","type":"normal","special_id":"6"}, {"id":"100","color":"red","number":"6","type":"normal","special_id":"6"}, {"id":"101","color":"red","number":"6","type":"normal","special_id":"6"}, {"id":"102","color":"red","number":"-1","type":"special","special_id":"1"}, {"id":"103","color":"yellow","number":"1","type":"normal","special_id":"6"}, {"id":"104","color":"green","number":"1","type":"normal","special_id":"6"}, {"id":"105","color":"red","number":"-1","type":"special","special_id":"5"}, {"id":"106","color":"red","number":"5","type":"normal","special_id":"6"}, {"id":"107","color":"green","number":"4","type":"normal","special_id":"6"}, {"id":"108","color":"none","number":"-1","type":"special","special_id":"4"}]
	this.deck.card_data_byid = {}
	this.deck.state = []
	this.deck.trashOrder = []
	this.deck.masterDeck = {}
	this.deck.hands = {}
	this.deck.players = this.player_order

	this.deck.thegame = thegame
	this.deck.players = tot
	this.deck.buildMasterDeck = this.buildMasterDeck
	this.deck.buildMasterDeck()
	//console.log(JSON.stringify(this.deck.masterDeck))

}

if( 'undefined' != typeof global ) {
    module.exports = global.game_core_uno = game_core_uno;
}

//////////// BOGGLE   //////////////////////

var game_core_boggle = function(game_instance){

    this.instance = game_instance;
	var hostplayer = this.instance.player_host

	var ph = new game_player(this,hostplayer)

    this.players = {
        self : ph,
        others : {}
    };

	this.letters = ''
	this.gameduration = 10
	this.minletters = 3
    this.players_ended = []
    this.wordsSubmitted = {}
    this.wordsComputed = []
    this.results = null
    this.scores = {}
    this.definitions = {}
};

game_core_boggle.prototype.solve= function(a,minlets) {
	if (this.wordsComputed.length>0) return

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

	this.find_words(graph, chardict, 'None', [], prefixes,words);

}

let http = require('http')
game_core_boggle.prototype.getDefinitions = function(client) {
	var words = this.wordsComputed
	words = ['clochette','simple','taxi','valider','mise']
	var filteredWords = []
	for (var i = 0 ; i < words.length ; i++) {
		if (this.definitions[words[i]]==undefined) {
			console.log('words:'+words[i]+' not in gamobj')
			filteredWords.push(words[i])
		}

	}
	console.log('FILTERED:')
	console.log(filteredWords);
	//return []
	let me = this;
	if (filteredWords.length!=0) {
		http.get('http://localhost/getDefinitions.php?words='+filteredWords.join(','), res => {
		  let data = [];

		  res.on('data', chunk => {
			data.push(chunk);
		  });
		  res.on('end', () => {
			//console.log('BOOOO:')
			//console.log(data);
			/*const response = JSON.parse(Buffer.concat(data).toString());
			for (var i in response){
				if (response.hasOwnProperty(i)) {

					response[i] = response[i].replace('periodconv','.')

				}
			}*/
			var tt = Buffer.concat(data).toString()

			tt = tt.replace(new RegExp(/\./g, 'g'), 'periodconv')
			var alldefs = JSON.parse(tt)
			console.log('all defs:')
			console.log(alldefs)
			for (var j in alldefs) {
				if (alldefs.hasOwnProperty(j)) {
					this.definitions[j] = alldefs[j]
				}
			}
			console.log('DEFFSSS:')
			//console.log('sendL:'+'s.definitionsDone.'+tt)

			me.sendToAll('s.definitionsDone.'+JSON.stringify(this.definitions),client)
		  });
		}).on('error', err => {
		  console.log('Error: ', err.message);
		});
	} else {
		console.log('SEEEENDDD:'+'s.definitionsDone.'+JSON.stringify(this.definitions))
		me.sendToAll('s.definitionsDone.'+JSON.stringify(this.definitions),client)
	}

}
game_core_boggle.prototype.find_words = function(graph, chardict, position, prefix, prefixes, words)
{
    var word = this.to_word(chardict, prefix).toLowerCase();
	if (prefixes[word]==undefined)
	{
		return false
	}

	if (words[word]!=undefined && !inArray(word,this.wordsComputed))
	{
        this.wordsComputed.push(word)
    }

	for (var i = 0 ; i < graph[position].length ; i++)
	{
        if(!this.inArray(graph[position][i], prefix))
        {
            var newprefix = prefix.slice(0);
            newprefix.push(graph[position][i])
            this.find_words(graph, chardict, graph[position][i][0]+','+graph[position][i][1], newprefix, prefixes, words);
        }
    }


}

game_core_boggle.prototype.to_word  = function(chardict, prefix)
{
    var w =[]

    for (var i = 0 ; i < prefix.length ; i++)
    {
        w.push(chardict[prefix[i][0]+','+prefix[i][1]])
    }
    return w.join('')

}
game_core_boggle.prototype.inArray  = function(needle, haystack)
{
	var length = haystack.length;
	for(var i = 0; i < length; i++) {
		if(''+haystack[i] == ''+needle)
		{
			return true;
		}
	}
	return false;

}
game_core_boggle.prototype.addClient = function(client,username)
{
	var thegame = client.game
	if (this.players.others[client.userid]==undefined)
	{
		this.players.others[client.userid] =  new game_player(this,client)
	}
	this.players.others[client.userid].login_name=username;
	this.players.others[client.userid].id=client.userid;
	this.players.others[client.userid].score = 0


	this.updatePlayerInfo(client)
}

game_core_boggle.prototype.updatePlayerInfo = function(client)
{
	var tot = {}
	tot['id'] = client.userid

	if (client.hosting)
	{
		tot['login_name'] = client.game.gamecore.players.self.login_name
	}
	else
	{
		tot['login_name'] = client.game.gamecore.players.others[client.userid].login_name
	}
	this.sendToAll('s.upi.'+JSON.stringify(tot),client)
	//console.log('s.upi.'+JSON.stringify(tot))
}


var inArray = function(needle, haystack) {
	var length = haystack.length;
	for(var i = 0; i < length; i++) {
		if(haystack[i] == needle) return true;
	}
	return false;
}


game_core_boggle.prototype.getPlayerInfo = function(client,userid)
{
	var tot = {}
	tot['id'] = userid
	var thegame = client.game
	var thegamecore = thegame.gamecore
	var hostid = thegame.player_host.userid
	if (userid==hostid)
	{
		tot['login_name'] = thegamecore.players.self.login_name
	}
	else
	{
		if (thegamecore.players.others[userid]==undefined)
		{
			thegamecore.players.others[userid] = new game_player(this,client)
		}
		tot['login_name'] = thegamecore.players.others[userid].login_name
	}

	client.send('s.upi.'+JSON.stringify(tot))
}


game_core_boggle.prototype.sendToAll = function(msg,client)
{
	var thegame = client.game
	thegame.player_host.send(msg)
	var allclients = thegame.player_clients
	for (var i in allclients)
	{
		if (allclients.hasOwnProperty(i))
		{
			allclients[i].send(msg)
		}
	}
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

game_core_boggle.prototype.brasseCube = function()
{
	var finalletters = []
	var letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']

	var cubes = []
	cubes.push(['e','s','a','c','l','r'])
	cubes.push(['o','r','i','f','b','x'])
	cubes.push(['a','c','e','p','m','d'])
	cubes.push(['b','i','l','a','y','t'])
	cubes.push(['v','d','z','n','a','e'])
	cubes.push(['l','g','k','y','e','u'])
	cubes.push(['j','q','b','m','a','o'])
	cubes.push(['i','n','e','g','t','v'])
	cubes.push(['s','n','w','d','e','o'])
	cubes.push(['h','o','s','a','m','r'])
	cubes.push(['e','f','y','h','i','e'])
	cubes.push(['n','u','d','o','k','t'])
	cubes.push(['u','s','e','t','l','p'])
	cubes.push(['t','a','c','i','o','a'])
	cubes.push(['s','e','h','i','p','n'])
	cubes.push(['w','i','l','u','g','r'])
	cubes.push(['p','a','t','o','v','l'])
	cubes.push(['e','d','a','r','c','b'])
	cubes.push(['j','i','g','u','e','s'])
	cubes.push(['t','e','p','o','s','m'])
	cubes.push(['t','i','d','u','s','r'])
	cubes.push(['a','t','i','l','f','b'])
	cubes.push(['h','u','k','e','a','p'])
	cubes.push(['r','e','c','i','n','m'])
	cubes.push(['l','o','s','u','d','j'])

	var taken = []
	for (var i = 0 ; i < 25 ; i++)
	{
		var ind = randomIntFromInterval(0,(cubes.length-1))
		while (inArray(ind,taken))
		{
			ind = randomIntFromInterval(0,(cubes.length-1))
		}
		taken.push(ind)
		finalletters.push(cubes[ind][randomIntFromInterval(0,(cubes[i].length-1))])
	}
	return finalletters

}

game_core_boggle.prototype.calcPointage = function(client) {
	var thegame = client.game
	var thegamecore = thegame.gamecore
	var allwords = unique(this.wordsComputed)
	var ret = { "words":{}, "pointages":{}, "raw_words":allwords }
	var playerresults = this.wordsSubmitted
	var playerpointages = {}
	var players_rejected = {}
	var players_found = {}
	var point_table = { "3":"3","4":"5","5":"8","6":"12","7":"15" }

	for (var i = 0 ; i<allwords.length ; i++) {

		ret['words'][allwords[i]] = []
		for (var j in playerresults) {
			if (playerresults.hasOwnProperty(j)) {
				if (playerpointages[j]==undefined){
					playerpointages[j] = 0
				}
				if (players_found[j]==undefined){
					players_found[j] = []
				}
			}
			for (var k = 0 ; k < playerresults[j].length ; k++) {

				var one_found_word = playerresults[j][k]
				if (one_found_word==allwords[i]) {
					//console.log('FOUND '+one_found_word)
					players_found[j].push(one_found_word);
					var p = 3
					var l = one_found_word.length
					if (l<3) {
						p = 0
					} else if (l>7) {
						p = l+10*(l-7)+(10-l)
					} else {
						p = point_table[l]
					}
					playerpointages[j]+=parseInt(p)
					ret['words'][allwords[i]].push(j)
				}
			}
		}


	}
	for (var l in playerresults) {
		if (playerresults.hasOwnProperty(l)) {
			if (players_rejected[l]==undefined) {
				players_rejected[l] = []
			}
		}
		var foundwords = unique(playerresults[l])
		//console.log('FFFFFFFFF')
		//console.log(foundwords)
		for (var m = 0 ; m < foundwords.length ; m++) {
			if (!inArray(foundwords[m],players_found[l]) && foundwords[m].length>=this.minletters)
			{
				//console.log('Rejected:'+foundwords[m])
				players_rejected[l].push(foundwords[m]);
			} /*else {
				console.log('"'+foundwords[m]+'" is in array players_found')
				console.log(players_found[l])
			}*/
		}
		//console.log('end plyer '+l)
	}
	ret['pointages'] = playerpointages;
	var maxPoints = 0
	var maxPlayerId = ''
	for (var t in ret['pointages']) {
		if (ret['pointages'].hasOwnProperty(t)) {
			if (ret['pointages'][t] > maxPoints) {
				maxPoints = ret['pointages'][t]
				maxPlayerId = t
			}
		}
	}

	if (maxPlayerId!='') {
		if (this.scores[maxPlayerId]==undefined) {
			this.scores[maxPlayerId] = 0
		}
		this.scores[maxPlayerId]++
	}
	for (var l in playerresults) {
		if (playerresults.hasOwnProperty(l)) {
			if (this.scores[l]==undefined) {
				this.scores[l] = 0
			}
		}
	}
	//console.log('scores:')
	//console.log(this.scores)
	/*if (thegamecore.players.self.id == maxPlayerId) {
		thegamecore.players.self.score++
		console.log('maxPlayerID (me):'+thegamecore.players.self.id+' has score:'+thegamecore.players.self.score)
	} else {
		for (var j in thegamecore.players.others){
			if (thegamecore.players.others.hasOwnProperty(j)) {
				if (thegamecore.players.others[j].id==maxPlayerId){
					thegamecore.players.others[j].score++
					console.log('maxPlayerID (other):'+thegamecore.players.others[j].id+' has score:'+thegamecore.players.others[j].score)
				}
			}
		}
	}*/



	ret['playerrejected'] = players_rejected;
	//console.log(ret)
	this.results = ret;
	//return {"results":ret};
}
if( 'undefined' != typeof global ) {
    module.exports = global.game_core_boggle = game_core_boggle;
}






