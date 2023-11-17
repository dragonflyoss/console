import root from '../fixtures/api/role-root.json';
import user from '../fixtures/api/user.json';

describe('404', () => {
  beforeEach(() => {
    cy.signin();
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: user,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/1/roles',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: root,
        });
      },
    );
    cy.viewport(1440, 1080);
  });

  it('404', () => {
    cy.visit('/404');
    cy.get('.MuiTypography-h4').should('have.text', 'Something gone wrong!');
    cy.get('.MuiButtonBase-root').click();
    cy.url().should('include', '/clusters');
  });
});
