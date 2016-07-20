import Inject from '../../shared/di/annotations/Inject';
import { IClock } from './interfaces';

@Inject
export default class SystemClock implements IClock {
    now() {
        return Date.now();
    }
}
