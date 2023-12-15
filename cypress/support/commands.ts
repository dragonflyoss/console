declare namespace Cypress {
  interface Chainable<Subject> {
    signin(): void;
    guestSignin(): void;
  }
}

Cypress.Commands.add('signin', () => {
  const jwtToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTkwNzMzNDcsImlkIjoxLCJvcmlnX2lhdCI6MTY5ODkwMDU0N30.mplV3_e5ZLKo9Y4YkMpsc8_2GIMj4AgSsw9W-z_qDRM';
  cy.setCookie('jwt', jwtToken);

  cy.intercept(
    {
      method: 'GET',
      url: '/api/v1/users/1',
    },
    { fixture: 'user.json' },
  );
  cy.intercept(
    {
      method: 'GET',
      url: '/api/v1/users/1/roles',
    },
    { fixture: 'role-root.json' },
  );
});

Cypress.Commands.add('guestSignin', () => {
  const jwtToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAwNTExMDcsImlkIjoyLCJvcmlnX2lhdCI6MTY5OTg3ODMwN30.GynYMK_KKFfbAe_NAtFgthmEg_p8xKJOu_ZhRkr1ECE';
  cy.setCookie('jwt', jwtToken);

  cy.intercept(
    {
      method: 'GET',
      url: '/api/v1/users/2',
    },
    { fixture: 'guest-user.json' },
  );
  cy.intercept(
    {
      method: 'GET',
      url: '/api/v1/users/2/roles',
    },
    { fixture: 'role-guest.json' },
  );
});
