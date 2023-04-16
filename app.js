const http         = require('http'),
      fs           = require('fs'),
      io           = require('socket.io'),
      UUID         = require('node-uuid'),
      path         = require('path'),
      verbose         = false,
      env          = process.env;
	var express = require('express');
	var  app = express()

	const server = http.createServer(app)


	app.get( '/', function( req, res ){
        res.sendFile( '/index.html' , { root:__dirname });
    });
	app.get( '/health', function( req, res ){
	    res.writeHead(200);
	    res.end();
    });
    app.get( '/', function( req, res ){
        res.sendFile( '/index.html' , { root:__dirname });
    });
    app.get( 'games/lobby', function( req, res ){
		res.sendFile( 'games/lobby/index.html' , { root:__dirname });
    });
    app.get( 'games/rubik', function( req, res ){
        res.sendFile( 'games/rubik/index.html' , { root:__dirname });
    });
    app.get( 'games/battleship', function( req, res ){
        res.sendFile( 'games/battleship/index.html' , { root:__dirname });
    });
    app.get( 'games/yum', function( req, res ){
        res.sendFile( 'games/yum/index.html' , { root:__dirname });
    });
    app.get( 'games/mastermind', function( req, res ){
        res.sendFile( 'games/mastermind/index.html' , { root:__dirname });
    });
    app.get( 'games/rummy', function( req, res ){
        res.sendFile( 'games/rummy/index.html' , { root:__dirname });
    });
    app.get( 'games/trouble', function( req, res ){
        res.sendFile( 'games/trouble/index.html' , { root:__dirname });
    });
    app.get( 'games/uno', function( req, res ){
        res.sendFile( 'games/trouble/index.html' , { root:__dirname });
    });
    app.get( 'games/boggle', function( req, res ){
        res.sendFile( 'games/boggle/index.html' , { root:__dirname });
    });
    app.get( 'games/ulcer', function( req, res ){
        res.sendFile( 'games/ulcer/index.html' , { root:__dirname });
    });
	app.get('/healthcheck', (req, res) => {
		res.status(200).json({
			status: 'OK',
			message: 'Server is up and running'
		});
	});
    app.get( '/*' , function( req, res, next ) {
        var file = req.params[0];

        if(verbose) console.log('File requested : ' + file);
        res.sendFile( __dirname + '/' + file );
    });

	var sio = new io.Server(server);



    //var sio = io.listen(server);

    var game_server = require('./server/server.js');

	sio.on('connection', function (client)
	{
    	client.userid = UUID();
    	client.current_room = ''
		game_server.logPlayer(client);

        client.on('disconnect', function () {
            if(client.userid)
                game_server.removeProfile(client);
        });

		client.on('subscribe', function(room)
		{
			console.log('Player '+client.myprofile.id+ ' is joining', room);
			client.join(room);
			client.current_room = room
			client.removeAllListeners("message");
			client.on('message', function(m) {

				eval("game_server.onMessage_"+room+"(client, m)");

			});
		});

		client.on('unsubscribe', function(room) {
			//console.log('Player '+client.myprofile.id+ ' is leaving', room);
			client.leave(room);
			client.current_room = ''
		});
	 });

	//console.log(env.NODE_IP)
	//server.listen(env.PORT || 8080, env.NODE_IP || '0.0.0.0', function () {
		server.listen(3000);
  console.log(`woot Application worker ${process.pid} started... port is:`+env.PORT );
//});

