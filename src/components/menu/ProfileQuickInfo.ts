import { Vue, Component,Provide } from 'vue-property-decorator';

@Component({
	template: `
	<div class="profile clearfix">
		<div class="profile_pic">
			<img v-bind:src="pic" alt="..." class="img-circle profile_img">
		</div>
		<div class="profile_info">
			<span>Welcome,</span>
			<h2>{{username}}</h2>
		</div>
	</div>`
})
export default class ProfileQuickInfo extends Vue {
	@Provide()
	username:string='john Doe';

	@Provide()
	pic:string='http://lorempixel.com/40/40/nightlife/'

	mounted () {
	}

	destroyed () {
	}

}
