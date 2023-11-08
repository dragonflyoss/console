import signin from '../fixtures/api/signin.json';
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
  });

  it('signin failed', () => {
    cy.visit('/signin');
    cy.get('#account').type('root');
    cy.get('#password').type('rooot1');
    cy.get('form').submit();
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
  });

  it('signin suceesfully', () => {
    cy.visit('/signin');
    cy.get('#account').type('root');
    cy.get('#password').type(`dragonfly`);
    cy.get('.MuiInputBase-root > .MuiButtonBase-root').click();
    cy.get('form').submit();
  });

  it('Switch to the signup page', () => {
    cy.visit('/signin');
    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();
    cy.url().should('include', '/signup');
    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();
    cy.url().should('include', '/signin');
  });

  it('password hidden function', () => {
    cy.visit('/signin');
    cy.get('#account').type('root');
    cy.get('#password').type(`dragonfly`);
    cy.get('.MuiInputBase-root > .MuiButtonBase-root').click();
    cy.get('#password').should('have.value', 'dragonfly');
  });

  it('ErrorVerification', () => {
    cy.visit('/signin');
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
