import React from 'react';
import { addons, types } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';
import { Route } from 'storybook/internal/router';
import { Catalog } from './catalog/Catalog';
import { SwiftGallery } from './catalog/SwiftGallery';
import './catalog/catalog.css';

const font = '"Space Grotesk", "Helvetica Neue", Arial, sans-serif';
addons.setConfig({
  theme: create({
    base: 'light', brandTitle: 'EnoughUI', brandUrl: '/?path=/catalog/', brandImage: '/brand/enough-ui-ink.svg',
    fontBase: font, fontCode: font, colorPrimary: '#12151c', colorSecondary: '#3b4fe4',
    appBg: '#f4f5f8', appContentBg: '#ffffff', appBorderColor: '#dde1e8', appBorderRadius: 0,
    textColor: '#12151c', barSelectedColor: '#3b4fe4',
  }),
  layoutCustomisations: {
    showSidebar: (state, fallback) => (state.path?.startsWith('/catalog') || state.path?.startsWith('/swift')) ? false : fallback,
    showPanel: (state, fallback) => (state.path?.startsWith('/catalog') || state.path?.startsWith('/swift')) ? false : fallback,
    showToolbar: (state, fallback) => (state.path?.startsWith('/catalog') || state.path?.startsWith('/swift')) ? false : fallback,
  },
});
addons.register('enough-ui/catalog', () => {
  addons.add('enough-ui/swift/page', {
    id: 'enough-ui/swift/page', type: types.experimental_PAGE, title: 'Swift', url: '/swift/',
    render: () => <Route path="/swift" startsWith><SwiftGallery /></Route>,
  });
  addons.add('enough-ui/catalog/page', {
    id: 'enough-ui/catalog/page', type: types.experimental_PAGE,
    title: 'Components', url: '/catalog/',
    render: () => <Route path="/catalog" startsWith><Catalog /></Route>,
  });
});
