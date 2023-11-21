import signin from '../fixtures/api/signin.json';
import root from '../fixtures/api/role-root.json';
import guest from '../fixtures/api/role-guest.json';
import user from '../fixtures/api/user.json';
import guestUser from '../fixtures/api/guest-user.json';
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
    cy.visit('/signin');
  });

  it('log in with valid account and password', () => {
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

    // Then I see that the current page is the clusters
    cy.url().should('include', '/clusters');
    cy.location('pathname').should('eq', '/clusters');
    //prompt message: Please change your password promptly when logging in for the first time!
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('exist');
    // close prompt message
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();

    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
    // menu exists for users
    cy.get('[href="/users"]').should('exist');
    cy.get('[href="/users"]').click();
  });

  it('submits form with incorrect email format', () => {
    cy.get('#account').type('root');
    cy.get('#password').type('rooot1');
    cy.get('form').submit();
    // show error message
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    // close error message
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
  });

  it('try to log in with invalid account', () => {
    cy.get('#account').type('root-1');
    cy.get('#password').type('dragonfly');
    cy.get('form').submit();
    // show error message
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    // close error message
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
  });

  it('Try to log in with guest user', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/2',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: guestUser,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/2/roles',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: guest,
        });
      },
    );
    cy.intercept('POST', '/api/v1/users/signin', (req) => {
      (req.body = { name: 'root-2', password: 'dragonrly' }),
        req.reply({
          statusCode: 200,
          body: signin,
        });
    });

    cy.get('#account').type('root-2');
    cy.get('#password').type(`dragonfly`);
    // guest user
    cy.guestSignin();

    cy.get('form').submit();
    // Then I see that the current page is the clusters
    cy.url().should('include', '/clusters');
    cy.location('pathname').should('eq', '/clusters');
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('exist');

    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    // users menu does not exist
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
    //menu not exists for users
    cy.get('[href="/users"]').should('not.exist');
    cy.visit('/users');
  });

  it('click the Create an account button', () => {
    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();
    // Then I see that the current page is the signup
    cy.url().should('include', '/signup');

    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();
    // Then I see that the current page is the signin
    cy.url().should('include', '/signin');
  });

  it('click the password hide button', () => {
    cy.get('#account').type('root');
    cy.get('#password').type(`dragonfly`);

    cy.get('.MuiInputBase-root > .MuiButtonBase-root').click();
    cy.get('#password').should('have.value', 'dragonfly');
  });

  it('try to verify account and password', () => {
    const NameNotLongEnough = _.times(2, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');
    const nameLengthExceeds = _.times(11, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');
    const passwordLengthExceeds = _.times(17, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');

    cy.get('#account').type(NameNotLongEnough);
    cy.get('#account-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 3-10.');

    cy.get('#account').type(nameLengthExceeds);
    cy.get('#account-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 3-10.');

    cy.get('#password').type(passwordLengthExceeds);
    cy.get('#password-helper-text')
      .should('be.visible')
      .and('contain', 'Fill in the characters, the maximum length is 16.');
  });
});
