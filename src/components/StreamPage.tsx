import React, { PureComponent } from 'react';
import { Params } from 'react-router/lib/Router';

import Dropdown from 'components/parts/Dropdown';
import EntryList from 'components/parts/EntryList';
import MenuItem from 'components/parts/MenuItem';
import Navbar from 'components/parts/Navbar';
import bindAction from 'utils/bindAction';
import connect from 'utils/react/connect';
import { Category, State, Stream, StreamOptions, StreamView } from 'messaging/types';
import { changeStreamView, fetchComments, fetchFullContent, fetchMoreEntries, fetchStream, markAsRead, pinEntry, unpinEntry } from 'messaging/stream/actions';

interface StreamProps {
    categories: Category[];
    isScrolling: boolean;
    onChangeStreamView: (view: StreamView) => void,
    onFetchComments: (entryId: string, url: string) => void;
    onFetchFullContent: (entryId: string, url: string) => void;
    onFetchMoreEntries: (streamId: string, continuation: string, options: StreamOptions) => void;
    onFetchStream: (streamId: string, options?: StreamOptions) => void;
    onMarkAsRead: (entryIds: string[]) => void;
    onPinEntry: (entryId: string) => void;
    onToggleSidebar: () => void,
    onUnpinEntry: (entryId: string) => void;
    params: Params;
    scrollTo: (x: number, y: number) => Promise<void>;
    stream: Stream;
};

interface StreamState {
    readEntryIds: Set<string>;
}

const SCROLL_OFFSET = 48;

class StreamPage extends PureComponent<StreamProps, StreamState> {
    constructor(props: StreamProps, context: any) {
        super(props, context);

        this.state = {
            readEntryIds: new Set()
        };

        this.handleChangeEntryOrder = this.handleChangeEntryOrder.bind(this);
        this.handleClearReadEntries = this.handleClearReadEntries.bind(this);
        this.handleLoadMoreEntries = this.handleLoadMoreEntries.bind(this);
        this.handlePinEntry = this.handlePinEntry.bind(this);
        this.handleReadEntry = this.handleReadEntry.bind(this);
        this.handleScrollToEntry = this.handleScrollToEntry.bind(this);
        this.handleToggleOnlyUnread = this.handleToggleOnlyUnread.bind(this);
    }

    componentWillMount() {
        const { stream, onFetchStream, params } = this.props;

        if (!stream || (stream.streamId !== params['stream_id'])) {
            onFetchStream(params['stream_id']);
        }
    }

    componentWillUpdate(nextProps: StreamProps, nextState: {}) {
        const { params } = this.props;
        const { readEntryIds } = this.state;

        if (params['stream_id'] !== nextProps.params['stream_id']) {
            const { stream, onFetchStream, onMarkAsRead } = this.props;

            if (stream.streamId === params['stream_id']) {
                onMarkAsRead([...readEntryIds]);
            }

            onFetchStream(nextProps.params['stream_id']);
        }
    }

    componentWillReceiveProps(nextProps: StreamProps) {
        const { stream } = this.props;

        if (stream.streamId !== nextProps.stream.streamId) {
            this.setState({
                readEntryIds: new Set()
            });
        }
    }

    componentWillUnmount() {
        const { stream, onMarkAsRead, params } = this.props;
        const { readEntryIds } = this.state;

        if (stream.streamId === params['stream_id']) {
            onMarkAsRead([...readEntryIds]);
        }
    }

    handleChangeEntryOrder(order: 'newest' | 'oldest') {
        const { stream, onFetchStream, scrollTo } = this.props;

        if (stream.streamId) {
            scrollTo(0, 0);

            onFetchStream(stream.streamId, {
                ...stream.options,
                order
            });
        }
    }

    handleClearReadEntries() {
        const { scrollTo } = this.props;

        scrollTo(0, 0).then(() => this.setState({ readEntryIds: new Set() }));
    }

    handleLoadMoreEntries(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onFetchMoreEntries, stream } = this.props;

        if (stream.streamId && stream.continuation) {
            onFetchMoreEntries(stream.streamId, stream.continuation, stream.options);
        }
    }

    handlePinEntry(entryId: string) {
        const { onPinEntry } = this.props;

        onPinEntry(entryId);
    }

    handleReadEntry(readEntryIds: string[]) {
        this.setState((state) => ({
            readEntryIds: new Set([...state.readEntryIds, ...readEntryIds])
        }));
    }

    handleScrollToEntry(entryId: string) {
        const scrollElement = document.getElementById('entry-' + entryId);

        if (scrollElement) {
            this.props.scrollTo(0, scrollElement.offsetTop - SCROLL_OFFSET);
        }
    }

    handleToggleOnlyUnread() {
        const { stream, onFetchStream } = this.props;

        if (stream.streamId) {
            scrollTo(0, 0);

            onFetchStream(stream.streamId, {
                ...stream.options,
                onlyUnread: !stream.options.onlyUnread
            });
        }
    }

    renderReadEntriesDropdown() {
        const { stream } = this.props;
        const { readEntryIds } = this.state;

        const readEntries = stream.entries.filter(entry => readEntryIds.has(entry.entryId));

        return (
            <Dropdown
                className="navbar-action"
                toggleButton={
                    <a href="#">
                        <i className="icon icon-24 icon-checkmark" />
                        <span className="badge badge-overlap badge-negative">{readEntries.length || ''}</span>
                    </a>
                }
                pullRight={true}>
                <div className="menu-heading">Read entries</div>
                {readEntries.map((entry) => (
                    <MenuItem
                        key={entry.entryId}
                        onSelect={this.handleScrollToEntry}
                        primaryText={entry.title}
                        value={entry.entryId} />
                ))}
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={readEntries.length === 0}
                    onSelect={this.handleClearReadEntries}
                    primaryText="Clear all read entries" />
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={stream.entries.length === 0}
                    primaryText="Mark all as read" />
            </Dropdown>
        );
    }

    renderConfigDropdown() {
        const { stream, onChangeStreamView } = this.props;

        return (
            <Dropdown
                className="navbar-action"
                toggleButton={<a href="#"><i className="icon icon-24 icon-more" /></a>}
                pullRight={true}>
                <div className="menu-heading">View</div>
                <MenuItem
                    icon={stream.options.view === 'expanded' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onChangeStreamView}
                    primaryText="Expanded view"
                    value="expanded" />
                <MenuItem
                    icon={stream.options.view === 'collapsible' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Collapsible view"
                    onSelect={onChangeStreamView.bind(null, 'collapsible')} />
                <div className="menu-divider" />
                <div className="menu-heading">Order</div>
                <MenuItem
                    icon={stream.options.order === 'newest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={this.handleChangeEntryOrder}
                    primaryText="Newest first"
                    value="newest" />
                <MenuItem
                    icon={stream.options.order === 'oldest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={this.handleChangeEntryOrder}
                    primaryText="Oldest first"
                    value="oldest" />
                <div className="menu-divider" />
                <MenuItem
                    icon={stream.options.onlyUnread ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Only unread"
                    onSelect={this.handleToggleOnlyUnread} />
            </Dropdown>
        );
    }

    renderNavbarTitle() {
        const { stream } = this.props;
        const { readEntryIds } = this.state;

        const unreadCount = stream.unreadCount > 0
            ? (
                <span className="stream-unread-count u-text-truncate">{stream.unreadCount - readEntryIds.size} unread entries</span>
            )
            : null;

        const title = stream.feed
            ? (
                <a className="stream-title u-text-truncate" href={stream.feed.url} target="_blank">{stream.title}</a>
            )
            : (
                <span className="stream-title u-text-truncate">{stream.title}</span>
            );

        return (
            <div className="navbar-title">
                {title}
                {unreadCount}
            </div>
        );
    }

    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                {this.renderNavbarTitle()}
                <div className="navbar-action">
                    <a href="#"><i className="icon icon-24 icon-refresh" /></a>
                </div>
                {this.renderReadEntriesDropdown()}
                {this.renderConfigDropdown()}
            </Navbar>
        );
    }

    renderHeader() {
        const { stream } = this.props;
        const { feed, subscription } = stream;

        if (feed) {
            const { categories } = this.props;

            const subscribeButton = subscription
                ?  (
                    <Dropdown
                        toggleButton={
                            <a className="button button-outline-default dropdown-arrow" href="#">
                                <i className="icon icon-20 icon-settings" />
                            </a>
                        }
                        pullRight={true}>
                        <div className="menu-heading">Category</div>
                        {categories.map(category => (
                            <MenuItem
                                key={category.categoryId}
                                icon={category.categoryId === subscription.categoryId ? <i className="icon icon-16 icon-checkmark" /> : null}
                                primaryText={category.label} />
                        ))}
                        <div className="menu-divider" />
                        <MenuItem primaryText="New Category..." />
                        <div className="menu-divider" />
                        <MenuItem
                            isDisabled={!subscription}
                            primaryText="Unsubscribe" />
                    </Dropdown>
                ) : (<a className="button button-outline-positive dropdown-arrow" href="#">Subscribe</a>);

            return (
                <header className="stream-header">
                    <div className="container">
                        <div className="stream-header-content">
                            <div className="stream-header-content-left">
                                <div className="stream-metadata">
                                    <div className="list-inline list-inline-dotted">
                                        <div className="list-inline-item"><strong>{feed.subscribers}</strong> subscribers</div>
                                        <div className="list-inline-item"><strong>{feed.velocity.toFixed(1)}</strong> entries per week</div>
                                    </div>
                                </div>
                                <div className="stream-description">{feed.description}</div>
                            </div>
                            {subscribeButton}
                        </div>
                    </div>
                </header>
            );
        }

        return null;
    }

    renderEntryList() {
        const { isScrolling, onFetchComments, onFetchFullContent, onPinEntry, onUnpinEntry, scrollTo, stream } = this.props;
        const { readEntryIds } = this.state;

        return (
            <EntryList
                entries={stream ? stream.entries : []}
                isLoading={stream.isLoading && !stream.isLoaded}
                isScrolling={isScrolling}
                onFetchComments={onFetchComments}
                onFetchFullContent={onFetchFullContent}
                onPin={onPinEntry}
                onRead={this.handleReadEntry}
                onUnpin={onUnpinEntry}
                readEntryIds={readEntryIds}
                scrollTo={scrollTo}
                view={stream.options.view} />
        );
    }

    renderFooter() {
        const { stream } = this.props;

        if (stream.continuation) {
            if (stream.isLoading) {
                return (
                    <footer className="stream-footer">
                        <i className="icon icon-32 icon-spinner animation-clockwise-rotation" />
                    </footer>
                );
            } else {
                return (
                    <footer className="stream-footer">
                        <a
                            className="link-default"
                            href="#"
                            onClick={this.handleLoadMoreEntries}>
                            Load more entries...
                        </a>
                    </footer>
                );
            }
        } else {
            return (
                <footer className="stream-footer">
                    No more entries here.
                </footer>
            );
        }
    }

    render() {
        return (
            <div className="l-main">
                <div className="l-main-header">
                    {this.renderNavbar()}
                </div>
                <div className="l-main-content">
                    {this.renderHeader()}
                    {this.renderEntryList()}
                    {this.renderFooter()}
                </div>
            </div>
        );
    }
}

export default connect(
    (state: State) => ({
        categories: state.subscriptions.categories,
        stream: state.stream
    }),
    (dispatch) => ({
        onChangeStreamView: bindAction(changeStreamView, dispatch),
        onFetchComments: bindAction(fetchComments, dispatch),
        onFetchFullContent: bindAction(fetchFullContent, dispatch),
        onFetchMoreEntries: bindAction(fetchMoreEntries, dispatch),
        onFetchStream: bindAction(fetchStream, dispatch),
        onMarkAsRead: bindAction(markAsRead, dispatch),
        onPinEntry: bindAction(pinEntry, dispatch),
        onUnpinEntry: bindAction(unpinEntry, dispatch)
    })
)(StreamPage);
