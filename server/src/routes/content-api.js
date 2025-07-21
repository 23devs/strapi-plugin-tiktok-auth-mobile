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
];
