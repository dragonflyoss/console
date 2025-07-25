import signin from '../../fixtures/signin/signin.json';
import _ from 'lodash';

describe('Signin', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v1/users/signin', (req) => {
      const { name, password } = req.body;

      if (name === 'root' && password === 'dragonfly') {
        req.reply({
          statusCode: 200,
          body: signin,
        });
      } else {
        req.reply({
          statusCode: 401,
          body: {
            message: 'Unauthorized',
          },
        });
      }
    });

    cy.visit('/signin');
  });

  it('signin with valid account and password', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/schedulers?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );

    cy.get('#account').type('root');
    cy.get('#password').type(`dragonfly`);

    cy.signin();
    cy.get('form').submit();

    // Then I see that the current page is the clusters.
    cy.url().should('include', '/clusters');
    cy.location('pathname').should('eq', '/clusters');

    // Prompt message: Please change your password promptly when logging in for the first time!
    cy.get('#change-password-warning').should('exist');

    // Close the prompt message.
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('#change-password-warning').should('not.exist');

    // Menu exists users.
    cy.get('[href="/users"]').should('exist');
  });

  it('try to signin with valid account and invalid password', () => {
    cy.get('#account').type('root');
    cy.get('#password').type('rooot1');
    cy.get('form').submit();

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiAlert-message').should('not.exist');
  });

  it('try to signin with invalid account', () => {
    cy.get('#account').type('root-1');
    cy.get('#password').type('dragonfly');
    cy.get('form').submit();

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiAlert-message').should('not.exist');
  });

  it('try to signin with guest user', () => {
    cy.intercept('POST', '/api/v1/users/signin', (req) => {
      (req.body = { name: 'root-2', password: 'dragonrly' }),
        req.reply({
          statusCode: 200,
          body: signin,
        });
    });

    cy.get('#account').type('root-2');
    cy.get('#password').type(`dragonfly`);

    cy.guestSignin();

    cy.get('form').submit();

    // Then I see that the current page is the clusters!
    cy.url().should('include', '/clusters');
    cy.location('pathname').should('eq', '/clusters');
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('exist');

    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();

    // Users menu does not exist.
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');

    // Menu not exists for users.
    cy.get('[href="/users"]').should('not.exist');
  });

  it('click the `Create an account` button', () => {
    cy.get('#create-account').click();

    // Then I see that the current page is the signup!
    cy.url().should('include', '/signup');

    cy.get('#sign-in').click();

    // Then I see that the current page is the signin!
    cy.url().should('include', '/signin');
  });

  it('click the password hide button', () => {
    cy.get('#account').type('root');
    cy.get('#password').type(`dragonfly`);

    cy.get('#visibility-off').click();
    cy.get('#password').should('have.value', 'dragonfly');

    cy.get('#visibility').click();
    cy.get('#password').should('not.have.text', 'dragonfly');
  });

  it('should handle API error response', () => {
    cy.intercept('POST', '/api/v1/users/signin', (req) => {
      (req.body = { name: 'root', password: 'dragonfly' }),
        req.reply({
          forceNetworkError: true,
        });
    });

    cy.get('#account').type('root');
    cy.get('#password').type(`dragonfly`);

    cy.get('form').submit();

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiAlert-message').should('not.exist');
  });

  it('try to verify account and password', () => {
    const nameNotLongEnough = _.times(2, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');
    const nameLengthExceeds = _.times(11, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');
    const passwordLengthExceeds = _.times(17, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');

    cy.get('#account').type(nameNotLongEnough);

    // Show account help text.
    cy.get('#account-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 3-10.');

    cy.get('#account').type(nameLengthExceeds);
    cy.get('#account-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 3-10.');

    // Show password help text.
    cy.get('#password').type(passwordLengthExceeds);
    cy.get('#password-helper-text')
      .should('be.visible')
      .and('contain', 'Fill in the characters, the maximum length is 16.');
  });
});
