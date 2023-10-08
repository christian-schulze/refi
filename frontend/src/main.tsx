import React from 'react';
import { createRoot } from 'react-dom/client';

import { GetPathSeperator } from '../wailsjs/go/fs/FS';

import { App } from 'components/App';

const container = document.getElementById('root');

const root = createRoot(container!);

declare global {
  interface Window {
    pathSeperator: string;
  }
}

GetPathSeperator().then((pathSeperator) => {
  window.pathSeperator = pathSeperator;

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
