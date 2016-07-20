import * as storageKeys from '../../constants/storageKeys';
import Inject from '../../shared/di/annotations/Inject';
import Named from '../../shared/di/annotations/Named';
import { Redirection, IRedirectionRepository } from './interfaces';

@Inject
export default class LocalForageRedirectionRepository implements IRedirectionRepository {
    constructor(@Named('LocalForage') private _localForage: LocalForage) {
    }

    get(url: string): Promise<Redirection> {
        return this._localForage.getItem(storageKeys.REDIRECTIONS(url));
    }

    put(redirection: Redirection): Promise<void> {
        return this._localForage.setItem(
            storageKeys.REDIRECTIONS(redirection.url),
            redirection as any
        );
    }
}
