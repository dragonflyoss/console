import signup from '../fixtures/signup.json';
import _ from 'lodash';

describe('Signup', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v1/users/signup', (req) => {
      const { name, password, email } = req.body;
      if (name === 'root-1' && password === 'dragonfly1' && email === 'root@console.com') {
        req.reply({
          statusCode: 200,
          body: signup,
        });
      } else {
        req.reply({
          statusCode: 409,
          body: {
            message: 'Conflict',
          },
        });
      }
    });
    cy.visit('/signup');
  });

  it('can create user account', () => {
    cy.get('#account').type('root-1');
    cy.get('#email').type('root@console.com');
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly1{enter}`);

    // Then I see that the current page is the signin!
    cy.url().should('include', '/signin');
  });

  it('cannot create account with existing email', () => {
    cy.get('#account').type('root-1');
    cy.get('#email').type('lucy@example.com');
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly1{enter}`);

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Conflict');

    // Close error message.
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
  });

  it('cannot create account with existing account', () => {
    cy.get('#account').type('root');
    cy.get('#email').type('root@console.co');
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

  it('cannot signup without required attributes', () => {
    cy.get('.MuiButton-root').click();

    cy.get('#account-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 3-10.');
    cy.get('#email-helper-text').should('be.visible').and('contain', 'Email is invalid or already taken.');
    cy.get('#confirmPassword-helper-text').should('be.visible').and('contain', 'Please enter the same password.');
    cy.get('#confirmPassword-helper-text').should('be.visible').and('contain', 'Please enter the same password.');
  });

  it('should handle API error response', () => {
    cy.intercept('POST', '/api/v1/users/signup', (req) => {
      (req.body = { name: 'root-1', password: 'dragonrly1', email: 'root@console.com' }),
        req.reply({
          forceNetworkError: true,
        });
    });

    cy.get('#account').type('root-1');
    cy.get('#email').type('root@console.com');
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly1{enter}`);

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
  });

  it('click the `Sign in` button', () => {
    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();

    // Then I see that the current page is the signin!
    cy.url().should('include', '/signin');

    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();

    // Then I see that the current page is the signup!
    cy.url().should('include', '/signup');
  });

  it('cannot signup with invalid attributes', () => {
    const nameNotLongEnough = _.times(2, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');
    const nameLengthExceeds = _.times(11, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');
    const passsword = _.times(8, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');

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
