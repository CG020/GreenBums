export class LoginPage extends HTMLElement {
  constructor() {
      super();

      this.apiBaseUrl = __API_URL__;

      this.handleLogin = this.handleLogin.bind(this);
      this.handleRegister = this.handleRegister.bind(this);
      this.handleSegmentChange = this.handleSegmentChange.bind(this);
  }

  connectedCallback() {
      this.innerHTML = `
          <style>
            .ion-padding {
              padding: 0;
              margin: 0;
              background-color: #5D6659;
              min-height: 100vh;
              display: flex;
              align-items: center;
            }
            .login-container {
              position: relative;
              width: 100%;
              max-width: 700px;
              margin: 0 auto;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              transition: all 0.3s ease;
              padding: 20px;
            }
            .login-container:hover {
              transform: translateY(-5px);
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            }
            .login-card {
              background-color: #E5D5B8;
              border-radius: 16px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              padding: 20px;
              margin: 0 auto;
              height: auto;
              min-height: 400px;
            }
            .login-container h1 {
              text-align: center;
              margin-bottom: 30px;
              color: #5D6659;
              font-size: 2em;
              font-weight: bold;
            }
            ion-segment {
              margin-bottom: 20px;
              --background: #5D6659;
            }
            ion-segment-button {
              --color: #E5D5B8;
              --color-checked: #ffffff;
              --indicator-color: #31d53d;
            }
            ion-item {
              --background: transparent;
              --border-color: #5D6659;
              margin-bottom: 10px;
            }
            ion-button {
              --background: #31d53d;
              --background-hover: #28b834;
              margin-top: 20px;
            }
            .auth-form {
              padding: 10px 0;
            }
          </style>
          <ion-content class="ion-padding">
            <div class="login-container">
              <div class="login-card">
                <h1>GreenBums</h1>
                
                <ion-segment value="login" id="auth-segment">
                  <ion-segment-button value="login">
                    <ion-label>Login</ion-label>
                  </ion-segment-button>
                  <ion-segment-button value="register">
                    <ion-label>Register</ion-label>
                  </ion-segment-button>
                </ion-segment>
    
                <form id="login-form" class="auth-form">
                  <ion-item>
                    <ion-label position="floating">Email</ion-label>
                    <ion-input type="email" required></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-label position="floating">Password</ion-label>
                    <ion-input type="password" required></ion-input>
                  </ion-item>
                  <ion-button expand="block" type="submit">
                    Login
                  </ion-button>
                </form>
    
                <form id="register-form" class="auth-form" style="display: none;">
                  <ion-item>
                    <ion-label position="floating">Email</ion-label>
                    <ion-input type="email" required></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-label position="floating">Password</ion-label>
                    <ion-input type="password" required></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-label position="floating">Confirm Password</ion-label>
                    <ion-input type="password" required></ion-input>
                  </ion-item>
                  <ion-button expand="block" type="submit">
                    Register
                  </ion-button>
                </form>
              </div>
            </div>
          </ion-content>
      `;

      const loginForm = this.querySelector('#login-form');
      const registerForm = this.querySelector('#register-form');
      const segment = this.querySelector('#auth-segment');

      loginForm.addEventListener('submit', this.handleLogin);
      registerForm.addEventListener('submit', this.handleRegister);
      segment.addEventListener('ionChange', this.handleSegmentChange);
  }

  // switching between register form and login form 
  handleSegmentChange(event) {
      const loginForm = this.querySelector('#login-form');
      const registerForm = this.querySelector('#register-form');
      
      if (event.detail.value === 'login') {
          loginForm.style.display = 'block';
          registerForm.style.display = 'none';
      } else {
          loginForm.style.display = 'none';
          registerForm.style.display = 'block';
      }
  }

  // alert structure - specific alerts defined in the handlers
  async showAlert(header, message, buttons = ['OK']) {
      const alert = document.createElement('ion-alert');
      alert.header = header;
      alert.message = message;
      alert.buttons = buttons;
      document.body.appendChild(alert);
      await alert.present();
  }

  // handle login
  async handleLogin(event) {
      event.preventDefault();
      const form = event.target;
      const email = form.querySelector('ion-input[type="email"]').value;
      const password = form.querySelector('ion-input[type="password"]').value;    
      try {
          const response = await fetch('/api/user/auth', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  email: email,
                  secret: password
              })
          });
  
          const responseData = await response.text();
          switch (response.status) {
              case 202: // load up home page if passes
                  sessionStorage.setItem('userEmail', email);
                  sessionStorage.setItem('isAuthenticated', 'true');
                  document.body.innerHTML = '';
                  const homePage = document.createElement('home-page');
                  document.body.appendChild(homePage);
                  break;
              case 400:
                  await this.showAlert('Login Failed', responseData || 'Invalid email or password format');
                  break;
              case 401:
                  await this.showAlert('Login Failed', 'Email address not found');
                  break;
              case 403:
                  await this.showAlert('Login Failed', 'Incorrect password');
                  break;
              default:
                console.error('Full error:', error);
                await this.showAlert('Detailed Error', 
                    `Error Name: ${error.name}\n
                     Error Message: ${error.message}\n
                     Error Stack: ${error.stack}`
                );
          }
      } catch (error) {
          console.error('Login error:', error);
          await this.showAlert('Error', `Network error: ${error.message}`);
      }
  }

  // registering account handler
  async handleRegister(event) {
      event.preventDefault();
      const form = event.target;
      const email = form.querySelector('ion-input[type="email"]').value;
      const passwordInputs = form.querySelectorAll('ion-input[type="password"]');
      const password = passwordInputs[0].value;
      const confirmPassword = passwordInputs[1].value;

      if (password !== confirmPassword) {
          await this.showAlert('Error', 'Passwords do not match');
          return;
      }

      try {
          const response = await fetch('/api/user/init', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  email: email,
                  secret: password
              })
          });
  
          const responseData = await response.text();
          switch (response.status) {
              case 201:
                  await this.showAlert('Success', 'Account created! Please log in.', [{
                      text: 'OK',
                      handler: () => {
                          this.querySelector('#auth-segment').value = 'login';
                          this.handleSegmentChange({ detail: { value: 'login' } });
                      }
                  }]);
                  break;
              case 400:
                  await this.showAlert('Registration Failed', responseData || 'Invalid email or password format');
                  break;
              case 409:
                  await this.showAlert('Registration Failed', 'This email address is already registered');
                  break;
              default:
                  await this.showAlert('Error', `Unexpected error: Status ${response.status}`);
          }
      } catch (error) {
          console.error('Registration error:', error);
          await this.showAlert('Error', `Network error: ${error.message}`);
      }
  }
}

customElements.define('login-page', LoginPage);
