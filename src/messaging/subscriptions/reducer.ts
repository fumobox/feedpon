import createAscendingComparer from 'utils/createAscendingComparer';
import createDescendingComparer from 'utils/createDescendingComparer';
import { Event, Subscription, SubscriptionsOrder, Subscriptions } from 'messaging/types';

export default function reducer(subscriptions: Subscriptions, event: Event): Subscriptions {
    switch (event.type) {
        case 'APPLICATION_INITIALIZED':
            return {
                ...subscriptions,
                items: subscriptions.items.map((subscription) => {
                    if (!subscription.isLoading) {
                        return subscription;
                    }
                    return {
                        ...subscription,
                        isLoading: false
                    }
                }),
                isLoading: false
            };

        case 'SUBSCRIPTIONS_FETCHING':
            return {
                ...subscriptions,
                isLoading: true
            };

        case 'SUBSCRIPTIONS_FETCHING_FAILED':
            return {
                ...subscriptions,
                isLoading: false
            };

        case 'SUBSCRIPTIONS_FETCHED':
            return {
                ...subscriptions,
                isLoading: false,
                items: event.subscriptions.slice().sort(createSubscriptionComparer(subscriptions.order)),
                lastUpdatedAt: event.fetchedAt,
                totalUnreadCount: event.subscriptions.reduce(
                    (total, subscription) => total + subscription.unreadCount,
                    0
                )
            };

        case 'SUBSCRIPTIONS_ORDER_CHANGED':
            return {
                ...subscriptions,
                items: subscriptions.items
                    .slice()
                    .sort(createSubscriptionComparer(event.order)),
                order: event.order
            };

        case 'SUBSCRIPTIONS_UNREAD_VIEWING_CHANGED':
            return {
                ...subscriptions,
                onlyUnread: event.onlyUnread
            };

        case 'FEED_SUBSCRIBING':
            return {
                ...subscriptions,
                items: subscriptions.items
                    .map((subscription) => {
                        if (subscription.feedId !== event.feedId) {
                            return subscription;
                        }
                        return {
                            ...subscription,
                            isLoading: true
                        };
                    })
            };

        case 'FEED_SUBSCRIBING_FAILED':
            return {
                ...subscriptions,
                items: subscriptions.items
                    .map((subscription) => {
                        if (subscription.feedId !== event.feedId) {
                            return subscription;
                        }
                        return {
                            ...subscription,
                            isLoading: false
                        };
                    })
            };

        case 'FEED_SUBSCRIBED':
            return {
                ...subscriptions,
                items: subscriptions.items
                    .filter((subscription) => subscription.subscriptionId !== event.subscription.subscriptionId)
                    .concat([event.subscription])
                    .sort(createSubscriptionComparer(subscriptions.order))
            };

        case 'FEED_UNSUBSCRIBING':
            return {
                ...subscriptions,
                items: subscriptions.items
                    .map((subscription) => {
                        if (subscription.feedId !== event.subscription.feedId) {
                            return subscription;
                        }
                        return {
                            ...subscription,
                            isLoading: true
                        };
                    })
            };

        case 'FEED_UNSUBSCRIBING_FAILED':
            return {
                ...subscriptions,
                items: subscriptions.items
                    .map((subscription) => {
                        if (subscription.feedId !== event.subscription.feedId) {
                            return subscription;
                        }
                        return {
                            ...subscription,
                            isLoading: false
                        };
                    })
            };

        case 'FEED_UNSUBSCRIBED':
            return {
                ...subscriptions,
                items: subscriptions.items
                    .filter((subscription) => subscription.subscriptionId !== event.subscription.subscriptionId)
                    .sort(createSubscriptionComparer(subscriptions.order))
            };

        case 'CATEGORY_DELETED':
            return {
                ...subscriptions,
                items: subscriptions.items
                    .map((subscription) => {
                        const labels = subscription.labels
                            .filter((label) => label !== event.category.label);

                        if (subscription.labels.length === labels.length) {
                            return subscription;
                        }

                        return {
                            ...subscription,
                            labels
                        };
                    })
            }

        case 'CATEGORY_UPDATED':
            return {
                ...subscriptions,
                items: subscriptions.items
                    .map((subscription) => {
                        const labels = subscription.labels
                            .filter((label) => label !== event.prevCategory.label);

                        if (subscription.labels.length === labels.length) {
                            return subscription;
                        }

                        return {
                            ...subscription,
                            labels: [...labels, event.category.label]
                        };
                    })
            }

        default:
            return subscriptions;
    }
}

const titleComparer = createAscendingComparer<Subscription>('title');
const newestComparer = createDescendingComparer<Subscription>('updatedAt');
const oldestComparer = createAscendingComparer<Subscription>('updatedAt');

function createSubscriptionComparer(order: SubscriptionsOrder): (x: Subscription, y: Subscription) => number {
    switch (order) {
        case 'title':
            return titleComparer;

        case 'newest':
            return newestComparer;

        case 'oldest':
            return oldestComparer;
    }
}
