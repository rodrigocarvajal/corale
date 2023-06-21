import axios from 'axios';

class HttpService {

    constructor() {
        this.baseUrl = process.env.REACT_APP_FLASK_HOST + ':' + process.env.REACT_APP_FLASK_PORT + process.env.REACT_APP_FLASK_PROXY_URL_PREFIX;
    }

    get = url => {
        return axios.get(this.baseUrl + url);
    };

    post = (url, body) => {
        return axios.post(this.baseUrl + url, body);
    };

}

export default new HttpService();