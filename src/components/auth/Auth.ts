import { Vue, Component } from 'vue-property-decorator';
import {StaticSecurity} from '../../services/Security';
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
							<button class="btn btn-default submit" @click="login">Log in</button>
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
		username: '',
		password: ''
	};
	rememberCredentials:boolean=true;
	error:string =  '';

	login(){
		var credentials = {
			username: this.credentials.username.toLowerCase(),
			password: this.credentials.password
		};

		(this.security as typeof StaticSecurity)
			.login(credentials)
			.then(function(data: any) {
				if (this.rememberCredentials && credentials.username && credentials.password) {
					LocalStorage.setItem("credentials", {
						username : credentials.username,
						password : credentials.password
					})
				} else {
					LocalStorage.removeItem("credentials");
				}
				/*if ($scope.returnToState && "signin" != $scope.returnToState.name) {
					$state.go($scope.returnToState.name, $scope.returnToStateParams)
				} else {
					$state.go("dash");
				}*/
			}, function(e:any) {
				//$scope.data.errorMessage = e;
			}).catch(function(data: any) {
			//$scope.loginError = true;
		});
	}

	destroyed () {
	}
}
