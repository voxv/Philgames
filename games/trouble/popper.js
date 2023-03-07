YUI.add("popper", function(Y) {

	var parrframe = parent;
	var parrapp = parent.app.get('activeView');
	
	Y.PopperView = Y.Base.create('popperview',Y.View,[],
	{
		dice:null,
		trans:null,
		initializer: function()
		{
			var c = this.get('container');
			var m = this.get('model');

			var n = Y.Node.create('<div class="popperview"></div>');

			c.append('<img style="z-index:10;" class="origin" src="./images/board_pop_background_trans.png">');

			var dicewidth = 48;
			var d1 = new Y.Dice({x:45,y:45,width:dicewidth,id:1});
			this.dice  = new Y.DiceView({model:d1})
			c.append(this.dice.get('container'));

			//n.append('<img style="z-index:11;" class="origin" src="./images/d'+Math.floor((Math.random() * 6) + 1)+'.png">');

			var trans = this.trans = Y.Node.create('<img style="z-index:12;" class="origin" src="./images/board_pop_trans2.png">');


			var par = this;
			trans.on('click',function (e)
			{
				//Y.log('myturn:'+myturn+' popitblock:'+popitblock)
				if (myturn && !popitblock)
				{
					par.popit();
					popitblock = true;
					wtfblock=1;
				}


			});
			c.append(trans);

			//c.append(n);

		},
		updateCursor:function()
		{
			if (myturn && !popitblock)
				this.trans.setStyle('cursor','pointer');
			else
				this.trans.setStyle('cursor','default');

		},
		forcePop:function(played)
		{
			var st = 522-26;
			var en = 522+26;
			var degrandx = Math.floor(Math.random() * (en - st + 1)) + st;
			var st = 338-26;
			var en = 338+26;
			var degrandy = Math.floor(Math.random() * (en - st + 1)) + st;
			var num = this.dice.throwDice([degrandx,degrandy],played);
		},
		popit: function()
		{

			var st = 522-26;
			var en = 522+26;
			var degrandx = Math.floor(Math.random() * (en - st + 1)) + st;
			var st = 338-26;
			var en = 338+26;
			var degrandy = Math.floor(Math.random() * (en - st + 1)) + st;
			var num = this.dice.throwDice([degrandx,degrandy],0);
			if (is_pre)
			{
				//if (pre_test_count<4)
				//num = pre_test[pre_test_count]
				
	
				pre_played[game.players.self.id]=num;
				
				//TODO
				game.socket.send('c.ppp.'+num)   // play pooper pre


			}
			else
			{
				//if (players_info[game.players.self.id]=='mg70ag')
					//num=3;
				//else
					//num=3;
				if (num==6)
					playasecondtime++;
				
				//TODO
				var tot = {}
				tot['played'] = num
				tot['player'] = game.players.self.id
				game.socket.send('c.rd.'+JSON.stringify(tot))
				//dispatcher.sendEvent(6,num);

			}
		},
		render: function()
		{
			return this;
		}

	});

}, '1.0', {requires: ['gallery-audio','dice','json-parse','json-stringify','console','app','node','model','model-list','view', 'io','dd-constrain','dd-drag']});