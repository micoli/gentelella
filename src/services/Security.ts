import Vue from 'vue';
import {VueConstructor} from 'vue/types/vue';
import {PluginObject,PluginFunction} from 'vue/types/plugin';
import axios from 'axios';
import { LocalStorage }  from './LocalStorage';
import { Constants } from './Security/Constants';
var jwt = require('jsonwebtoken');

//import VueLocalStorage from 'vue-localstorage'
//Vue.use(VueLocalStorage);

//plugin
const Security = {
	install(vue: VueConstructor, options: any) {
		StaticSecurity.init(vue)
	}
}
export default Security;

Vue.mixin({
	data: function () {
        return {
            security: StaticSecurity
        }
    }
});

export class StaticSecurity  {
	private static _rightNotConnected: any;
	private static _currentIdentity: any;
	private static _authenticated: boolean ;
	private static vue: any;
	private static jwtPrivateKey: string;
	private static returnToRoute: any;

	static userToken: string= '';

	static init(vue:any){
		let self = StaticSecurity;
		self.vue = vue;
		axios.defaults.baseURL = '/api';
		axios.defaults.headers.common['Authorization'] = 'Bearer ';
		self.jwtPrivateKey='ghjfgdsjh fydusifgkbez;gdsbv,vfdshjfgdsgfzefèç!èygrék';
		self.initInterceptor()
	}
	static isIdentityResolved (){
		let self = StaticSecurity;
		return !(self._currentIdentity == null);
	}

	static isAuthenticated (){
		let self = StaticSecurity;
		return self._authenticated;
	}

	static isInAnyRights (rights:any) {
		let self = StaticSecurity;
		var i,j;
		rights = Array.isArray(rights) ? rights : [ rights ];
		if (arguments.length > 1)
		for (i = 1; i < arguments.length; i++) rights.push(arguments[i]);
		try {
			if (!self._authenticated || !self._currentIdentity.hasOwnProperty("config")) return false;
			if (!self._currentIdentity.config.hasOwnProperty("rights")) return false;
		} catch (e) {
			return false;
		}
		for (j = 0; j < rights.length; j++)
		if (self._currentIdentity.config.rightSa[rights[j]]) return true;
		return false;
	};

	static removeAuthenticate (){
		let self = StaticSecurity;
		self._currentIdentity = null;
		self._authenticated = false;
		self.setTokenId(null);
		LocalStorage.removeItem("token");
	};

	static initTokenId (token:any) {
		let self = StaticSecurity;
		self.userToken = token;
		axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
	}

	static setTokenId (token:any) {
		let self = StaticSecurity;
		self.initTokenId(token);
		LocalStorage.setItem("token", token);
	}

	static getTokenId (){
		return LocalStorage.getItem("token");
	}

	static clearTokenId (){
		return LocalStorage.removeItem("token");
	}

	static checkAndLoadIdentity (){
		var self = StaticSecurity;
		return new Promise((resolve, reject) => {
			if (!(self._currentIdentity == null)) {
				resolve(self._currentIdentity);
				return;
			}
			self._currentIdentity = null;
			self._authenticated = false;
			var token = self.getTokenId();
			if (token) {
				self.initTokenId(token);

				axios
				.get("/api/users/info")
				.then(function(res:any) {
					self.setIdentity(token)
					resolve(self._currentIdentity);
				},function() {
					resolve(null);
				});
			} else {
				resolve(null);
			}
		});
	}

	static getCurrentIdentity (){
		return StaticSecurity._currentIdentity;
	}

	public static login (credentials:any) {
		var self = StaticSecurity;
		self._currentIdentity = null;
		self._authenticated = false;
		return axios.post("api/users/login",{
			email : credentials.username,
			password : credentials.password,
		}).then(function(res:any) {
			return new Promise((resolve, reject) => {
				try {
					if (res.data.success) {
						self.setIdentity(res.data.token);
						resolve(res.data.id)
					} else {
						reject(res.data.message);
					}
				} catch (e) {
					reject(res.data.message);
				}
			})
		}, function(res:any) {
			return new Promise((resolve, reject) => {
				reject(res.data.message);
			});
		});
	}

	static logout (){
		var self = StaticSecurity;
		self._currentIdentity = null;
		self.vue.$root.$emit('authentication:logout', {identity: self._currentIdentity});
		self._authenticated = false;
		self.clearTokenId();
	}

	static isSessionAuthenticated (){
		return axios.post("/api/users/info");
	}

	static setIdentity (token:any) {
		var self = StaticSecurity;
		self._currentIdentity = jwt.decode(token,self.jwtPrivateKey);
		self.vue.$root.$emit('authentication:login', {identity:self._currentIdentity,token:token});
		self._authenticated = true;
		self.setTokenId(token);
	}

	static initInterceptor(){
		var self = StaticSecurity;

		axios.interceptors.request.use(function (config:any) {
			return config;
		}, function (error:any) {
			return Promise.reject(error);
		});

		axios.interceptors.response.use(function (response:any) {
			return response;
		}, function (response:any) {
			if (response.data){
				if (response.data.hasOwnProperty("class") && /AccessDeniedException$/.test(response.data.class)) {
					self.vue.$root.$emit("secureArea:ressourceDenied", {
						message : response.data.message
					});
					return Promise.reject(response);
				}
			}
			if (response.config && !/\/auth\/validate$/.test(response.config.url)) {
				var events:any ={
					401 : Constants.notAuthenticated,
					403 : Constants.notAuthorized,
					419 : Constants.sessionTimeout,
					440 : Constants.sessionTimeout
				};
				var event: any = events[response.status];
				if (event) {
					self.vue.$root.$emit(event, response);
				}
			}
			return Promise.reject(response);
		});
	}

	public static authorize (vm:any,to : any, next: any, rights: any) {
		var self = StaticSecurity;
		return self
		.checkAndLoadIdentity()
		.then(function() {
			if (self.isAuthenticated() && rights && rights.length > 0 && !self.isInAnyRights(rights)) {
				vm.$router.replace('accessdenied')
			} else if (!self.isAuthenticated()) {
				self.returnToRoute = next;
				vm.$router.replace('/auth');
			}
		});
	}

}

/*

//.factory("authentication.authService", [ "$q", "$http", "$timeout", "$rootScope", "$location", "$state", "localStorageService", "jwtHelper", function($q, $http, $timeout, $rootScope, $location, $state, localStorageService, jwtHelper) {

.factory("authentication.authorization", [ "$rootScope", "$state", "authentication.authService", function($rootScope, $state, authService) {
	return {
		redirectifAuthenticated : function() {
			return authService.checkAndLoadIdentity().then(function() {
				if (authService.isAuthenticated()) {
					$state.go("dash");
				}
			});
		}
	};
} ])
.service("authentication.authInterceptor", [ "$rootScope", "$q", "authentication.AUTH_EVENTS", function($rootScope, $q, AUTH_EVENTS) {
.controller("authentication.accessdeniedController", [ "$scope", "$stateParams", function($scope, $stateParams) {
	if ($stateParams.message !== null) {
		$scope.message = $stateParams.message;
	}
} ])
.controller("authentication.authCallbackController", [ "$scope", "$stateParams", "$state", "authentication.authService", function($scope, $stateParams, $state, authService) {
	if ($stateParams.token !== null) {
		authService.setIdentity($stateParams.token);
		$state.go("dash");
	}
} ])
.controller("authentication.signinController", [ "$rootScope", "$scope", "$state", "$http", "localStorageService", "authentication.authService", "$location", function($rootScope, $scope, $state, $http, localStorageService, authService, $location) {
	$scope.data = {
		mode : 'login',
		message : '',
		errorMessage : '',
		rememberCredentials : false
	};

	var cred = localStorageService.get("credentials");
	$scope.credentials = cred ? cred : {
		username : "",
		password : ""
	};
	$scope.checkMail = function(mail) {
		return new RegExp("^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,10}$").test(mail);
	};
	$scope.auth = function(provider){
		return $http({
			method : "GET",
			url : "/api/auth/" + provider
		}).then(function(res) {
			if (res.data.success) {
				window.location=res.data.redirect;
			} else {
				$scope.data.message = '';
				$scope.data.errorMessage = res.data.message;
			}
		}, function(res) {});

	}
	$scope.login = function(credentials) {
		$scope.data.message = '';
		$scope.data.errorMessage = '';
		if (!credentials.username || !credentials.password) {
			$scope.data.errorMessage = 'formulaire incomplet';
		} else {
			credentials.username = credentials.username.toLowerCase();
			authService
				.login(credentials)
				.then(function(data) {
					if ($scope.data.rememberCredentials && credentials.username && credentials.password) {
						LocalStorage.set("credentials", {
							username : credentials.username,
							password : credentials.password
						})
					} else {
						LocalStorage.remove("credentials");
					}
					if ($scope.returnToState && "signin" != $scope.returnToState.name) {
						$state.go($scope.returnToState.name, $scope.returnToStateParams)
					} else {
						$state.go("dash");
					}
				}, function(e) {
					$scope.data.errorMessage = e;
				}).catch(function(data) {
				$scope.loginError = true;
			});
		}
	};

	$scope.register = function(credentials) {
		$scope.data.message = '';
		$scope.data.errorMessage = '';
		if (!credentials.username || !credentials.password) {
			$scope.data.errorMessage = 'formulaire incomplet';
		} else {
			credentials.username = credentials.username.toLowerCase();
			return $http({
				method : "POST",
				url : "/api/users",
				data : {
					name : credentials.username,
					email : credentials.username,
					password : credentials.password,
				}
			}).then(function(res) {
				if (res.data.success) {
					$scope.data.mode = 'login';
					$scope.data.message = res.data.message;
					$scope.data.errorMessage = '';
				} else {
					$scope.data.message = '';
					$scope.data.errorMessage = res.data.message;
				}
			}, function(res) {});

		}
	};
} ]);
*/
