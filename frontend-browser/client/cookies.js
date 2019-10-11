var Cookies = require('js-cookie');

const COOKIES = {
	unlockKey: 'uk',
	keypairs: {
		user: {
			login: {
				public: 'kpulpu',
				private: 'kpulpr',
			},
			messaage: {
				public: 'kpumpu',
				private: 'kpumpr'
			}
		},
		chat: {
			public: 'kpcp'
		}
	},
	ids: {
		user: 'uid',
		chat: 'cid'
	}
};



module.exports = {
	COOKIES: COOKIES
};