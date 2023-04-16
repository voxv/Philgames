YUI.add("dice", function(Y) {
	
	var parrframe = parent;
	var parrapp = parent.app.get('activeView');
	
	Y.Dice = new Y.Base.create('dice',Y.Model,[],
	{
		ATTRS:
		{
			id:{ value:0 },
			selectedFace: { value:1 },
			faces: { value:[1,2,3,4,5,6] },
			x: { value:0 },
			y: { value:0 },
			rot: { value : 0 },
			width: { value: 0 }
		}
	});

	Y.RotAnim = new Y.Base.create('rotanim',Y.Model,[],
	{
		ATTRS:
		{
			deg :{ value:0 },
		}
	});

	Y.DiceView = Y.Base.create('diceview',Y.View,[],
	{
		imgnode:null,
		rt:null,
		anim_rot:null,
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');

			this.imgnode = Y.Node.create('<img width='+m.get('width')+' height='+m.get('width')+' style="z-index:11; position:absolute; transform: rotateZ('+m.get('rot')+')" src="./images/d'+m.get('selectedFace')+'.png">')
			c.setStyles({ position:'absolute',left:m.get('x'),top:m.get('y')})
			c.append(this.imgnode)

			this.rt = new Y.RotAnim({deg:0});

			var par = this

			this.rt.after('degChange',function(){  par.imgnode.setStyle('transform','rotateZ('+par.rt.get('deg')+'deg)'); par.render() })


			this.anim_rot = new Y.Anim({
					node: this.rt,
					from: { deg: 0 },
					to: {  deg: 0 },
					duration : 2,
					easing: 'easeOutStrong'
				});

			this.shuffle()
			this.render()
		},
		shuffle:function(force)
		{
			var m = this.get('model')
			var faces = m.get('faces')
			if (!faces || faces=='undefined')
				faces = [1,2,3,4,5,6]
			var newFace = Math.floor(Math.random()*faces.length)+1
			if (force && force!=0)
				m.set('selectedFace', force)
			else
				m.set('selectedFace', newFace)
			this.render();
		},
		throwDice:function(from,force)
		{
			this.shuffle(force);
			var m = this.get('model')
			var c = this.get('container');
			c.setStyle('display','block');
			var degrand = Math.floor(Math.random() * (180 - 85 + 1)) + 85;
			var dirrand = Math.floor(Math.random()*2)+1

			if (dirrand==2)
			{
				this.anim_rot.set('reverse',true)
				this.anim_rot.set('duration',0.1)
				this.anim_rot.set('easing','easeInStrong')
			}
			else
			{
				this.anim_rot.set('reverse',false)
				this.anim_rot.set('easing','easeOutStrong')
			}

			this.anim_rot.set('to',{ deg:degrand});
			this.anim_rot.run()

			degposx = from[0]
			degposy = from[1]

			var newcenter = [popperposition[0]+226,popperposition[1]+54]
			var st = newcenter[0]-24;
			var en = newcenter[0]+33;
			var degrandx = Math.floor(Math.random() * (en - st + 1)) + st;
			var st = newcenter[1]-26;
			var en = newcenter[1]+31;
			var degrandy = Math.floor(Math.random() * (en - st + 1)) + st;

			var a = new Y.Anim({
					node: this.get('container'),
					from: { xy: [degposx,degposy] },
					to:   { xy: [degrandx,degrandy]  },
					duration :0.4,
					easing: 'easeOutStrong'
				});
			parrapp.playAudio(GAME_NAME,'popper')
			a.run()
			return m.get('selectedFace');
			//shake_audio.pause()
			//drop_audio.play()
		},
		render: function()
		{
			var m = this.get('model')
			var c = this.get('container');
			var img = this.imgnode
			var rotanim = this.rt

			img.setStyle('transform','rotateZ('+this.rt.get('deg')+'deg)')
			img.set('src','./images/d'+m.get('selectedFace')+'.png')

			return this;
		}
	});

}, '1.0', {requires: ['gallery-audio','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});