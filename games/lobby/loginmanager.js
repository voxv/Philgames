YUI.add("loginmanager", function(Y) {

	var parrframe = parent

	Y.LoginManagerView = Y.Base.create('loginmanagerview',Y.View,[],
	{
		createnew_text:null,
		createnew_tot:null,
		initializer: function(){  this.render(); },
		profiles:{ },
		createProfile:function()
		{
			var login_name = this.createnew_text.get('value');
			if (login_name.length<1) { alert('Tu dois ecrire ton nom'); return; }

			this.createnew_tot.setStyle('display','none');

			var count = 0;
			var ind = 0;
			for (var i in this.profiles)
			{
				if (this.profiles.hasOwnProperty(i))
				{
					count = Math.max(count,i)
					ind++;
				}
			}
			this.profiles[(count+1)] = login_name

			saveInCache('profiles',this.profiles)
			this.render();
		},
		checkkey: function(e)
		{
			if (e.keyCode === 13) this.createProfile();
		},
		events: {
			'#createnew': {keypress: 'checkkey'}
		},
		render: function()
		{
			var m = this.get('model');
			var c = this.get('container');

			var profiles = this.profiles = getFromCache('profiles') || {};

			var profiles_tot = Y.Node.create('<div class="profilemanager_tot"></div>');
			var phead = Y.Node.create('<div class="profilemanager_head">Choisis un profil</div>');
			profiles_tot.append(phead);

			if (profiles)
			{
				for (var i in profiles)
				{
					if (profiles.hasOwnProperty(i))
					{
						var pnamediv = Y.Node.create('<div style="float:left; width:175px; cursor:pointer; text-align:left; margin-left:11px; ">'+profiles[i]+'</div>');

						var f = function(e)
						{
							var login_name = e.currentTarget.get('innerHTML');
							parent.main_instance.login_name = login_name;
							lobby_instance.login_name = login_name;
							parrframe.app.get('activeView').playAudio('rubik','click');
							app.navigate('/');
						}
						pnamediv.on('mousedown', f);
						pnamediv.on('touchstart',f);
						var trashdiv =  Y.Node.create('<div style="padding-right:15px; float:right; width:16px; padding-top:20px; cursor:pointer;"></div>');
						var trash = Y.Node.create('<img id="p_'+i+'" src="./images/trash.png" style="width:24px; height:24px;"/>');
						trashdiv.append(trash);

						trashdiv.on('mouseover', function(e)
						{
							e.currentTarget.one('img').set('src','./images/trash_hover.png');
						});
						trashdiv.on('mouseout', function(e)
						{
							e.currentTarget.one('img').set('src','./images/trash.png');
						});

						var oneprofile = Y.Node.create('<div class="profilemanager_oneprofile"></div>');
						oneprofile.on('mouseover', function(e)
						{
							e.currentTarget.setStyle('backgroundColor','#444477');
						});
						oneprofile.on('mouseout', function(e)
						{
							e.currentTarget.setStyle('backgroundColor','#222255');
						});


						oneprofile.append(pnamediv);
						oneprofile.append(trashdiv);
						profiles_tot.append(oneprofile);

						var parr = this

						var f = function(e)
						{
							var idt = e.currentTarget.one('img').get('id').split('p_');

							idtt = parseInt(idt[1])
							removeFromCache('profiles');
							delete parr.profiles[idtt]

							saveInCache('profiles',parr.profiles);
							parr.render();
						}
						trashdiv.on('click',f);
						trashdiv.on('touchstart',f);
					}
				}
			}
			var createnew_button  = Y.Node.create('<div class="profilemanager_createnew_button">Cr&eacute;er un nouveau profil</div>');

			createnew_button.on('mouseover', function(e)
			{
				e.currentTarget.setStyle('color','#eeeeff');
			});
			createnew_button.on('mouseout', function(e)
			{
				e.currentTarget.setStyle('color','#aaaaaa');
			});
			var createnew_tot  = this.createnew_tot = Y.Node.create('<div class="profilemanager_createnew_tot"></div>');
			var createnew_textdiv = Y.Node.create('<div class="profilemanager_createnew_text"></div>');

			var dd = Y.Node.create('<div style="text-align:left; margin-top:5px;"> </div>');
			var sp = Y.Node.create('<span style="color:#aaaaaa; margin-right:4px;">Nom:</span>');
			var createnew_text = this.createnew_text = Y.Node.create('<input type="text" id="createnew" maxlength="10" size="22"/>');
			dd.append(sp)
			dd.append(createnew_text)
			createnew_textdiv.append(dd);

			var ind = 0;
			for (var i in this.profiles)
			{
				if (this.profiles.hasOwnProperty(i))  ind++;
			}
			if (ind<4)
			{
				createnew_tot.append(createnew_textdiv)
				profiles_tot.append(createnew_button);
				profiles_tot.append(createnew_tot);
			}
			c.append(profiles_tot);

			var parr = this;

			var f = function(e)
			{
				createnew_tot.setStyle('display','block');
			}
			createnew_button.on('click',f)
			createnew_button.on('touchstart', f)
			return this
		}
	});

}, '1.0', {requires: ['json-parse','json-stringify','console','app','node','model','model-list','view', 'io','cookie']});