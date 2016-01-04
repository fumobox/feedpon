import Content from './Content'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import Sidebar from './Sidebar'
import appContextTypes from './appContextTypes'
import { GetCredential, GetCategoriesCache, GetSubscriptionsCache, GetUnreadCountsCache } from '../../constants/actionTypes'

export default class Main extends React.Component {
    static propTypes = {
        subscriptions: React.PropTypes.array.isRequired,
        categories: React.PropTypes.array.isRequired,
        unreadCounts: React.PropTypes.array.isRequired,
        contents: React.PropTypes.object,
        selectedStreamId: React.PropTypes.string,
        credential: React.PropTypes.object,
    }

    static contextTypes = appContextTypes

    componentDidMount() {
        this.context.dispatch({ actionType: GetCredential })
        this.context.dispatch({ actionType: GetCategoriesCache })
        this.context.dispatch({ actionType: GetSubscriptionsCache })
        this.context.dispatch({ actionType: GetUnreadCountsCache })
    }

    handleAuthenticate() {
        this.context.dispatch({ actionType: Authenticate })
    }

    render() {
        return (
            <div>
                {this.renderHeader()}
                {this.renderMain()}
            </div>
        )
    }

    renderHeader() {
        return (
            <header className="l-header">
                <div className="notification"></div>
                <nav className="nav">
                    <ul>
                    </ul>
                </nav>
            </header>
        )
    }

    renderMain() {
        const { subscriptions, unreadCounts, categories, contents, credential, selectedStreamId } = this.props

        if (credential) {
            return (
                <div>
                    <Sidebar subscriptions={subscriptions} unreadCounts={unreadCounts} categories={categories} credential={credential} selectedStreamId={selectedStreamId} />
                    <Content contents={contents} />
                </div>
            )
        } else {
            return (
                <div>
                    <button className="button button-default button-fill" onClick={::this.handleAuthenticate}>Authenticate</button>
                </div>
            )
        }
    }
}

Object.assign(Main.prototype, PureRenderMixin)
