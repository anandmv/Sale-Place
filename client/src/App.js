import React from "react";
import { Switch, Route } from 'react-router-dom';
import { withRouter } from 'react-router';
import routes from './routes';
import { Header , Body } from './components'

import './styles/core.css';

import firebase from '@firebase/app';
import '@firebase/firestore';
import { FirestoreProvider } from 'react-firestore';
import firebaseConfig from './firebase-config';

firebase.initializeApp(firebaseConfig);

const App = ()=><>
    <Header/>
    <FirestoreProvider firebase={firebase}>
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
    </FirestoreProvider>
</>

export default withRouter(App);
