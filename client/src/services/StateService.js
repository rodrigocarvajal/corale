import {BehaviorSubject} from 'rxjs';

const datasetSubscriber = new BehaviorSubject();

const datasetService = {
    send: (msg) => {
        datasetSubscriber.next(msg);
    }
};

export { datasetSubscriber, datasetService };