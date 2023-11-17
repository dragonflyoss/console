import signup from '../fixtures/api/signup.json';
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

  it('Password hidden function', () => {
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly1{enter}`);
    cy.get('.MuiInputBase-root > .MuiButtonBase-root > [data-testid="VisibilityOffIcon"] > path').click();
    cy.get('#confirmPassword').should('have.value', 'dragonfly1');
    cy.get('[data-testid="VisibilityOffIcon"]').click();
    cy.get('#confirmPassword').should('have.value', 'dragonfly1');
  });

  it('Signup success', () => {
    cy.get('#account').type('root-1');
    cy.get('#email').type('root@console.com');
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly1{enter}`);
    cy.url().should('include', '/signin');
  });

  it('Signup failed', () => {
    cy.get('#account').type('root');
    cy.get('#email').type('root@console.com');
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly1{enter}`);
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Conflict');
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
  });

  it('Switch to the signin page', () => {
    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();
    cy.url().should('include', '/signin');
    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();
    cy.url().should('include', '/signup');
  });

  it('Validation error', () => {
    const NameNotLongEnough = _.times(2, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');
    const nameLengthExceeds = _.times(11, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');
    cy.get('#account').type(NameNotLongEnough);
    cy.get('#account-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 3-10.');
    cy.get('#account').type(nameLengthExceeds);
    cy.get('#account-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 3-10.');
    cy.get('#account').clear();
    cy.get('#account').type('root');
    cy.get('#account-helper-text').should('not.exist');
    cy.get('#email').type('root');
    cy.get('#email-helper-text').should('be.visible').and('contain', 'Email is invalid or already taken.');
    cy.get('#email').clear();
    cy.get('#email').type('root@console.com');
    cy.get('#email-helper-text').should('not.exist');
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly`);
    cy.get('#confirmPassword-helper-text').should('be.visible').and('contain', 'Please enter the same password.');
    cy.get('#confirmPassword').clear();
    cy.get('#confirmPassword').type('dragonfly1');
    cy.get('#confirmPassword-helper-text').should('not.exist');
  });
});
