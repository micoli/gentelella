// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import './vendor';
import './services/EventHub';
import Vue from 'vue';
import VueRouter from 'vue-router';
import { SecurityService /*,SecurityPlugin*/ } from './services/Security';
import ClosableWidget from './components/common/ClosableWidget';
import ProfileQuickInfo from './components/menu/ProfileQuickInfo';
import ProfileMenu from './components/menu/ProfileMenu';
import SideMenu from './components/menu/SideMenu';
import TopMenuToggle from './components/menu/TopMenuToggle';

import TitleProgressBar from './components/homepage/TitleProgressBar';
import TitleProgressValue from './components/homepage/TitleProgressValue';
import TitleStatCount from './components/homepage/TitleStatCount';
import Homepage from './components/homepage/Homepage';
import Homepage2 from './components/homepage/Homepage2';
import Auth from './components/auth/Auth';

Vue.mixin({
	data: function () {
        return {
            security: SecurityService
        }
    }
});

Vue.config.productionTip = false;
Vue.use(VueRouter)

var vm = new Vue({
	el: '#app',
	components: {
		ProfileQuickInfo,
		ProfileMenu,
		SideMenu,
		TopMenuToggle,
		ClosableWidget,

		Homepage,
		TitleStatCount,
		TitleProgressBar,
		TitleProgressValue
	},
	created: function () {
		SecurityService.init(this);
   },
	router : new VueRouter({
		routes : [{
			path: '/', component: Homepage
		},{
			path: '/auth', component: Auth, name: 'auth'
		},{
			path: '/dashboard-2',
			component: Homepage2,
			beforeEnter : function (to, from, next){
				//Vue.nextTick(function () {
					SecurityService.authorize(['*'],to,next);
				//});
			}
		}]
	})
});
