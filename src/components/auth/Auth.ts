import { Vue, Component } from 'vue-property-decorator';
import {SecurityService} from '../../services/Security';
import {LocalStorage} from '../../services/LocalStorage';

@Component({
	template: `
	<div class="login">
		<a class="hiddenanchor" id="signup"></a>
		<a class="hiddenanchor" id="signin"></a>

		<div class="login_wrapper">
			<div class="animate form login_form" style="position:relative">
				<section class="login_content">
					<form @submit="login">
						<h1>Login Form</h1>
						<div>
							<input type="text" class="form-control" placeholder="Username" required="" v-model="credentials.username" />
						</div>
						<div>
							<input type="password" class="form-control" placeholder="Password" required="" v-model="credentials.password" />
						</div>
						<div>
							<button type="submit" class="btn btn-default submit" @click="login">Log in</button>
							<a class="reset_pass" @click="lostPassword">Lost your password?</a>
						</div>

						<div class="clearfix"></div>

						<div class="separator">
							<p class="change_link">New to site?
							<a href="#signup" class="to_register"> Create Account </a>
							</p>

							<div class="clearfix"></div>
							<br />
						</div>
					</form>
				</section>
			</div>

			<div id="register" class="animate form registration_form" style="position:relative">
				<section class="login_content">
					<form>
						<h1>Create Account</h1>
						<div>
							<input type="text" class="form-control" placeholder="Username" required="" />
						</div>
						<div>
							<input type="email" class="form-control" placeholder="Email" required="" />
						</div>
						<div>
							<input type="password" class="form-control" placeholder="Password" required="" />
						</div>
						<div>
							<a class="btn btn-default submit" href="index.html">Submit</a>
						</div>

						<div class="clearfix"></div>

						<div class="separator">
							<p class="change_link">Already a member ?
							<a href="#signin" class="to_register"> Log in </a>
							</p>

							<div class="clearfix"></div>
							<br />
						</div>
					</form>
				</section>
			</div>
		</div>
		<div class="clearfix"></div>
	</div>`,
	components: {
	}
})
export default class Auth extends Vue {
	credentials:any= {
		username: 'toto@titi.com',
		password: 'toto'
	};
	rememberCredentials:boolean=true;
	error:string =  '';

	lostPassword(){
	}

	login(){
		let self = this;
		let credentials = {
			username: this.credentials.username.toLowerCase(),
			password: this.credentials.password
		};
		let securityService = (this.security as typeof SecurityService);

		securityService
			.login(credentials)
			.then(function(data: any) {
				if (self.rememberCredentials && credentials.username && credentials.password) {
					LocalStorage.setItem("credentials", JSON.stringify({
						username : credentials.username,
						password : credentials.password
					}));
				} else {
					LocalStorage.removeItem("credentials");
				}
				if (securityService.returnToRouteName ==="auth" || securityService.returnToRouteName == "") {
					console.log('logged root');
					securityService.go("/");
				} else {
					console.log('logged next');
					securityService.returnToRoute()
				}
			}, function(e:any) {
				console.log('error',e);
			}).catch(function(data: any) {
				console.log('error',data);
			});
	}

	destroyed () {
	}
}
