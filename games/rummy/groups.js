YUI.add("groups", function(Y) {
	
	var parrframe = parent;
	var parrapp = parent.app.get('activeView');
	
	Y.Group = new Y.Base.create('group',Y.Model,[],
	{
		ATTRS:
		{
			id:{ value:0 },
			x: { value:0 },
			y: { value:0 },
			cards: { value: [] },
		}
	});
	Y.GroupView = Y.Base.create('groupview',Y.View,[],
	{
		pending_complete:false,
		pending_counter:0,
		initializer: function()
		{
			var c = this.get('container')
			c.setStyle('width',200)
			c.setStyle('height',80)
			c.setStyle('position','absolute')
			c.setStyle('left',this.get('model').get('x'))
			c.setStyle('top',this.get('model').get('y'))
			c.setStyle('backgroundColor','#232fa9')
			var drop = new Y.DD.Drop({
			    node: c
			});
			var par = this

			this.pending_counter = 1

			drop.on('drop:hit', function(e) {
				if (!myturn)
				{
					thisapp.get('activeView').say('Ce n\'est pas ton tour.')
					e.preventDefault()
					return
				}
			    var drag = e.drag;
			    var n = drag.get('data');
			    var carddiv = drag.get('node');

			    if (par.canAccept(n['id']))
			    {
					var ind = hand.indexOf(n['id'])
					if (ind!=-1)
					{
						hand.splice(ind,1)
						game.socket.send('c.uh.'+JSON.stringify(hand))
						gridview.render()
					}

			    	groupboardview.addCardsToGroup(par.get('model').get('id'),[n['id']])
			    	var tot = [n['id'],par.get('model').get('id')]
			    	game.socket.send('c.acg.'+JSON.stringify(tot))    // add card to group
				}
			});

			this.pending_num=0

		},
		canAccept:function(cardid)
		{
			var m = this.get('model');
			var cards = m.get('cards');
			if (cards.length == 0)
			{
				return true
			}
			if (cards.length == 1)
			{
				var n1 =  parseInt(cardviews[cards[0]].get('model').get('number'))
				var n2 = parseInt(cardviews[cardid].get('model').get('number'))
				var t1 = cardviews[cards[0]].get('model').get('type')
				var t2 = cardviews[cardid].get('model').get('type')
				if (n1==n2)
				{
					//Y.log('canAccept found 2 checking hand for a 3rd')
				
					for (var i = 0 ; i < hand.length ; i++)
					{
						var cv = cardviews[hand[i]]
						var cvm = cv.get('model')
						
						if (cvm.get('id')==cardid)
							continue
						
						var cvmn = parseInt(cvm.get('number'))
						
						if (cvmn==n1) 
						{	
							return true
						}
					}
					return false
				}

				if (((n1+1)==n2 || (n2+1)==n1) && t1==t2)
				{
					//Y.log('canAccept found 2 suite checking hand for a 3rd')
					
					for (var i = 0 ; i < hand.length ; i++)
					{
						var cv = cardviews[hand[i]]
						var cvm = cv.get('model')
						
						if (cvm.get('id')==cardid)
							continue
						
						var cvmn = parseInt(cvm.get('number'))
						var cvmt = cvm.get('type')
						
						//Y.log('n1+1 ('+(n1+1)+')==n2('+n2+') && cvmt('+cvmt+')==t1 ('+t1+')?')
						//if ((n1+1)==n2 && cvmt==t1)
						//{
						//	Y.log('yes')
						//}
						//Y.log('n2+1 ('+(n2+1)+')==n1('+n1+') && cvmt('+cvmt+')==t1 ('+t1+')?')
						//if ((n2+1)==n1 && cvmt==t1)
						//{
						//	Y.log('yes')
						//}
						if ((n1+1)==n2 && cvmt==t1)
						{
							//Y.log('Card in hand :'+cvm.get('id')+' --- card played ('+n2+') > card in group ('+n1+') -- cvmn:'+cvmn)
							//Y.log('n2+1==cvmn('+cvmn+')?')
							//if ((n2+1)==cvmn)
							//	Y.log('yes')
							//else
							//	Y.log('no')
							//if ((n2+1)!=cvmn)
							//{
								//Y.log('cvmn+1== n1 ('+n1+')?')
								//if ((cvmn+1)==n1)
								//	Y.log('yes')
								//else
								//	Y.log('no')									
							//}
							if ((n2+1)==cvmn || (cvmn+1)==n1)
							{
								//Y.log('TRUE')
								return true
							}
							//Y.log('FALSE')
						}
						else if ((n2+1)==n1 && cvmt==t1)
						{
							//Y.log('Card in hand :'+cvm.get('id')+' --- card played ('+n2+') > card in group ('+n1+') -- cvmn:'+cvmn)
							//Y.log('n2-1==cvmn('+cvmn+')?')
							//if ((n2-1)==cvmn)
							//	Y.log('yes')
							//else
							//	Y.log('no')
							//if ((n2-1)!=cvmn)
							//{
							//	Y.log('n1+1== cvmn ('+n1+')?')
							//	if ((n1+1)==cvmn)
							//		Y.log('yes')
							//	else
							//		Y.log('no')									
							//}
							if ((n2-1)==cvmn || (n1+1)==cvmn)
							{
								//Y.log('TRUE')
								return true
							}		
							//Y.log('FALSE')
						}
					}
					return false
				}
			}	
			else if (cards.length >= 2)
			{
				var n1 = parseInt(cardviews[cards[0]].get('model').get('number'))
				var t1 = cardviews[cards[0]].get('model').get('type')
				var n2 = parseInt(cardviews[cards[1]].get('model').get('number'))
				var nmax = parseInt(cardviews[cards[(cards.length-1)]].get('model').get('number'))
				var ns = parseInt(cardviews[cardid].get('model').get('number'))
				var ts = cardviews[cardid].get('model').get('type')
				if (n1==n2 && ns==n1) return true
				//Y.log((ns)+' VS '+(n1-1)+' OR '+(ns)+' VS '+(nmax+1))
				if ((ns==(n1-1) || ns==(nmax+1)) && ts==t1 && n1!=n2) return true

				return false

			}
			return false
		},
		getRealXY:function()
		{
			return [groupboardview.get('model').get('x')+this.get('model').get('x'),groupboardview.get('model').get('y')+this.get('model').get('y')]
		},
		reorder:function(cards)
		{
			if (cards.length < 2) return cards

			else if (cards.length == 2)
			{
				var n1 = parseInt(cardviews[cards[0]].get('model').get('number'))
				var n2 = parseInt(cardviews[cards[1]].get('model').get('number'))
				if (n1==n2)
					return cards
			}
			var ret = []

			cards.sort(function(x, y){
				if ( parseInt(cardviews[x].get('model').get('number')) < parseInt(cardviews[y].get('model').get('number'))) {
					return -1;
				}
				if (parseInt(cardviews[x].get('model').get('number')) > parseInt(cardviews[y].get('model').get('number'))) {
					return 1;
				}
				return 0;
			});
			return cards
		},
		render: function()
		{
			var m = this.get('model');
			var c = this.get('container');
			var cards = m.get('cards');


			var inc = 20
			var z = 2;
			cards = this.reorder(cards)
			m.set('cards',cards);

			for (var i=0 ; i < cards.length ; i++)
			{
				var posx = this.getRealXY()[0]+i*inc
				var posy = this.getRealXY()[1]-10
				cardviews[cards[i]].get('model').set('ingroup',m.get('id'))

				var carddiv = cardviews[cards[i]].get('container')
				carddiv.setStyle('position','absolute')
				carddiv.setStyle('left',posx)
				carddiv.setStyle('top',posy)
				carddiv.setStyle('display','block')
				cardviews[cards[i]].image.setStyle('width',cardwidthingroup)

				carddiv.setStyle('zIndex',z)
				z+=5
			}
			return this;
		}
	});

	Y.GroupBoard = new Y.Base.create('groupboard',Y.Model,[],
	{
		ATTRS:
		{
			x: { value:0 },
			y: { value:0 },
			width:{ value:0 },
			height: { value:0 },
			groups: { value: [] },
		}
	});
	Y.GroupBoardView = Y.Base.create('groupboardview',Y.View,[],
	{
		currentRow:30,
		currentColumn:10,
		initializer: function()
		{
			var node = Y.one('#group_area')
			var m = this.get('model')
			var drop = new Y.DD.Drop({
			    node: '#group_area'
			});

			var par = this
			drop.on('drop:hit', function(e) {

				if (!myturn)
				{
					parrapp.playAudio(GAME_NAME,'wrong')
					thisapp.get('activeView').say('Ce n\'est pas ton tour.')
					e.preventDefault()
					return
				}
				if (turnstep>1)
				{
					e.preventDefault()
					return
				}
				if (turnstep==0)
				{
					parrapp.playAudio(GAME_NAME,'wrong')
					thisapp.get('activeView').say('Tu dois piger d\'abord')
					e.preventDefault()
					return
				}
			    var drag = e.drag;

			    var n = drag.get('data');
			    var carddiv = drag.get('node');

			    if (par.noPending() && par.isGroupable(n['id']))
			    {
					var gid = groupboardview.addGroup(n['id'],0)

					var tot = [n['id'],gid.get('model').get('id')]
					
					game.socket.send('c.crg.'+JSON.stringify(tot))   // create group
				}
				else if (!par.isGroupable(n['id']))
				{
					parrapp.playAudio(GAME_NAME,'wrong')
				}
				e.preventDefault()
				return
			});

		},
		noPending : function()
		{
			var groups = this.get('model').get('groups')

			for (var i = 0 ; i < groups.length ; i++)
			{
				if (!groups[i].pending_complete)
				{
					//Y.log(groups[i].get('model').get('id')+' is pending : '+groups[i].pending_counter)
					return false
				}
			}

			return true
		},
		isGroupable:function(cid)
		{
			ret = false;

			var pcv = cardviews[cid]
			var pnum = parseInt(pcv.get('model').get('number'))
			var ptype = pcv.get('model').get('type')
			var numfound = 0
			//check pareils
			//Y.log('check pareils hand is '+hand.toSource())
			for (var i = 0 ; i < hand.length ; i++)
			{
				var cv = cardviews[hand[i]]
				//Y.log('doing card '+hand[i])
				var cvm = cv.get('model')
				var ingrp = cvm.get('ingroup')
				//Y.log('ingroup:'+ingrp)
				//if (ingrp!=0 && ingrp!=undefined) continue
				if (cvm.get('id')==cid) continue
				var tnum = parseInt(cvm.get('number'))
				//Y.log(tnum+' VS '+pnum)
				if (tnum==pnum)
				{
					numfound++
					//Y.log('numfound:'+numfound)
				}
				if (numfound>1)
				{
					//Y.log('found 3 pareils')
					ret = true
				}

			}
			if (!ret)
			{
				//Y.log('check pas pareils hand is '+hand.toSource())
				var numfound = 0
				var tempUp = 0
				var tempDown = 0
				var tempUpId = 0
				var tempDownId = 0
				var i_reset = false
				for (var i = 0 ; i < hand.length ; i++)
				{
					var cv = cardviews[hand[i]]
					//Y.log('doing card '+hand[i])
					var cvm = cv.get('model')
					var ingrp = cvm.get('ingroup')
					//Y.log('ingroup:'+ingrp)
					//if (ingrp!=0 && ingrp!=undefined) continue					
					if (cvm.get('id')==cid) continue
					
					if (tempUpId==cvm.get('id')) continue
					if (tempDownId==cvm.get('id')) continue
					
					var tnum = parseInt(cvm.get('number'))
					var ttype = cvm.get('type')
					//Y.log('Check if before : '+(tnum+1)+' VS '+pnum)
					if (tnum+1==pnum && ptype==ttype)
					{
						numfound++
						//Y.log('Found one:'+tnum+' is before '+pnum+' and same type')
					}
					//Y.log('Check if after : '+(tnum-1)+' VS '+pnum)
					if (tnum-1==pnum && ptype==ttype)
					{
						numfound++
						//Y.log('Found one:'+tnum+' is after '+pnum+' and same type')
					}
					if (numfound>1)
					{
						//Y.log('Passed 1')
						ret = true
					}

					if (tnum+1==pnum && ptype==ttype)
					{
						//Y.log('tempDown is now '+tnum)
						tempDown = tnum
						tempDownId = cvm.get('id')
						if (!i_reset)
						{
							i=0
							i_reset=true
						}
						
					}
					if (tnum-1==pnum && ptype==ttype)
					{
						//Y.log('tempUp is now '+tnum)
						tempUp = tnum
						tempUpId = cvm.get('id')
						if (!i_reset)
						{
							i=0
							i_reset=true
						}
					}
					//if (tempUp!=0)
					//Y.log('ABABA '+(tnum-1)+' VS tempUp '+tempUp)
					if (tempUp!=0 && (tnum-1)==tempUp && ptype==ttype)
					{
						//Y.log('GOT IT: tempUp:'+tempUp+' tnum:'+tnum+' tnum-1:'+(tnum-1))
						ret=true
					}
					//if (tempDown!=0)
					//Y.log('ABABO '+(tnum-1)+' VS tempDown '+tempDown)
					if (tempDown!=0 && (tnum+1)==tempDown && ptype==ttype)
					{
						//Y.log('GOT IT: tempDown:'+tempDown+' tnum:'+tnum+' tnum+1:'+(tnum+1))
						ret=true
					}
				}
				//if (!ret) Y.log('FALSE')
			}
			return ret

		},
		getGroupById:function(group_id)
		{
			var gr = this.get('model').get('groups')
			for (var i = 0 ; i < gr.length ; i++)
			{
				if (gr[i].get('model').get('id')==group_id)
					return gr[i]
			}
		},
		addGroup:function(cardid,group_id)
		{
			var w = this.get('model').get('width')
			var groups = this.get('model').get('groups');
			var div = w/5
			var ind = 0
			var myid = group_id
			if (group_id==0)
				 myid = makeid()

			var g
			if (cardid==0)
				g = new Y.Group({id:myid,x:this.currentColumn,y:this.currentRow,cards:[]})
			else
				g = new Y.Group({id:myid,x:this.currentColumn,y:this.currentRow,cards:[cardid]})
			var gv = new Y.GroupView({model:g})
			gv.pending_counter = 1
			Y.one('#group_area').append(gv.get('container'))
			var aa = this.get('model').get('groups');
			aa.push(gv)
			this.get('model').set('groups',aa)

			this.currentColumn+=groups_spacing_x
			if (this.currentColumn>900)
			{
				this.currentColumn=10
				this.currentRow+=groups_spacing_y;
			}

			if (cardid==0) return gv

			var cardview = cardviews[cardid]
			cardview.get('model').set('ingroup',group_id)
			cardview.image.setStyle('display','block')
			cardview.image.setStyle('cursor','default')
			
			var ind = hand.indexOf(cardid)


			if (ind!=-1)
			{
				hand.splice(ind,1)
				game.socket.send('c.uh.'+JSON.stringify(hand))
			}

			this.render();
			return gv
		},
		addCardsToGroup:function(groupid,cardids)
		{
			var groups = this.get('model').get('groups');

			for (var i = 0 ; i < groups.length ; i++)
			{
				if (groups[i].get('model').get('id')==groupid)
				{
					var c = groups[i].get('model').get('cards')
					var changed = false
					for (var j = 0 ; j < cardids.length ; j++)
					{
						c.push(cardids[j])
						var cardview = cardviews[cardids[j]]
						cardview.image.setStyle('display','block')
						cardview.image.setStyle('cursor','default')
						cardview.get('model').set('ingroup',groupid)
						groups[i].get('model').set('cards',c)
						groups[i].pending_counter++

						if (groups[i].pending_counter>=3)
						{
							groups[i].pending_complete = true
						}
					}
					groups[i].render()
					break;
				}
			}
		},
		render: function()
		{
			var groups = this.get('model').get('groups')
			for (var i = 0 ; i < groups.length ; i++)
			{
				groups[i].render()
			}
			return this
		}
	});

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

}, '1.0', {requires: ['json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});