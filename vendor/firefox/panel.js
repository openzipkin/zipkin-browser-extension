import React from 'react';
import {render} from 'react-dom';
import ZipkinPanel from '../../js/ZipkinPanel';
import PanelToAddonPubsub from './PanelToAddonPubsub';

const pubsub = new PanelToAddonPubsub(window);

// setInterval(() => pubsub.pub('ping from panel', {}), 1000);
render(<ZipkinPanel pubsub={pubsub} />, document.getElementById('content'));
