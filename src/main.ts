// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import './vendor';
import './services/EventHub';
import Vue from 'vue';
import VueRouter from 'vue-router';
import Security from './services/Security';
import ClosableWidget from './components/common/ClosableWidget';
import ProfileQuickInfo from './components/menu/ProfileQuickInfo';
import SideMenu from './components/menu/SideMenu';
import TopMenuToggle from './components/menu/TopMenuToggle';

import TitleProgressBar from './components/homepage/TitleProgressBar';
import TitleProgressValue from './components/homepage/TitleProgressValue';
import TitleStatCount from './components/homepage/TitleStatCount';
import Homepage from './components/homepage/Homepage';
import Homepage2 from './components/homepage/Homepage2';
import Auth from './components/auth/Auth';

Vue.config.productionTip = false;
Vue.use(VueRouter)
Vue.use(Security);

var vm = new Vue({
	el: '#app',
	components: {
		ProfileQuickInfo,
		SideMenu,
		TopMenuToggle,
		ClosableWidget,

		Homepage,
		TitleStatCount,
		TitleProgressBar,
		TitleProgressValue
	},
	router : new VueRouter({
		routes : [{
			path: '/', component: Homepage
		},{
			path: '/auth', component: Auth
		},{
			path: '/dashboard-2',
			component: Homepage2,
			beforeEnter : function (to, from, next){
				(<any>vm).security.authorize(vm,[''],to,next);
			}
		}]
	})
});
