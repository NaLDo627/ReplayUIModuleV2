import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Router from './router'
import * as serviceWorker from './serviceWorker';

import { createStore } from "redux";
import rootReducer from "./store/modules";
import { Provider } from "react-redux";

// for test
import ReplayPubg from "./components/Replay";

// **** 리덕스 개발자도구 적용
const devTools =
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
const store = createStore(rootReducer, devTools);
console.log(store.getState());

// class ReplayUIApp extends Component {
//     render() {
//         return (
//             <Router />
//             )
//     }
// }

//ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
//ReactDOM.render(<ReplayUIApp />, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
