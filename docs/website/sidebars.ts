import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'guides/CLAUDE_INTEGRATION_GUIDE',
        'guides/API_USAGE_GUIDE',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/API_DOCUMENTATION',
        'api/TOOL_REFERENCE',
      ],
    },
    {
      type: 'category',
      label: 'Testing',
      items: [
        'testing/INTEGRATION_TESTING',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      items: [
        'contributing/contributing',
      ],
    },
  ],
};

export default sidebars;
