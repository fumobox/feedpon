import { Stream, Streams } from 'messaging/types';
import * as CacheMap from 'utils/containers/CacheMap';

const streams: Streams = {
    defaultFetchOptions: {
        entryOrder: 'newest',
        numEntries: 20,
        onlyUnread: true
    },
    isLoaded: false,
    isLoading: false,
    isMarking: false,
    items: CacheMap.empty<Stream>(10),
    keepUnread: false,
    version: 1
};

export default streams;
