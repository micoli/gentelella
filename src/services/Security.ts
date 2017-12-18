import Vue from 'vue';
import axios from 'axios';
import { LocalStorage }  from './LocalStorage';
import { Constants } from './Security/Constants';
var jwt = require('jsonwebtoken');

//import VueLocalStorage from 'vue-localstorage'
//Vue.use(VueLocalStorage);


export default class Security {
	private static _rightNotConnected:any;
	private static _currentIdentity:any;
	private static _authenticated:any ;
	private static vue:Vue;
	private static jwtPrivateKey:string;

	static userToken: string= '';

	static init(vue:Vue){
		this.vue = vue;
		axios.defaults.baseURL = '/api';
		axios.defaults.headers.common['Authorization'] = 'Bearer ';
		this.jwtPrivateKey='ghjfgdsjh fydusifgkbez;gdsbv,vfdshjfgdsgfzefèç!èygrék';
		this.initInterceptor()
	}
	static isIdentityResolved (){
		return this._currentIdentity !== null;
	}

	static isAuthenticated (){
		return this._authenticated !== null;
	}

	static isInAnyRights (rights:any) {
		var i,j;
		rights = Array.isArray(rights) ? rights : [ rights ];
		if (arguments.length > 1)
		for (i = 1; i < arguments.length; i++) rights.push(arguments[i]);
		try {
			if (!this._authenticated || !this._currentIdentity.hasOwnProperty("config")) return false;
			if (!this._currentIdentity.config.hasOwnProperty("rights")) return false;
		} catch (e) {
			return false;
		}
		for (j = 0; j < rights.length; j++)
		if (this._currentIdentity.config.rightSa[rights[j]]) return true;
		return false;
	};

	static removeAuthenticate (){
		this._currentIdentity = null;
		this._authenticated = null;
		this.setTokenId(null);
		LocalStorage.removeItem("token");
	};

	static initTokenId (token:any) {
		this.userToken = token;
		axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
	}

	static setTokenId (token:any) {
		this.initTokenId(token);
		LocalStorage.setItem("token", token);
	}

	static getTokenId (){
		return LocalStorage.getItem("token");
	}

	static clearTokenId (){
		return LocalStorage.removeItem("token");
	}

	static checkAndLoadIdentity (){
		var self = this;
		return new Promise((resolve, reject) => {
			if (self._currentIdentity !== null) {
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
					reject(null);
				});
			} else {
				reject();
			}
		});
	}

	static getCurrentIdentity (){
		return this._currentIdentity;
	}

	static login (credentials:any) {
		var self = this;
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
		this._currentIdentity = null;
		this.vue.$root.$emit('authentication:logout', {identity:this._currentIdentity});
		this._authenticated = false;
		this.clearTokenId();
	}

	static isSessionAuthenticated (){
		return axios.post("/api/users/info");
	}

	static setIdentity (token:any) {
		this._currentIdentity = jwt.decode(token,this.jwtPrivateKey);
		this.vue.$root.$emit('authentication:login', {identity:this._currentIdentity,token:token});
		this._authenticated = true;
		this.setTokenId(token);
	}

	static initInterceptor(){
		var self = this;

		axios.interceptors.request.use(function (config) {
			return config;
		}, function (error) {
			return Promise.reject(error);
		});

		axios.interceptors.response.use(function (response:any) {
			return response;
		}, function (response) {
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
}

/*

//.factory("authentication.authService", [ "$q", "$http", "$timeout", "$rootScope", "$location", "$state", "localStorageService", "jwtHelper", function($q, $http, $timeout, $rootScope, $location, $state, localStorageService, jwtHelper) {

.factory("authentication.authorization", [ "$rootScope", "$state", "authentication.authService", function($rootScope, $state, authService) {
	return {
		authorize : function() {
			return authService.checkAndLoadIdentity().then(function() {
				var isAuthenticated = authService.isAuthenticated();
				$rootScope.toState.data = $rootScope.toState.data || {};
				if ($rootScope.toState.data.rights && $rootScope.toState.data.rights.length > 0 && !authService.isInAnyRights($rootScope.toState.data.rights)) {
					if (isAuthenticated) {
						$state.go("accessdenied")
					}
				} else if (!isAuthenticated) {
					$rootScope.returnToState = $rootScope.toState;
					$rootScope.returnToStateParams = $rootScope.toStateParams;
					$state.go("signin");
				}
			});
		},
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
	this.responseError = function(response) {
		if (response.data)
			if (response.data.hasOwnProperty("class") && /AccessDeniedException$/.test(response.data.class)) {
				Vue.$root.$emit("secureArea:ressourceDenied", {
					message : response.data.message
				});
				return $q.reject(response);
		}
		if (response.config && !/\/auth\/validate$/.test(response.config.url)) {
			var event = {
				401 : AUTH_EVENTS.notAuthenticated,
				403 : AUTH_EVENTS.notAuthorized,
				419 : AUTH_EVENTS.sessionTimeout,
				440 : AUTH_EVENTS.sessionTimeout
			}[response.status];
			if (event) Vue.$root.$emit(event, response);
		}
		return $q.reject(response);
	};
	return this;
} ])
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
