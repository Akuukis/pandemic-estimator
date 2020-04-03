import * as React from 'react'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'

import { ROUTES } from './constants/routes'
import App from './containers/App'
import Contact from './containers/Contact'
import Home from './containers/Home'
import Methodology from './containers/Methodology'


export default (
    <Router>
        <App>
            <Switch>
                <Route path={ROUTES.METHODOLOGY}>
                    <Methodology />
                </Route>
                <Route path={ROUTES.CONTACT}>
                    <Contact />
                </Route>
                <Route path={ROUTES.FULLSCREEN}>
                    <Home />
                </Route>
                <Route path={ROUTES.HOME}>
                    <Home />
                </Route>
                <Redirect from='*' to={ROUTES.HOME} />
            </Switch>
        </App>
    </Router>
)
