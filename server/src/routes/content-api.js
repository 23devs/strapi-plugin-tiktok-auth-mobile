export default [
  {
    method: 'POST',
    path: '/connect',
    handler: 'tiktokAuth.connect',
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/callback',
    handler: 'tiktokAuth.callback',
    config: {
      auth: false,
      policies: [],
    },
  },
];
