var Realtime = (function() {

	function Realtime(options) {
		if(!(this instanceof Realtime)){
			return new Realtime(options);
		}

		Logger.logAction(Logger.LOG_MINOR, 'Realtime()', '');
		Rest.call(this, options);
		this.connection = new Connection(this, this.options);
		this.channels = new Channels(this);
		if(options.autoConnect !== false)
			this.connect();
	}
	Utils.inherits(Realtime, Rest);

	Realtime.prototype.connect = function() {
		Logger.logAction(Logger.LOG_MINOR, 'Realtime.connect()', '');
		this.connection.connect();
	};

	Realtime.prototype.close = function() {
		Logger.logAction(Logger.LOG_MINOR, 'Realtime.close()', '');
		this.connection.close();
	};

	function Channels(realtime) {
		EventEmitter.call(this);
		this.realtime = realtime;
		this.all = {};
		this.inProgress = {};
		var self = this;
		realtime.connection.connectionManager.on('transport.active', function(transport) { self.onTransportActive(transport); });
	}
	Utils.inherits(Channels, EventEmitter);

	Channels.prototype.onChannelMessage = function(msg) {
		var channelName = msg.channel;
		if(channelName === undefined) {
			Logger.logAction(Logger.LOG_ERROR, 'Channels.onChannelMessage()', 'received event unspecified channel, action = ' + msg.action);
			return;
		}
		var channel = this.all[channelName];
		if(!channel) {
			Logger.logAction(Logger.LOG_ERROR, 'Channels.onChannelMessage()', 'received event for non-existent channel: ' + channelName);
			return;
		}
		channel.onMessage(msg);
	};

	/* called when a transport becomes connected; reattempt attach()
	 * for channels that may have been inProgress from a previous transport */
	Channels.prototype.onTransportActive = function() {
		for(var channelId in this.inProgress) {
			if(this.inProgress[channelId] > 0) {
				this.all[channelId].checkPendingState();
			}
		}
	};

	Channels.prototype.setSuspended = function(err) {
		for(var channelId in this.all) {
			var channel = this.all[channelId];
			channel.setSuspended(err);
		}
	};

	Channels.prototype.get = function(name, channelOptions) {
		name = String(name);
		var channel = this.all[name];
		if(!channel) {
			channel = this.all[name] = new RealtimeChannel(this.realtime, name, channelOptions);
		} else if(channelOptions) {
			channel.setOptions(channelOptions);
		}
		return channel;
	};

	Channels.prototype.release = function(name) {
		var channel = this.all[name];
		if(channel) {
			delete this.all[name];
		}
	};

	Channels.prototype.setInProgress = function(channel, inProgress) {
		if(inProgress) {
			this.inProgress[channel.name] = this.inProgress[channel.name] || 0;
			this.inProgress[channel.name]++;
		} else {
			this.inProgress[channel.name]--;
			if(this.hasNopending) {
				this.emit('nopending');
			}
		}
	};

	Channels.prototype.onceNopending = function(listener) {
		if(this.hasNopending()) {
			listener();
			return;
		}
		this.once('nopending', listener);
	};

	Channels.prototype.hasNopending = function() {
		return Utils.arrEvery(Utils.valuesArray(this.inProgress, true), function(numLocks) {
			return numLocks === 0;
		});
	};

	return Realtime;
})();
