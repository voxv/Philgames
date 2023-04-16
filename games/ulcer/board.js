YUI.add("board", function(Y) {

var parrframe = parent;
var parrapp = parent.app.get('activeView');
var grid = [
				[378,942],[314,862],[271,783],[230,690],[25,261],[34,183],[77,122],
				[133,69],[195,28],[270,20],[344,20],[419,20],[493,28],[554,68],
				[610,123],[652,184],[662,259],[662,334],[662,408],[657,486],[616,550],
				[561,606],[500,647],[423,657],[346,657],[269,657],[192,648],[131,608]
			]
var gridhomes = [
				[[17,563],[49,604],[87,640],[128,673]],
				[[132,14],[91,44],[53,84],[21,124]],
				[[673,124],[644,82],[607,41],[565,14]],
				[[571,673],[613,640],[655,601],[683,558]]
		]
var gridgoals = [
				[[131,558],[169,518],[210,481],[248,440]],
				[[131,123],[171,164],[212,200],[253,237]],
				[[565,123],[524,158],[491,200],[449,237]],
				[[570,559],[532,518],[491,481],[449,440]]
		]
var adj_homes = [
				{28:[1,-15],29:[0,-14],30:[0,-14],31:[1,-13]},
				{32:[0,-13],33:[0,-12],34:[2,-13],35:[1,-13]},
				{36:[5,-15],37:[0,-13],38:[1,-8],39:[2,-10]},
				{40:[2,-13],41:[3,-12],42:[-1,-12],43:[1,-11]}
		]
var adj_goals = [
				{44:[1,-13],45:[1,-12],46:[-1,-14],47:[0,-12]},
				{48:[4,-11],49:[2,-12],50:[-1,-13],51:[-3,-13]},
				{52:[0,-12],53:[3,-9],54:[-1,-12],55:[3,-12]},
				{56:[0,-17],57:[1,-14],58:[2,-15],59:[6,-12]}
		]
var adj = [
				[5,-8],[4,-8],[4,-9],[4,-10],[4,-9],[7,-7],[4,-8],
				[5,-9],[5,-7],[5,-7],[7,-7],[7,-7],[6,-6],[8,-7],
				[7,-8],[6,-8],[8,-8],[9,-8],[10,-7],[7,-8],[8,-8],
				[8,-7],[5,-6],[5,-5],[7,-5],[5,-5],[5,-5],[5,-8],
			]
var gridopacity = 1;

	Y.BoardView = Y.Base.create('boardview',Y.View,[],
	{
		popperview:null,
		gridview:null,
		initializer: function()
		{
			var c = this.get('container');

			c.append('<img style="position:absolute; left:280px; top:0px; width:940px; height:940px;"  src="./images/board.png"/>');
			/*var popper = this.popperview = new Y.PopperView();
			popper.get('container').setStyle('position','absolute');
			popper.get('container').setStyle('left',popperposition[0]);
			popper.get('container').setStyle('top',popperposition[1]);
			c.append(popper.get('container'));*/

			var gv = this.gridview = new Y.BoardGridView();
			c.append(gv.get('container'));

			var pion_scale_offsetx = 0;
			var pion_scale_offsety = 5;

			var idPion = 0;
			for (var pid in players_info)
			{
				if (players_info.hasOwnProperty(pid))
				{
					playerpionviews[pid] = {}
					var player_home = this.gridview.gridsquareshome[players_info[pid]['color']];
					var count = 0;
					for (var j in player_home)
					{
						if (player_home.hasOwnProperty(j))
						{
							var adjy = adj_homes[players_info[pid]['color']][player_home[j].get('model').get('id')][1]+pion_scale_offsety
							var a = this.gridview.getGridSquarePos(j);
							var p = new Y.Pion({id:idPion, order:player_home[j].get('model').get('id'), x:a[0]+adj_homes[players_info[pid]['color']][player_home[j].get('model').get('id')][0],y:a[1]+adjy,width:pionw,height:pionh,color:colororder[players_info[pid]['color']]});
							var pv = new Y.PionView({model:p});
							playerpionviews[pid][idPion] = pv;
							//if (pid==players_info[game.players.self.id])
							//	Y.log('adding :'+idPion);
							playerByPionId[idPion] = pid;
							pionsMap[j] = pv;
							pionsMapByPionId[idPion] = pv;
							pionsMapGridCell[idPion] = j;

							c.append(pv.get('container'));
							count++;
							idPion++;
						}
					}

				}
			}
			playerPaths = this.buildPlayerPaths();

			this.anim_pion = new Y.Anim({
					node: null,
					from: { xy: [0,0] },
					to: {  xy: [0,0] },
					duration : speedmove,
					//easing: 'easeOutStrong'
				});

			// TO CHECK ADJ
			/*for (var i = 0 ; i < 28 ; i++)
			{
				var a = this.gridview.getGridSquarePos(i);
				var p = new Y.Pion({x:a[0]+adj[i][0],y:a[1]+adj[i][1]+pion_scale_offsety,width:pionw,height:pionh,color:'green'});
				var pv = new Y.PionView({model:p});
				c.append(pv.get('container'));
			}
			for (var i = 0 ; i < total_players ; i++)
			{
				var player_home = this.gridview.gridsquaresgoals[i];
				var count = 0;
				for (var j in player_home)
				{
					if (player_home.hasOwnProperty(j))
					{
						var adjy = adj_goals[i][count][1]+pion_scale_offsety
						var a = this.gridview.getGridSquarePos(j);
						var p = new Y.Pion({x:a[0]+adj_goals[i][count][0],y:a[1]+adjy,width:pionw,height:pionh,color:'blue'});
						var pv = new Y.PionView({model:p});
						c.append(pv.get('container'));
						count++;
					}
				}
			}*/
		},
		lightUp:function(col)
		{
			if (col!=2)
				return;
			var cc = Y.one('#lightupcol');
			var c = cc.one('img');

			var coord = {0:[],1:[],2:[810,20],3:[]}
			//c.empty();
			c.append('<img src="./images/l_'+colororder[col]+'.png" style="width:90px; height:89px;"/>');
			c.setAttribute('src','./images/l_'+colororder[col]+'.png');

			cc.setStyle('left',coord[col][0]);
			cc.setStyle('top',coord[col][1]);
			cc.setStyle('display','block');

		},
		showFinal:function()
		{
			thisapp.get('activeView').turnshowview.render();
			Y.one('#placement_message2').setStyle('display','none');
			var trophs = ['./images/trophy_gold.png','./images/trophy_silver.png','./images/trophy_bronze.png']
			var c = Y.one('#winlose');
			var cpaneltop = Y.Node.create('<div class="cpaneltop"></div>');
			var cpanelbottom = Y.Node.create('<div class="cpanelbottom"></div>');

			var ranks = [];
			var rankcount = 0;
			var winpl = '';
			//Y.log(wontrophees.toSource());
			for (var i = 0 ; i < 4 ; i++)
			{
				for (var plid in wontrophees)
				{
					if (wontrophees.hasOwnProperty(plid))
					{
						if (wontrophees[plid]==(i+1))
						{
							if (i==0)
								winpl=plid;
							ranks[rankcount++]=plid;
							break;
						}
					}
				}
			}

			var pname = players_info[winpl]['login_name'];
			var col = colora[players_info[winpl]['color']]
			cpaneltop.append('<span style="color:'+col+';">'+pname+'</span> a gagn&eacute; la partie! Bravo <span style="color:'+col+';">'+pname+'</span>!');

			var ct = 0;
			for (var i = 0 ; i < ranks.length ; i++)
			{
				var contm = Y.Node.create('<div>');
				var cont = '';

				cont = Y.Node.create('<div class="cpanelbottom_left"><img src="'+trophs[i]+'" style="margin-top:-4px; width:32px; height:38px; margin-top:10px;  margin-left:3px;"/></div>');
				contm.append(cont);
				var col = colora[players_info[ranks[i]]['color']]

				cont = Y.Node.create('<div class="cpanelbottom_right"><span style="color:'+col+';">'+players_info[ranks[i]]['login_name']+'</span></div>');
				contm.append(cont);
				cpanelbottom.append(contm);
				ct++;
			}

			for (var i in players_info)
			{
				if (players_info.hasOwnProperty(i))
				{
					var found=false;
					for (var j = 0 ; j < ranks.length ; j++)
					{
						if (ranks[j]==i)
						{
							found=true;
							break;
						}
					}
					if (!found)
					{
						if (players_info[game.players.self.id]==i)
						{
							parrapp.playAudio(GAME_NAME,'losegame')
						}
						var contm = Y.Node.create('<div>');
						var cont = null;
						if (ct<3)
						{
							cont = Y.Node.create('<div class="cpanelbottom_left"><img src="'+trophs[ct]+'" style="margin-top:-4px; width:32px; height:38px; margin-top:10px;  margin-left:3px;"/></div>');
							ct++

						}
						else
						{
							cont = Y.Node.create('<div class="cpanelbottom_left"><img src="./images/trans.png" style="width:32px; height:38px; margin-top:10px;  margin-left:3px;"/></div>');
						}
						contm.append(cont);
						var col = colora[players_info[i]['color']]
						cont = Y.Node.create('<div class="cpanelbottom_right"><span style="color:'+col+';">'+players_info[i]['login_name']+'</span></div>');
						contm.append(cont);
						cpanelbottom.append(contm);
					}
				}
			}



			c.append(cpaneltop);
			c.append(cpanelbottom);
			c.setStyle('display','block');

			setTimeout('parent.main_instance.socket.send(\'c.eg.\'); ',5000)

			//setTimeout('window.location.href = "'+THISPATH+'";',11000);

		},
		getAdjustments:function(cellid)
		{
				//if (adj[cellid]==undefined)
				//	Y.log(cellid)
				var adjx = adj[cellid][0]
				var adjy = adj[cellid][1]
				return [adjx,adjy]

		},
		getHomeAdjustments:function(playerid,cellid)
		{
				var adjx = adj_homes[players_info[playerid]['color']][cellid][0]
				var adjy = adj_homes[players_info[playerid]['color']][cellid][1]+5
				//Y.log(adj_homes[players_info[playerid]['color']].toSource())
				//Y.log('pionorder:'+pionorder);
				return [adjx,adjy]

		},
		getGoalAdjustments:function(playerid,cellid)
		{
				var adjx = adj_goals[players_info[playerid]['color']][cellid][0]
				var adjy = adj_goals[players_info[playerid]['color']][cellid][1]+5
				//Y.log(adj_homes[players_info[playerid]['color']].toSource())
				//Y.log('pionorder:'+pionorder);
				return [adjx,adjy]

		},
		doAdjust:function(playerid,startcellid)
		{
			var adjxstart = 0;
			var adjystart = 0

			if (this.gridview.isHome(startcellid))
			{
				var ad = boardview.getHomeAdjustments(playerid,startcellid)
				adjxstart = ad[0];
				adjystart = ad[1];
			}
			else if (this.gridview.isGoal(startcellid))
			{
				var ad = boardview.getGoalAdjustments(playerid,startcellid)
				adjxstart = ad[0];
				adjystart = ad[1];
			}
			else
			{
				var ad = boardview.getAdjustments(startcellid)
				adjxstart = ad[0];
				adjystart = ad[1];
			}
			return [adjxstart,adjystart]
		},
		doPionAnim:function(pionview,node,possource,posdest,freeind)
		{
			///Y.log('start:'+possource.toSource()+'  '+posdest.toSource()+' startposReturnHome:'+(startposReturnHome-1) );


			this.anim_pion.set('node',node);
			this.anim_pion.set('from',{ xy: [possource[0],possource[1]] });
			this.anim_pion.set('to',{ xy: [posdest[0],posdest[1]] });
			startposReturnHome--;
			var par = this;
			var listener = null;

			if (startposReturnHome>=1)
			{
				listener = this.anim_pion.on('end',function(e)
				{
					if (startposReturnHome<0) return;
					var n = this.get('node');
					var playerid = playerByPionId[pionview.get('model').get('id')];
					var pp = playerPaths[playerid];

					var startcellid = pp[startposReturnHome];
					var gv = par.gridview.allsquares[startcellid]
					var adj = par.doAdjust(playerid,startcellid);
					var gg = par.gridview.getGridSquarePos(startcellid);
					var currentx = parseInt(gg[0])+adj[0];
					var currenty = parseInt(gg[1])+adj[1];

					var endcellid = pp[(startposReturnHome-1)];
					gv = par.gridview.allsquares[endcellid]
					adj = par.doAdjust(playerid,endcellid);
					gg = par.gridview.getGridSquarePos(endcellid);
					var endx = parseInt(gg[0])+adj[0];
					var endy = parseInt(gg[1])+adj[1];

					par.doPionAnim(pionview,pionview.get('container'),[currentx+boardoffsetx,currenty+boardoffsety],[endx+boardoffsetx,endy+boardoffsety],freeind);
					listener.detach();
				});
			}
			else if (startposReturnHome==0)
			{
					var n = node;
					var playerid = playerByPionId[pionview.get('model').get('id')];
					var pp = playerPaths[playerByPionId[pionview.get('model').get('id')]];

					var startcellid = pp[startposReturnHome];
					var gv = par.gridview.allsquares[startcellid]
					var adj = par.doAdjust(playerid,startcellid);
					var currentx = parseInt(n.getStyle('left'))+adj[0];
					var currenty = parseInt(n.getStyle('top'))+adj[1];

					var endcellid = pp[0];
					gv = par.gridview.allsquares[endcellid]
					adj = par.doAdjust(playerid,endcellid);
					gg = par.gridview.getGridSquarePos(endcellid);
					var endx = parseInt(gg[0])+adj[0];
					var endy = parseInt(gg[1])+adj[1];

					//Y.log('LAST startposReturnHome:'+startposReturnHome+' next is:'+pp[0]+'  gridpos:'+gridpos.toSource());
					par.doPionAnim(pionview,pionview.get('container'),[currentx+boardoffsetx,currenty+boardoffsety],[endx+boardoffsetx,endy+boardoffsety],freeind);
			}
			else if (startposReturnHome==-1)
			{
				listener = this.anim_pion.on('end',function(e)
				{
					var n = node;
					var currentx = parseInt(n.getStyle('left'));
					var currenty = parseInt(n.getStyle('top'));

					var player_id = playerByPionId[pionview.get('model').get('id')]


					var homes = par.gridview.gridsquareshome[players_info[player_id]['color']];

					var count = 0;
					for (var i in homes)
					{
						if (homes.hasOwnProperty(i))
						{
							//Y.log('checking cellid:'+i);
							//Y.log(pionsMap[i].toSource());
							if (pionsMap[i]==0)
							{
								freeind = i;
								break;
							}
							else count++;
						}
					}
					//var pion_homescale_offsety = 5;
					//var adjxhome = adj_homes[players_info[player_id]['color']][count][0]
					//var adjyhome = adj_homes[players_info[player_id]['color']][count][1]+pion_homescale_offsety
					var gridpos = par.gridview.getGridSquarePos(freeind);
					var ad = boardview.getHomeAdjustments(player_id,pionview.get('model').get('order'))
					var adjx = ad[0];
					var adjy = ad[1];
					par.doPionAnim(pionview,pionview.get('container'),[currentx+boardoffsetx,currenty+boardoffsety],[gridpos[0]+boardoffsetx+adjx,gridpos[1]+boardoffsety+adjy],freeind);
					listener.detach();
					listener = par.anim_pion.on('end',function(e)
					{
						par.movePionToCell(pionview.get('model').get('id'),freeind,1);
						listener.detach();
					});
				});
			}
			this.anim_pion.run();
		},
		doPionMoveAnim:function(pionview,node,possource,posdest,pionToSendHome,destcell)
		{
			///Y.log('start:'+possource.toSource()+'  '+posdest.toSource()+' startposReturnHome:'+(startposReturnHome-1) );


			this.anim_pion.set('node',node);
			this.anim_pion.set('from',{ xy: [possource[0],possource[1]] });
			this.anim_pion.set('to',{ xy: [posdest[0],posdest[1]] });
			startposMoveAnim++;
			var par = this;
			var listener = null;

			if (startposMoveAnim<endposMoveAnim)
			{

				listener = this.anim_pion.on('end',function(e)
				{
					if (startposMoveAnim<0) return;
					var n = this.get('node');
					var playerid = playerByPionId[pionview.get('model').get('id')];
					var pp = playerPaths[playerid];

					var startcellid = pp[startposMoveAnim];
					var gv = par.gridview.allsquares[startcellid]
					var adj = par.doAdjust(playerid,startcellid);
					var gg = par.gridview.getGridSquarePos(startcellid);
					var currentx = parseInt(gg[0])+adj[0];
					var currenty = parseInt(gg[1])+adj[1];

					var endcellid = pp[(startposMoveAnim+1)];
					gv = par.gridview.allsquares[endcellid]
					adj = par.doAdjust(playerid,endcellid);
					gg = par.gridview.getGridSquarePos(endcellid);
					var endx = parseInt(gg[0])+adj[0];
					var endy = parseInt(gg[1])+adj[1];

					par.doPionMoveAnim(pionview,pionview.get('container'),[currentx+boardoffsetx,currenty+boardoffsety],[endx+boardoffsetx,endy+boardoffsety],pionToSendHome,destcell);
					listener.detach();

				});
			}
			else if (startposMoveAnim==endposMoveAnim)
			{
				listener = this.anim_pion.on('end',function(e)
				{
					var n = node;
					var currentx = parseInt(n.getStyle('left'));
					var currenty = parseInt(n.getStyle('top'));

					var player_id = playerByPionId[pionview.get('model').get('id')]

					var isAtGoalBefore = pionview.isAtGoal();
					par.movePionToCell(pionview.get('model').get('id'),destcell,0);
					if (pionview.isAtGoal() && !isAtGoalBefore)
					{
						parrapp.playAudio(GAME_NAME,'ingoal')
					}
					if (pionToSendHome!=-1)
					{
						var pv = pionsMapByPionId[pionToSendHome];
						var owner = playerByPionId[pionToSendHome];
						if (owner==game.players.self.id)
						{
							parrapp.playAudio(GAME_NAME,'backtohome')
						}
						boardview.triggerReturnHome(pv);
					}
					else
					{
						is_in_anim = false
					}
					listener.detach();
				});
			}

			this.anim_pion.run();
		},
		moveAnim:function(data)
		{
			//Y.log(data.toSource())
			var fromcellid = data['from']
			var tocellid = data['to']
			var returntohome = data['returntohome']

			var pionToSendHome = -1;
			if (returntohome && pionsMap[tocellid]!=undefined && pionsMap[tocellid]!=0)
			{
				pionToSendHome = pionsMap[tocellid].get('model').get('id');
			}
			//Y.log('moveAnim from:'+fromcellid+' to:'+tocellid);
			/*if (pionsMap[fromcellid]==undefined)
			{
				Y.log('pionMap['+fromcellid+'] is undefined');
				for (var i in pionsMap)
				{
					if (pionsMap.hasOwnProperty(i))
					{
						console.log('pionsMap['+i+']:'+pionsMap[i])
					}
				}
			}*/
			//Y.log('triggerMoveAnim from:'+fromcellid+' ('+pionsMap[fromcellid].get('model').get('id')+') to:'+tocellid+ ' ('+pionsMap[fromcellid].get('model').get('id')+') ');
			//if (!pionsMap[fromcellid] || pionsMap[fromcellid]==undefined)
				//Y.log('pionMap undefined '+fromcellid+' '+JSON.stringify(data))

			//Y.log('triggerMoveAnim: fromcellid:'+fromcellid+' ('+pionsMap[fromcellid]+') tocellid:'+tocellid)
			this.triggerMoveAnim(pionsMap[fromcellid],tocellid,pionToSendHome)

		},
		triggerMoveAnim:function(pv,tocellid,pionToSendHome)
		{
			//Y.log('PV:'+pv)
			//Y.log('got pvid:'+pv.get('model').get('id'))
			var par = this;
			var m = pv.get('model');
			var c = pv.get('container');
			var pp = playerPaths[playerByPionId[m.get('id')]];

			var playerid = playerByPionId[m.get('id')];
			var startcell = pv.getCell();
			//var endcell = pionsMap[tocellid].getCell();
			var endcell = tocellid;
			//Y.log('startcell:'+startcell+' getPathPosFromCell:'+parseInt(this.getPathPosFromCell(pp,startcell)))
			startposMoveAnim = parseInt(this.getPathPosFromCell(pp,startcell));
			endposMoveAnim = parseInt(this.getPathPosFromCell(pp,endcell));
			//Y.log('startposMoveAnim: '+startposMoveAnim+' pp[startposMoveAnim]:'+pp[(startposMoveAnim)]);
			//Y.log(pp.toSource());
			if (pv.isAtHome())
				pp['-1'] = startcell;
			var startcellid = pp[startposMoveAnim];
			var gv = par.gridview.allsquares[startcellid]
			var adj = par.doAdjust(playerid,startcellid);
			var gg = par.gridview.getGridSquarePos(startcellid);
			var currentx = parseInt(gg[0])+adj[0];
			var currenty = parseInt(gg[1])+adj[1];

			//Y.log('startposMoveAnim: '+startposMoveAnim+' pp[startposMoveAnim]:'+pp[(startposMoveAnim+1)]);
			//Y.log(pp.toSource());
			var endcellid = pp[(startposMoveAnim+1)];
			gv = par.gridview.allsquares[endcellid]
			adj = par.doAdjust(playerid,endcellid);
			gg = par.gridview.getGridSquarePos(endcellid);
			var endx = parseInt(gg[0])+adj[0];
			var endy = parseInt(gg[1])+adj[1];

			pv.get('container').setStyle('zIndex',40);
			this.anim_pion.set('duration',speedmove);
			par.doPionMoveAnim(pv,pv.get('container'),[currentx+boardoffsetx,currenty+boardoffsety],[endx+boardoffsetx,endy+boardoffsety],pionToSendHome,tocellid);

		},
		triggerReturnHome:function(pv)
		{
			par = this;
			var m = pv.get('model');
			var c = pv.get('container');
			var pp = playerPaths[playerByPionId[m.get('id')]];
			var playerid = playerByPionId[m.get('id')];
			var startcell = pv.getCell();


			startposReturnHome = parseInt(this.getPathPosFromCell(pp,startcell));
			//Y.log('startposReturnHome:'+startposReturnHome);
			var freehome=-1;
			if (pp[(startposReturnHome-1)]==undefined)
			{
					var homes = par.gridview.gridsquareshome[players_info[playerid]['color']];

					var count = 0;
					for (var i in homes)
					{
						if (homes.hasOwnProperty(i))
						{
							if (pionsMap[i]==0)
							{
								freehome = i;
								break;
							}
							else count++;
						}
					}
			}
			if (freehome!=-1)
				pp['-1'] = freehome;
			var startcellid = pp[startposReturnHome];
			var gv = par.gridview.allsquares[startcellid]
			var adj = par.doAdjust(playerid,startcellid);
			var gg = par.gridview.getGridSquarePos(startcellid);
			var currentx = parseInt(gg[0])+adj[0];
			var currenty = parseInt(gg[1])+adj[1];

			var endcellid = pp[(startposReturnHome-1)];
			gv = par.gridview.allsquares[endcellid]
			adj = par.doAdjust(playerid,endcellid);
			gg = par.gridview.getGridSquarePos(endcellid);
			var endx = parseInt(gg[0])+adj[0];
			var endy = parseInt(gg[1])+adj[1];

			pv.get('container').setStyle('zIndex',40);
			this.anim_pion.set('duration',speedreturnhome);
			par.doPionAnim(pv,pv.get('container'),[currentx+boardoffsetx,currenty+boardoffsety],[endx+boardoffsetx,endy+boardoffsety],-1);


		},
		movePionToCell:function(pion_id,cell_id,noreplace)
		{
			var pv = pionsMapByPionId[pion_id]
			pv.moveToCell(cell_id,noreplace);
			pv.get('container').setStyle('zIndex',30);


		},
		buildPlayerPaths:function()
		{
			var ret = {};
			var totcells = 28;
			var goalstart = 44;
			for (var pid in players_info)
			{
				if (players_info.hasOwnProperty(pid))
				{
					ret[pid]={};
					var ind = 0;
					var count = players_info[pid]['color']*7;
					for (var i = 0 ; i < totcells ; i++)
					{
						ret[pid][ind++] = count;
						count = (count+1)%totcells;

					}
					var countgoals = 44+players_info[pid]['color']*4;
					for (var i = 0 ; i < 4 ; i++)
					{
						ret[pid][ind++] = countgoals;
						countgoals = (countgoals+1);

					}
				}
			}
			return ret;
		},
		getPionAtCell:function(cellid)
		{
			var player = '';
			if (pionsMap[cellid] && pionsMap[cellid]!=undefined && pionsMap[cellid]!=0)
			{
				return { 'pionview':pionsMap[cellid], 'owner':playerByPionId[pionsMap[cellid].get('model').get('id')] };
			}
			return { 'pionview':0, 'owner':'' };

		},
		checkMoves:function(num)
		{
			var possibleMoves = {}


			var pions = playerpionviews[game.players.self.id];


			//Y.log(pions.toSource())

			var canplay = false;
			for (var id in pions)
			{
				if (pions.hasOwnProperty(id))
				{
					//Y.log('Check pion:'+id)
					var pv = pions[id];
					possibleMoves[id] = -1;
					var pp = playerPaths[game.players.self.id]
					//Y.log('My playerPaths:'+pp.toSource())
					//Y.log('this pion:'+pv.get('model').get('id'))
					if (pv.isAtHome())
					{
						//Y.log('Pion '+pv.get('model').get('id')+' is at home')
						if (num==6)
						{

							var otherpion = this.getPionAtCell(pp[0]);
							var blockedByOwn = false;
							if (otherpion['pionview']!=0 && otherpion['owner']==game.players.self.id)
							{
								blockedByOwn = true;
							}
							if (!blockedByOwn)
							{
								possibleMoves[id]=pp[0];
								pv.canplay = 1;
								canplay = true;
							}
							else
							{
								pv.canplay = 0;
							}
						}
					}
					else
					{
						//Y.log('Pion '+pv.get('model').get('id')+' is not at home')
						var startcell = pv.getCell();
						var busted = false;
						var startpos = this.getPathPosFromCell(pp,startcell);
						var st = parseInt(startpos);
						var newpos = st+num
						if (newpos>=32)
							busted = true;
						var otherpion = this.getPionAtCell(pp[newpos]);

						var blockedByOwn = false;
						if (otherpion['pionview']!=0 && otherpion['owner']==game.players.self.id)
						{
								blockedByOwn = true;
						}
						if (!busted && !blockedByOwn)
						{
							possibleMoves[id]=pp[newpos];
							canplay = true;
							pv.canplay = 1;
						}
						else
						{
							pv.canplay = 0;
						}
					}
				}
			}
			if (!canplay) return 0;
			return possibleMoves;
		},
		getPathPosFromCell:function(path,cellid)
		{
			for (var i in path)
			{
				if (path.hasOwnProperty(i))
				{
					//Y.log('checking path pos:'+i+' cellid:'+path[i]+' looking for:'+cellid);
					if (path[i]==cellid)
						return i;

				}
			}
			return -1;

		},
		render: function()
		{
			return this;
		}
	});
	Y.BoardGridView = Y.Base.create('boardgridview',Y.View,[],
	{
		gridsquares:{},
		gridsquareshome:{},
		gridsquaresgoals:{},
		allsquares:[],
		initializer: function()
		{
			var c = this.get('container');
			var w = 60;
			for (var i = 0 ; i < 28 ; i++)
			{
				var g = grid[i];
				var sv = this.gridsquares[i] = new Y.GridSquareView({model:new Y.GridSquare({id:i,left:g[0],top:g[1],width:w})})
				this.allsquares[i] = sv;
				c.append(sv.get('container'));
			}
			/*var countid = 28;
			var w = 40;
			for (var player_id = 0 ; player_id < 4 ; player_id++)
			{
				this.gridsquareshome[player_id]={}
				var g = gridhomes[player_id];
				for (j = 0 ; j < 4 ; j++)
				{
					var sv = this.gridsquareshome[player_id][countid] = new Y.GridSquareView({model:new Y.GridSquare({id:countid,left:g[j][0],top:g[j][1],width:w})})
					this.allsquares[countid] = sv;
					c.append(sv.get('container'));
					countid++;
				}

			}
			var countid = 44;
			var w = 40;
			for (var player_id = 0 ; player_id < 4 ; player_id++)
			{
				this.gridsquaresgoals[player_id]={}
				var g = gridgoals[player_id];
				for (j = 0 ; j < 4 ; j++)
				{
					var sv = this.gridsquaresgoals[player_id][countid] = new Y.GridSquareView({model:new Y.GridSquare({id:countid,left:g[j][0],top:g[j][1],width:w})})
					this.allsquares[countid] = sv;
					c.append(sv.get('container'));
					countid++;
				}

			}*/
		},
		getCellByPos: function(pos)
		{
			for (var i = 0 ; i < this.allsquares.length ; i++)
			{
					var sv = this.allsquares[i];
					if (sv.contain(pos[0],pos[1]))
						return sv.get('model').get('id');
			}


		},
		getCellByPosWide: function(pos)
		{
			 	for (var i in possible_moves)
			 	{
					if (possible_moves.hasOwnProperty(i))
					{
						if (possible_moves[i]!=-1)
						{
							//Y.log('good possible move:'+possible_moves[i]+'('+i+')');
							var sv = this.allsquares[possible_moves[i]];
							if (sv.containWide(pos[0],pos[1]))
								return sv.get('model').get('id');
						}
					}
				}

		},
		isHome:function(cellid)
		{
			var found = false;
			for (var pl in this.gridsquareshome)
			{
				if (this.gridsquareshome.hasOwnProperty(pl))
				{
					for (var i in this.gridsquareshome[pl])
					{
						if (this.gridsquareshome[pl].hasOwnProperty(i))
						{
							if (i==cellid)
							{
								found=true;
								break;
							}



						}
					}
					if (found) break;
				}
			}
			return found;
		},
		isGoal:function(cellid)
		{
			var found = false;
			for (var pl in this.gridsquaresgoals)
			{
				if (this.gridsquaresgoals.hasOwnProperty(pl))
				{
					for (var i in this.gridsquaresgoals[pl])
					{
						if (this.gridsquaresgoals[pl].hasOwnProperty(i))
						{
							if (i==cellid)
							{
								found=true;
								break;
							}



						}
					}
					if (found) break;
				}
			}
			return found;
		},
		getGridSquarePos:function(square_id)
		{
			if (this.allsquares[square_id]==undefined) {  return -1; }
			var m = this.allsquares[square_id].get('model');
			return [parseInt(m.get('left')),parseInt(m.get('top'))]

		},
		snap: function(l,t)
		{
			var m_row = this.gridrows[10];
			var nid = m_row.contain(l,t);
			return nid;
		},
		render: function()
		{
			return this;
		}
	});
	Y.GridSquare = new Y.Base.create('gridsquare',Y.Model,[],
	{
		ATTRS:
		{
			id:{ value:0 },
			left: { value:0 },
			top:{ value:0 },
			width:{ value:0 }
		}
	});
	Y.GridSquareView = Y.Base.create('gridsquareview',Y.View,[],
	{
		initializer: function()
		{
			var c = this.get('container');
			var m = this.get('model');
			var offset = 0
			var n = Y.Node.create('<div style="width:'+m.get('width')+'px; height:'+m.get('width')+'px; opacity:'+gridopacity+'; position:absolute; background-color:#33ff5f; top:'+(m.get('top')-offset)+'px; left:'+(m.get('left')-offset)+'px;"></div>');
			//Y.log('<div style="width:'+m.get('width')+'px; height:'+m.get('width')+'px; opacity:0.3; position:absolute; background-color:#33ff5f; top:'+m.get('top')+'px; left:'+m.get('left')+'px;"></div>')
			n.setHTML(m.get('id'));
			c.append(n);

		},
		tostring: function()
		{
			var m = this.get('model');
			//Y.log('ID:'+m.get('id'));
			return this;
		},
		render: function()
		{
			return this;
		},
		contain: function(l,t)
		{
			var m = this.get('model');


			var ll = m.get('left')+150
			var tt = m.get('top')-10
			var ww = m.get('width')
			//Y.log('L: if '+l+'>'+ll+' && '+l+'<'+(ll+ww))
			//Y.log('T: if '+t+'>'+tt+' && '+t+'<'+(tt+ww))

			var rr = false;


			if (l>ll && l < (ll+ww) && t>tt && t < (tt+ww))
			{

				return true
			}
			return false;
		},
		containWide: function(l,t)
		{
			var m = this.get('model');


			var ll = m.get('left')+150-50
			var tt = m.get('top')-10-40
			var ww = m.get('width')+100
			var hh = m.get('width')+60
			//Y.log('L: if '+l+'>'+ll+' && '+l+'<'+(ll+ww))
			//Y.log('T: if '+t+'>'+tt+' && '+t+'<'+(tt+ww))

			var rr = false;


			if (l>ll && l < (ll+ww) && t>tt && t < (tt+hh))
			{

				return true
			}
			return false;
		}
	});


}, '1.0', {requires: ['gallery-audio','popper','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});