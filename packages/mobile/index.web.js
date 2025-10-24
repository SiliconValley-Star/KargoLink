import React from 'react';
import {AppRegistry} from 'react-native';
import App from './src/App';

// Web platform için register
AppRegistry.registerComponent('CargoLinkMobile', () => App);

// DOM'da çalıştır
if (typeof document !== 'undefined') {
  const rootElement = document.getElementById('app-root') || document.getElementById('root');
  if (rootElement) {
    AppRegistry.runApplication('CargoLinkMobile', {
      initialProps: {},
      rootTag: rootElement,
    });
  }
}