import React from "react";
import { Switch, Route } from 'react-router-dom';
import { withRouter } from 'react-router';
import routes from './routes';
import { Header , Body } from './components'

import './styles/core.css';

const App = ()=><>
    <Header/>
    <Body>
      <Switch>
        {routes.map(route =>
          <Route
            {...route}
            key={route.path}
          />
        )}
      </Switch>
    </Body>
</>

export default withRouter(App);
