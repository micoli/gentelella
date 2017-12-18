// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import './vendor';
import './services/EventHub';
import Vue from 'vue';

import ClosableWidget from './components/common/ClosableWidget';
import ProfileQuickInfo from './components/menu/ProfileQuickInfo';
import SideMenu from './components/menu/SideMenu';
import TopMenuToggle from './components/menu/TopMenuToggle';


import TitleProgressBar from './components/homepage/TitleProgressBar';
import TitleProgressValue from './components/homepage/TitleProgressValue';
import TitleStatCount from './components/homepage/TitleStatCount';
import Homepage from './components/homepage/Homepage';


Vue.config.productionTip = false;

new Vue({
	el: '#app',
	components: {
		ProfileQuickInfo,
		SideMenu,
		TopMenuToggle,
		ClosableWidget,

		Homepage,
		TitleStatCount,
		TitleProgressBar,
		TitleProgressValue,

	}
});
