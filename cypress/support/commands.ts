declare namespace Cypress {
  interface Chainable<Subject> {
    signin(): void;
  }
}

Cypress.Commands.add('signin', () => {
  const jwtToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTkwNzMzNDcsImlkIjoxLCJvcmlnX2lhdCI6MTY5ODkwMDU0N30.mplV3_e5ZLKo9Y4YkMpsc8_2GIMj4AgSsw9W-z_qDRM';
  cy.setCookie('jwt', jwtToken);
});
