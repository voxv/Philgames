YUI.add("dice", function(Y) {
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

			this.imgnode = Y.Node.create('<img width='+m.get('width')+' height='+m.get('height')+' style="z-index:20; position:absolute; transform: rotateZ('+m.get('rot')+')" src="images/dice-'+m.get('selectedFace')+'.png">')
			c.setStyles({ cursor:'pointer', position:'absolute',left:m.get('x'),top:m.get('y')})
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
		shuffle:function()
		{
			var m = this.get('model')
			var faces = m.get('faces')
			if (!faces || faces=='undefined')
				faces = [1,2,3,4,5,6]
			var newFace = Math.floor(Math.random()*faces.length)+1
			m.set('selectedFace', newFace)
		},
		throwDice:function(from)
		{
			var m = this.get('model')
			var c = this.get('container');
			c.setStyle('display','block')
			var degrand = Math.floor(Math.random()*220)+45
			var dirrand = Math.floor(Math.random()*2)+1

			if (dirrand==2)
			{
				this.anim_rot.set('reverse',true)
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
			var a = new Y.Anim({
					node: this.get('container'),
					from: { xy: [degposx,degposy] },
					to:   { xy: [m.get('x'),m.get('y')]  },
					duration : 1,
					easing: 'easeOutStrong'
				});
			a.run()
			shake_audio.pause()
			drop_audio.play()
		},
		render: function()
		{
			var m = this.get('model')
			var c = this.get('container');
			var img = this.imgnode
			var rotanim = this.rt

			img.setStyle('transform','rotateZ('+this.rt.get('deg')+'deg)')
			img.set('src','images/dice-'+m.get('selectedFace')+'.png')

			return this;
		}
	});

}, '1.0', {requires: ['json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});