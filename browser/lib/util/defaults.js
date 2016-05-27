var Defaults = {
	internetUpUrlWithoutExtension: 'https://internet-up.ably-realtime.com/is-the-internet-up',
	/* Order matters here: the base transport is the leftmost one in the
	 * intersection of this list and the transports clientOption that's
	 * supported.  This is not quite the same as the preference order -- e.g.
	 * xhr_polling is preferred to jsonp, but for browsers that support it we want
	 * the base transport to be xhr_polling, not jsonp */
	transports: ['xhr_polling', 'xhr_streaming', 'jsonp', 'web_socket'],
	transportPreferenceOrder: ['jsonp', 'xhr_polling', 'xhr_streaming', 'web_socket'],
	upgradeTransports: ['xhr_streaming', 'web_socket'],
	minified: !(function _(){}).name
};

/* If using IE8, don't attempt to upgrade from xhr_polling to xhr_streaming -
* while it can do streaming, the low max http-connections-per-host limit means
* that the polling transport is crippled during the upgrade process. So just
* leave it at the base transport */
if(navigator.userAgent.toString().match(/MSIE\s8\.0/)) {
	Defaults.upgradeTransports = [];
}

