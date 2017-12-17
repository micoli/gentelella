import { Vue, Component, Prop, Provide } from 'vue-property-decorator';

@Component({
	props : {
		heightClass:{type:String,default:'fixed_height_320'},
		size: {type:String,default:'col-md-4 col-sm-4 col-xs-12'},
		title: {type:String,default:'Title'},
		closable: {type:Boolean,default:true}
	},
	template: `
	<div v-bind:class="size">
		<div v-bind:class="heightClasses" >
			<div class="x_title">
				<h2>{{ title }}</h2>
				<ul class="nav navbar-right panel_toolbox">
					<li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a>
					</li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><i class="fa fa-wrench"></i></a>
						<ul class="dropdown-menu" role="menu">
							<li><a href="#">Settings 1</a>
							</li>
							<li><a href="#">Settings 2</a>
							</li>
						</ul>
					</li>
					<li><a class="close-link"><i class="fa fa-close"></i></a>
					</li>
				</ul>
				<div class="clearfix"></div>
			</div>
			<div class="x_content">
				<slot></slot>
			</div>
		</div>
	</div>`
})
//v-bind:class="'fa'  _icon"
//['progress-bar' 'color']
export default class ClosableWidget extends Vue {
	size:String;
	title:String;
	value:Number;
	color:String;
	heightClass:String;

	data(){
		return {
			heightClasses:['x_panel','tile',this.heightClass]
		};
	}
	mounted () {
	}

	destroyed () {
	}
}
