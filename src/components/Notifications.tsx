import CSSTransitionGroup from 'react-addons-css-transition-group';
import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

import Notification from 'components/parts/Notification';
import bindAction from 'supports/bindAction';
import connect from 'supports/react/connect';
import { Notification as NotificationType, State } from 'messaging/types';
import { dismissNotification } from 'messaging/actions';

interface NotificationsProps {
    onDismissNotification: (id: number) => void;
    isReversed?: boolean;
    notifications: NotificationType[];
}

class Notifications extends PureComponent<NotificationsProps, {}> {
    static propTypes = {
        onDismissNotification: PropTypes.func.isRequired,
        isReversed: PropTypes.bool.isRequired,
        notifications: PropTypes.arrayOf(PropTypes.object).isRequired
    };

    static defaultProps = {
        isReversed: false
    };

    handleClose(id: number) {
        const { onDismissNotification } = this.props;

        onDismissNotification(id);
    }

    render() {
        const { isReversed, notifications } = this.props;

        return (
            <CSSTransitionGroup
                component="div"
                className={classnames('notifications', {
                    'notifications-reversed': isReversed
                })}
                transitionName="notification"
                transitionEnterTimeout={200}
                transitionLeaveTimeout={200}>
                {notifications.map(({ id, kind, message }: any) =>
                    <Notification
                        isReversed={isReversed}
                        key={id}
                        kind={kind}
                        onClose={this.handleClose.bind(this, id)}>
                        {message}
                    </Notification>
                )}
            </CSSTransitionGroup>
        );
    }
}

export default connect(
    (state: State) => ({
        notifications: state.notifications
    }),
    (dispatch) => ({
        onDismissNotification: bindAction(dismissNotification, dispatch)
    })
)(Notifications);
