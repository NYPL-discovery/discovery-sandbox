export default {
  appTitle: 'NYPL | Discovery',
  appName: 'discovery',
  displayTitle: 'Shared Collection Catalog',
  baseUrl: '/research/collections/shared-collection-catalog',
  favIconPath: '//d2znry4lg8s0tq.cloudfront.net/images/favicon.ico',
  port: 3001,
  webpackDevServerPort: 3000,
  api: {
    development: 'https://api.nypltech.org/api/v0.1',
    production: 'https://platform.nypl.org/api/v0.1',
  },
  loginUrl: 'https://login.nypl.org/auth/login',
  tokenUrl: 'https://isso.nypl.org/',
  publicKey:
    '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA44ilHg/PxcJYsISHMRyo\n' +
    'xsmez178qZpkJVXg7rOMVTLZuf05an7Pl+lX4nw/rqcvGQDXyrimciLgLkWu00xh\n' +
    'm6h6klTeJSNq2DgseF8OMw2olfuBKq1NBQ/vC8U0l5NJu34oSN4/iipgpovqAHHB\n' +
    'GV4zDt0EWSXE5xpnBWi+w1NMAX/muB2QRfRxkkhueDkAmwKvz5MXJPay7FB/WRjf\n' +
    '+7r2EN78x5iQKyCw0tpEZ5hpBX831SEnVULCnpFOcJWMPLdg0Ff6tBmgDxKQBVFI\n' +
    'Q9RrzMLTqxKnVVn2+hVpk4F/8tMsGCdd4s/AJqEQBy5lsq7ji1B63XYqi5fc1SnJ\n' +
    'EQIDAQAB\n' +
    '-----END PUBLIC KEY-----',
  defaultFilters: {
    materialType: [],
    language: [],
    dateAfter: '',
    dateBefore: '',
  },
};
