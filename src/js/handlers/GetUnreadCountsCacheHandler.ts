import Inject from '../shared/di/annotations/Inject';
import { EventDispatcher, IActionHandler } from '../shared/interfaces';
import { GetUnreadCountsCache } from '../constants/actionTypes';
import { IUnreadCountRepository } from '../services/feedly/interfaces';
import { UnreadCountsReceived } from '../constants/eventTypes';

@Inject
export default class GetUnreadCountsCacheHandler implements IActionHandler<GetUnreadCountsCache> {
    constructor(private unreadCountRepository: IUnreadCountRepository) {
    }

    async handle(action: GetUnreadCountsCache, dispatch: EventDispatcher): Promise<void> {
        const unreadCounts = await this.unreadCountRepository.getAll();
        if (unreadCounts) {
            dispatch({
                eventType: UnreadCountsReceived,
                unreadCounts
            } as UnreadCountsReceived);
        }
    }
}
