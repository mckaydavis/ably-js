var SessionStorage = (function() {
	var supported = !!((typeof(window) == 'object') && window.sessionStorage);
	var noop = function() {};
	function SessionStorage() {}

	SessionStorage.supported = supported;

	SessionStorage.set = supported ? function(name, value, ttl) {
		var wrappedValue = {value: value};
		if(ttl) {
			wrappedValue.expires = Utils.now() + ttl;
		}
		return window.sessionStorage.setItem(name, JSON.stringify(wrappedValue));
	} : noop;

	SessionStorage.get = supported ? function(name) {
		var rawItem = window.sessionStorage.getItem(name);
		if(!rawItem) return null;
		var wrappedValue = JSON.parse(rawItem);
		if(wrappedValue.expires && (wrappedValue.expires < Utils.now())) {
			var now = Utils.now()
			window.sessionStorage.removeItem(name);
			return null;
		}
		return wrappedValue.value;
	} : noop;

	SessionStorage.remove = supported ? function(name) {
		return window.sessionStorage.removeItem(name);
	} : noop;

	return SessionStorage;
})();
