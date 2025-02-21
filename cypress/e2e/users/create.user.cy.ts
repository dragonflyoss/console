import _ from 'lodash';
import createUsers from '../../fixtures/users/create-user.json';
import users from '../../fixtures/users/users.json';

describe('Create user', () => {
  beforeEach(() => {
    cy.signin();

    cy.visit('/users/new');

    cy.viewport(1440, 1080);
  });

  it('can create user', () => {
    cy.visit('/users');

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: users,
        });
      },
    );

    // Go to last page.
    cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

    // There is only one piece of data on the last pag.
    cy.get('#user-table-body').children().should('have.length', 1);

    cy.get('#create-user').click();

    // Then I see that the current page is the New user!
    cy.url().should('include', '/users/new');

    cy.get('.MuiBreadcrumbs-ol').should('contain', 'New user');

    cy.get('#account').type('billy');

    cy.get('#email').type('billy@example.com');

    cy.get('#bio').type('I am billy');

    cy.get('#phone').type('18012341234');

    cy.get('#location').type('ParisFrance');

    cy.get('#password').type('Dragonfly1');

    cy.get('#confirmPassword').type('Dragonfly1');

    cy.intercept('POST', '/api/v1/users/signup', (req) => {
      req.reply({
        statusCode: 200,
        body: [],
      });
    });

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: createUsers,
        });
      },
    );

    cy.get('#save').click();

    // Go to last page.
    cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

    // There is only one piece of data on the last pag.
    cy.get('#user-table-body').children().should('have.length', 2);

    cy.get('#user-table-body > :nth-child(2) > :nth-child(2)').should('have.text', 'billy');
  });

  it('cannot create account with existing email', () => {
    cy.intercept('POST', '/api/v1/users/signup', (req) => {
      req.reply({
        statusCode: 409,
        body: {
          message: 'Conflict',
        },
      });
    });

    cy.get('#account').type('root-1');
    cy.get('#email').type('lucy@example.com');
    cy.get('#phone').type('18012341234');
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly1{enter}`);

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Conflict');

    // Close error message.
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
  });

  it('cannot create account with existing account', () => {
    cy.intercept('POST', '/api/v1/users/signup', (req) => {
      req.reply({
        statusCode: 409,
        body: {
          message: 'Conflict',
        },
      });
    });

    cy.get('#account').type('root');
    cy.get('#email').type('root@console.co');
    cy.get('#phone').type('18012341234');
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly1{enter}`);

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Conflict');
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
  });

  it('click the password hide butto and confirm password hide butto', () => {
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly1{enter}`);

    cy.get('.MuiInputBase-root > .MuiButtonBase-root > [data-testid="VisibilityOffIcon"] > path').click();
    cy.get('#confirmPassword').should('have.value', 'dragonfly1');

    cy.get('[data-testid="VisibilityOffIcon"]').click();
    cy.get('#confirmPassword').should('have.value', 'dragonfly1');
  });

  it('should handle API error response', () => {
    cy.intercept('POST', '/api/v1/users/signup', (req) => {
      req.reply({
        forceNetworkError: true,
      });
    });

    cy.get('#account').type('root-1');
    cy.get('#email').type('root@console.com');
    cy.get('#phone').type('18012341234');
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly1{enter}`);

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
  });

  it('click the `CANCEL button', () => {
    cy.get('#cancel').click();

    // Then I see that the current page is the users!
    cy.url().should('include', '/users');
  });

  it('cannot signup with invalid attributes', () => {
    const nameNotLongEnough = _.times(2, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');
    const nameLengthExceeds = _.times(11, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');
    const passsword = _.times(8, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');
    const location = _.times(101, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');

    // Should display message account the validation error.
    cy.get('#account').type(nameNotLongEnough);
    cy.get('#account-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 3-10.');

    cy.get('#account').type(nameLengthExceeds);
    cy.get('#account-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 3-10.');

    cy.get('#account').clear();

    cy.get('#account').type('root');

    // Verification passed.
    cy.get('#account-helper-text').should('not.exist');

    // Should display message email the validation error.
    cy.get('#email').type('root');
    cy.get('#email-helper-text').should('be.visible').and('contain', 'Email is invalid or already taken.');

    cy.get('#email').clear();

    cy.get('#email').type('root@console.com');

    // Verification passed.
    cy.get('#email-helper-text').should('not.exist');

    // Should display message phone the validation error.
    cy.get('#phone').type('001');
    cy.get('#phone-helper-text').should('be.visible').and('contain', 'Enter a valid phone number.');

    cy.get('#phone').clear();

    cy.get('#phone').type('+86 19101011212');

    cy.get('#phone-helper-text').should('not.exist');

    // Should display message location the validation error.
    cy.get('#location').clear();
    cy.get('#location').type(location);

    // Show verification error message.
    cy.get('#location-helper-text')
      .should('be.visible')
      .and('have.text', 'Fill in the characters, the length is 0-100.');
    cy.get('#location').clear();
    cy.get('#location').type('Shanghai');
    cy.get('#location-helper-text').should('not.exist');

    // Should display message password the validation error.
    cy.get('#password').type(passsword);

    // Missing number.
    cy.get('#password-helper-text')
      .should('be.visible')
      .and('contain', 'At least 8-16 characters, with at least 1 lowercase letter and 1 number.');

    cy.get('#password').clear();

    cy.get('#password').type('dragonfly1');

    // Verification passed.
    cy.get('#password-helper-text').should('not.exist');

    // Should display message confirm password the validation error.
    cy.get('#confirmPassword').type(`dragonfly`);

    // Confirm password verification error when the two passwords are not the same.
    cy.get('#confirmPassword-helper-text').should('be.visible').and('contain', 'Please enter the same password.');

    cy.get('#confirmPassword').clear();

    cy.get('#confirmPassword').type('dragonfly1');

    // verification passed.
    cy.get('#confirmPassword-helper-text').should('not.exist');
  });
});
