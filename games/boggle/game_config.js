YUI.add("game_config", function(Y) {

	var parrframe = parent;
	var parrapp = parent.app.get('activeView');

	Y.GameConfigView = new Y.Base.create('gameConfigView',Y.View,[],
			{
				ATTRS:
				{
					is_admin:{ value:0 },
					show_full:true,
					minletters:3,
					duration:'03:00'
				},
				timecombo:null,
				slider2:null,
				comboTimes: ['00:10','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00'],
				initializer:function()
				{
					this.slider2 = new Y.Slider({ min: 3, max: 7});
					this.slider2.after( "valueChange", this.updateLettersMin, this );
					this.after('durationChanged',function(e){ this.render() },this);
					this.after('minlettersChanged',function(e){ this.render() },this);

					var cont = this.get('container');
					game_config_container = cont;
					if (this.get('show_full')==0)
						cont.addClass('gameconfig_container_in_game');
					else
						cont.addClass('gameconfig_container');

					var nodeConfig1 = Y.Node.create('<div class="config_desc"><div style="float:left;">DurÃ©e:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div><div id="gameduration" style="float:right;">03:00</div></div>');
					var nodeSelectDiv = Y.Node.create('<div class="timecomboDiv" id="timecomboDiv"/>');
					var nodeConfig2 = Y.Node.create('<div class="config_desc"><div style="float:left;">Lettres minimum:</div><div style="float:right;" id="minlength">3</div></div>');
					var nodeSlider2 = Y.Node.create('<div class="sliderDiv" id="slider2">');

					this.get('container').append(nodeConfig1);
					console.log('self host:'+game.players.self.host+' showfull:'+this.get('show_full'))
					if (game.players.self.host && this.get('show_full'))
					{
						this.get('container').append(nodeSelectDiv);
						if (!started || fromchange)
		                                {
							this.recreateCombo(this.get('duration'));
		                                }
						else if (!started) { started = true; }
					}
					this.get('container').append(nodeConfig2);
					Y.log('minletters:'+this.get('minletters'))
					if (this.get('is_admin')==1 && this.get('show_full'))
					{
						nodeSlider2.set('value',this.get('minletters'));
						this.get('container').append(nodeSlider2);
					}

					this.slider2.render( nodeSlider2 );
				},
				events:
				{
					'#timecombo': {change: 'updateDuration'},
				},
				updateLettersMin: function (e)
				{
					this.get('container').one('#minlength').setHTML(e.newVal);
					//TODO
					//SimpleAJAXCall('poggle.ajax.php?action=updateLettersMin&min='+e.newVal,handleResponse,'POST','updateLettersMin');

				},
				updateDuration: function (e)
				{
					var newVal = e.currentTarget.get('options').item(e.currentTarget.get('selectedIndex')).get('text');
					this.get('container').one('#gameduration').setHTML(newVal);
					fromchange = true;
					//TODO
					//SimpleAJAXCall('poggle.ajax.php?action=updateDuration&duration='+newVal,handleResponse,'POST','updateDuration');

				},
				recreateCombo: function(selected)
				{

					var comboDiv = this.get('container').one('#timecomboDiv');
		                        if (comboDiv==null){ thisapp.navigate('/'); return; }
					comboDiv.empty();
					var selectNode = Y.Node.create('<select id="timecombo"/>');

					Y.Array.each(this.comboTimes, function(t)
					{
						var sel = '';

						if (t==selected) sel = 'selected';
						selectNode.append(Y.Node.create('<option value="'+t+'" '+sel+'>'+t.substring(1,t.length)+'</option>'));

					});
					comboDiv.append(selectNode);

				},
				setDuration: function(duration)
				{
					this.get('container').one('#gameduration').setHTML(duration.substring(1,duration.length));
					this.render();
				},
				setMinLetters: function(min)
				{
					this.slider2.set('value',min);
				},
				render: function()
				{
					return this;
				}
			});

}, '1.0', {requires: ['slider','json-parse','json-stringify','console','app','node','model','model-list','view', 'io','dd-constrain','dd-drag']});