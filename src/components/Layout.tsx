import React, { PureComponent, cloneElement } from 'react';
import classnames from 'classnames';
import { History, Location } from 'history';

import Notifications from 'components/Notifications';
import Sidebar from 'components/Sidebar';
import smoothScroll from 'utils/dom/smoothScroll';

interface LayoutProps {
    children: React.ReactElement<any>;
    location: Location;
    router: History;
}

interface LayoutState {
    isScrolling: boolean;
    sidebarIsOpened: boolean;
}

export default class Layout extends PureComponent<LayoutProps, LayoutState> {
    private unsubscribe: () => void | null;

    constructor(props: LayoutProps, context: any) {
        super(props, context);

        this.state = {
            isScrolling: false,
            sidebarIsOpened: false
        };
    }

    componentWillMount() {
        const { router } = this.props;

        this.unsubscribe = router.listen(this.handleChangeLocation.bind(this));
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    handleChangeLocation() {
        window.scrollTo(0, 0);

        this.refreshSidebar(false);
    }

    handleToggleSidebar() {
        this.refreshSidebar(!this.state.sidebarIsOpened);
    }

    handleCloseSidebar(event: React.SyntheticEvent<any>) {
        if (event.target === event.currentTarget){
            this.refreshSidebar(false);
        }
    }

    refreshSidebar(isOpened: boolean) {
        if (isOpened) {
            document.body.classList.add('sidebar-is-opened');
            document.documentElement.classList.add('sidebar-is-opened');
        } else {
            document.body.classList.remove('sidebar-is-opened');
            document.documentElement.classList.remove('sidebar-is-opened');
        }

        this.setState(state => ({
            ...state,
            sidebarIsOpened: isOpened
        }));
    }

    scrollTo(x: number, y: number): Promise<void> {
        this.setState(state => ({
            ...state,
            isScrolling: true
        }));

        return smoothScroll(document.body, x, y).then(() => {
            this.setState(state => ({
                ...state,
                isScrolling: false
            }));
        });
    }

    render() {
        const { children, location, router } = this.props;
        const { isScrolling, sidebarIsOpened } = this.state;

        const rootClassName = classnames('l-root', {
            'is-opened': sidebarIsOpened,
        });

        return (
            <div className={rootClassName} onClick={this.handleCloseSidebar.bind(this)}>
                <div className='l-sidebar'>
                    <Sidebar router={router} selectedValue={location.pathname} />
                </div>
                <div className="l-notifications">
                    <Notifications />
                </div>
                {cloneElement(children, {
                    isScrolling,
                    onToggleSidebar: this.handleToggleSidebar.bind(this),
                    scrollTo: this.scrollTo.bind(this)
                })}
            </div>
        );
    }
}
