import { LightningElement } from 'lwc';

export default class Login extends LightningElement {
    CLIENT_ID =
        '3MVG9p1Q1BCe9GmD19sHp0kH3cbKBbcwVVYWpV8BYTdxVVA2zOqAQeb03Ajy6_eGQiXW5mneoCnfX.6jeJx3.';
    CLIENT_Secret =
        '331C1E9AB0F93B2575A3767ED03DE2E801D648BDD93AEDECC03FFCA30890C35F';
    myDomain = 'cloudperitus17-dev-ed.my.salesforce.com';
    userName = 'dev.team@cloudperitus.com.hitech';
    password = 'Test@123';

    
    accessToken;
    refreshToken;
    showSuccess = false;
    showError = false;
    errorMessage;
    loggedin = false;


    get redirectURI(){
        const url = window.location.href+'';
        return url.includes("localhost")?"http://localhost:3001":"https://stark-plateau-23372.herokuapp.com";
    }
    
    get Oauthurl() {
        let URL = `https://${this.myDomain}/services/oauth2/authorize?client_id=${this.CLIENT_ID}&redirect_uri=${this.redirectURI}&response_type=code`;
        console.log(URL);
        return URL;
    }
    handleClick() {
        this.authorizeSF();
    }

    async authorizeSF() {
        let URL = `https://${this.myDomain}/services/oauth2/token?client_id=${this.CLIENT_ID}&client_secret=${this.CLIENT_Secret}&username=${this.userName}&password=${this.password}&grant_type=password`;
        // error url //let URL = `https://${this.myDomainasdasd}/services/asdoasdasdauth2/token?client_id=${this.CLIENT_ID}&client_secret=${this.CLIENT_Secret}&username=${this.userName}&password=${this.password}&grant_type=password`;

        const options = {
            method: 'POST',
            headers: new Headers({
                'content-type': 'application/x-www-form-urlencoded'
            })
        };

        try {
            const response = await fetch(URL, options);
            const js = await response.json();
            console.log(js);
            if (js.access_token) {
                this.accessToken = js.access_token;
                this.loggedin = true;
            }
        } catch (error) {
            console.log(error);
        }
    }

    async getAccessToken(authorizationCode) {
        let URL = `https://${this.myDomain}/services/oauth2/token?code=${authorizationCode}&client_id=${this.CLIENT_ID}&client_secret=${this.CLIENT_Secret}&redirect_uri=${this.redirectURI}&grant_type=authorization_code`;
        console.log('get oauth token URL', URL);
        const options = {
            method: 'POST',
            headers: new Headers({
                'content-type': 'application/x-www-form-urlencoded'
            })
        };
        console.log('getAccessToken');
        try {
            const response = await fetch(URL, options);
            const js = await response.json();
            console.log('success oauth ', js);
            if (js.access_token) {
                this.accessToken = js.access_token;
                this.refreshToken = js.refresh_token;
                this.loggedin = true;
            }
        } catch (error) {
            console.log('error access toek oauth ', error);
        }
    }

    publishMessage() {
        let message = this.template.querySelector('[data-id="message"]');
        console.log(message.value);
        this.createRecord(message.value);
    }

    async createRecord(message) {
        if (this.accessToken) {
            let URL = `https://${this.myDomain}/services/data/v51.0/sobjects/Notification__c/`;
            let body = {
                Name: 'created From WebApp',
                Message__c: message
            };
            const options = {
                body: JSON.stringify(body),
                method: 'POST',
                headers: new Headers({
                    'content-type': 'application/json',
                    Authorization: `Bearer ${this.accessToken}`
                })
            };

            try {
                const response = await fetch(URL, options);
                const js = await response.json();
                console.log(js);
                this.showSuccess = true;
            } catch (error) {
                this.showError = true;
                this.errorMessage = error.message;
                console.log(error);
            }
            this.template.querySelector('[data-id="message"]').value = '';
        } else {
            this.showError = true;
            this.errorMessage = 'Not logged in';
            console.log('Not logged in');
        }
    }

    constructor() {
        console.log(window.location.href);
        super();
    }

    renderedCallback() {
        const params = new URLSearchParams(window.location.search);
        const accessTkn = params.get('code');
        if (accessTkn && !this.accessToken) {
            console.log(accessTkn);
            this.getAccessToken(accessTkn);
        }
    }

    closeSuccess() {
        this.showSuccess = false;
    }
    closeDanger() {
        this.showError = false;
    }
}
