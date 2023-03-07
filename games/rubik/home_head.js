YUI.add("homehead", function(Y) {

	var parr = parent

	Y.HomeHeadView = Y.Base.create('homeheadview',Y.View,[],
	{
		hostscore_score:null,
		otherscore_score:null,
		otherscore_name:null,
		otherscoretot:null,
		scorestot:null,
		initializer:function()
		{
			this.get('container').set('className',"homehead_tot");
			var backimgdiv2 = Y.Node.create('<div class="homehead_backimg"></div>');
			var backimg = Y.Node.create('<img style=" margin-top:3px; margin-left:5px; width:83px; height:46px;" src="../lobby/images/back.png"/>');
			backimgdiv2.append(backimg);
			this.get('container').append(backimgdiv2)
			var par = this
			backimgdiv2.on('mousedown',function(e) { par.doclick() });
			backimgdiv2.on('touchstart',function(e) { par.doclick() });

			var scorestot = this.scorestot =  Y.Node.create('<div class="homehead_scorestot"></div>');

			this.get('container').append(scorestot)

			var hostscoretot = this.otherscoretot = Y.Node.create('<div class="homehead_oneplayerscoretot"></div>');
			var hostscore_name = Y.Node.create('<div class="homehead_oneplayername"></div>');

			hostscore_name.append(parr.main_instance.login_name+':')
			hostscoretot.append(hostscore_name);
			var hostscore_score = this.hostscore_score = Y.Node.create('<div class="homehead_oneplayerscore">0</div>');
			hostscoretot.append(hostscore_score);

			var otherscoretot = this.otherscoretot = Y.Node.create('<div class="homehead_oneplayerscoretot"></div>');
			this.otherscoretot.setStyle('display','none');
			this.otherscore_name = Y.Node.create('<div class="homehead_oneplayername"></div>');

			otherscoretot.append(this.otherscore_name);
			var otherscore_score = this.otherscore_score = Y.Node.create('<div class="homehead_oneplayerscore">0</div>');
			otherscoretot.append(otherscore_score);

			scorestot.append(hostscoretot)
			scorestot.append(otherscoretot)
			this.get('container').append(scorestot);
		},
		doclick:function()
		{
			parr.main_instance.activeGame='';
			parr.app.get('activeView').setGame('lobby');
		},
		updateScore:function()
		{
			this.otherscore_name.setHTML(game.players.other.login_name+':')
			this.otherscoretot.setStyle('display','block');
			var hme = game.players.self.score
			var hother = game.players.other.score
			if (parr.main_instance.hosting)
			{
				this.hostscore_score.setHTML(hme)
				this.otherscore_score.setHTML(hother)
			}
			else
			{
				this.otherscore_score.setHTML(hme)
				this.hostscore_score.setHTML(hother)
			}
		},
		eraseOther:function()
		{
			this.otherscoretot.setStyle('display','none');
		},
		render:function()
		{
			return this
		}
	});
}, '1.0', {requires: ['gallery-audio','json-parse','json-stringify','console','app','node','model','view', 'io']});
