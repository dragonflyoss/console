import root from '../fixtures/api/role-root.json';
import guest from '../fixtures/api/role-guest.json';
import user from '../fixtures/api/user.json';
import guestUser from '../fixtures/api/guest-user.json';
import tokens from '../fixtures/api/tokens/tokens.json';
import token from '../fixtures/api/tokens/token.json';
import updateToken from '../fixtures/api/tokens/update-token.json';
import _ from 'lodash';

describe('Update token', () => {
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
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/personal-access-tokens?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: tokens,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/personal-access-tokens/11',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: token,
        });
      },
    );

    cy.visit('/developer/personal-access-tokens/11');
    cy.viewport(1440, 1080);
  });

  it('when data is loaded', () => {
    // Check the token ID.
    cy.get('.MuiPaper-root > .css-0 > :nth-child(1)').should('be.visible').and('contain', '11');

    // Check the token name.
    cy.get('.MuiPaper-root > .css-0 > :nth-child(2)').should('be.visible').and('contain', 'root-11');

    // Check the token description.
    cy.get('#bio').should('have.value', 'root-11 token, used to control of cluster');

    // Check that the preheat checkbox.
    cy.get(
      ':nth-child(1) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input',
    ).should('not.be.checked');

    // Check that the job checkbox.
    cy.get(
      ':nth-child(2) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input',
    ).should('not.be.checked');

    // Check that the cluster checkbox.
    cy.get(':nth-child(3) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input')
      .should('be.checked')
      .check({ force: true });
  });

  it('when no data is loaded', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/personal-access-tokens/11',
      },
      (req) => {
        req.reply({
          statusCode: 401,
          body: { message: 'Not Found' },
        });
      },
    );

    // Check the token ID.
    cy.get('.MuiPaper-root > .css-0 > :nth-child(1)').should('be.visible').and('not.contain', '11');

    // Check the token name.
    cy.get('.MuiPaper-root > .css-0 > :nth-child(2)').should('be.visible').and('not.contain', 'root-11');

    // Check the token description.
    cy.get('#bio').should('have.value', '');

    // Check that the preheat checkbox.
    cy.get(
      ':nth-child(1) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input',
    ).should('not.be.checked');

    // Check that the job checkbox.
    cy.get(
      ':nth-child(2) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input',
    ).should('not.be.checked');

    // Check that the cluster checkbox.
    cy.get(
      ':nth-child(3) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input',
    ).should('not.be.checked');
  });

  it('can update token', () => {
    cy.intercept({ method: 'PATCH', url: '/api/v1/personal-access-tokens/11' }, (req) => {
      (req.body = ''),
        req.reply({
          statusCode: 200,
          body: {
            id: 2,
            created_at: '2023-12-06T03:39:55Z',
            updated_at: '2023-12-06T06:33:29.066Z',
            is_del: 0,
            name: 'root-11',
            bio: 'update root-11',
            token: 'ODhlMjFkY2UtM2Y1ZS00ZTVmLThkMzYtMzE2MzhiNmQxODlj',
            scopes: ['preheat'],
            state: 'active',
            expired_at: '2033-12-03T06:33:27.032Z',
            user_id: 1,
          },
        });
    });

    cy.visit('/developer/personal-access-tokens');

    // Show token name.
    cy.get('#root-11').should('be.visible').and('have.text', 'root-11');

    // Click token name.
    cy.get('#root-11').click();

    // Then I see that the current page is the developer/personal-access-tokens/11!
    cy.url().should('include', '/developer/personal-access-tokens/11');

    cy.get('.MuiPaper-root > .css-0 > :nth-child(2)').should('be.visible').and('contain', 'root-11');

    // Update token description.
    cy.get('#bio').clear();
    cy.get('#bio').type('update root-11');

    // Choose an expiration time of 10 years.
    cy.get('#demo-simple-select').click();
    cy.get('[data-value="3650"]').click();

    cy.get(
      ':nth-child(1) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input',
    ).click();

    // Check if the preheat checkbox is checked.
    cy.get(':nth-child(1) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input')
      .should('be.checked')
      .check({ force: true });

    cy.get(
      ':nth-child(3) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input',
    ).click();

    // Check if the cluster checkbox is checked.
    cy.get(
      ':nth-child(3) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input',
    ).should('not.be.checked');

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/personal-access-tokens?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: updateToken,
        });
      },
    );

    cy.get('#save').click();

    // Check for updated expiration date.
    cy.get(':nth-child(1) > .css-fyy1jt > :nth-child(1) > .css-70qvj9 > .css-189ppmh-MuiTypography-root')
      .should('be.visible')
      .and('have.text', 'Sat, Dec 3 2033.');

    // Then I see that the current page is the developer/personal-access-tokens!
    cy.url().should('include', '/developer/personal-access-tokens');

    // After update is completed, the copyable token will be displayed.
    cy.get('.css-1s0a73l').should('exist');

    // Click the Copy icon button.
    cy.get('.css-1s0a73l > .MuiButtonBase-root').click();

    // Let's check the copied text.
    cy.window()
      .its('navigator.clipboard')
      .then((clip) => clip.readText())
      .should('equal', 'ODhlMjFkY2UtM2Y1ZS00ZTVmLThkMzYtMzE2MzhiNmQxODlj');
  });

  it('click the `CANCEL button', () => {
    cy.get('#cancel').click();

    // Then I see that the current page is the personal-access-tokens!
    cy.url().should('include', '/developer/personal-access-tokens');
  });

  it('unable to update token without required attributes', () => {
    cy.get('#save').click();

    cy.get('.MuiFormHelperText-root').should('exist').and('have.text', 'Please select an option.');
  });

  it('try to update token with guest user', () => {
    cy.visit('/signin');

    cy.guestSignin();

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
    cy.intercept(
      {
        method: 'PATCH',
        url: '/api/v1/personal-access-tokens/11',
      },
      (req) => {
        req.body = {};
        req.reply({
          statusCode: 401,
          body: { message: 'permission deny' },
        });
      },
    );

    cy.visit('/developer/personal-access-tokens/11');

    // Choose an expiration time of 60 days.
    cy.get('#demo-simple-select').click();
    cy.get('[data-value="60"]').click();

    cy.get('#save').click();

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'permission deny');

    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiAlert-message').should('not.exist');
  });

  describe('should handle API error response', () => {
    it('get token API error response', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/personal-access-tokens/10',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.visit('/developer/personal-access-tokens/10');

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      cy.get('.MuiPaper-root > .css-0 > :nth-child(1)').should('be.visible').and('contain', '0');
    });

    it('update token API error response', () => {
      cy.intercept(
        {
          method: 'PATCH',
          url: '/api/v1/personal-access-tokens/11',
        },
        (req) => {
          req.body = {};
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      // Choose an expiration time of 60 days.
      cy.get('#demo-simple-select').click();
      cy.get('[data-value="60"]').click();

      cy.get('#save').click();

      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    });
  });

  it('cannot create token with invalid attributes', () => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const description = _.times(1001, () => _.sample(characters)).join('');

    // Submit form when validation fails.
    cy.get('#save').click();

    // Then I see that the current page is the developer/personal-access-tokens/new!
    cy.url().should('include', '/developer/personal-access-tokens/11');

    // Choose an expiration time of 60 days.
    cy.get('#demo-simple-select').click();
    cy.get('[data-value="60"]').click();

    // Should display message describing the validation error.
    cy.get('#bio').type(description);

    // Show verification error message.
    cy.get('#bio-helper-text').should('exist').and('have.text', 'Fill in the characters, the length is 0-1000.');
    cy.get('#save').click();

    // Then I see that the current page is the developer/personal-access-tokens/new!
    cy.url().should('include', '/developer/personal-access-tokens/11');

    cy.get('#bio').clear();
    cy.get('#bio').type('update token');

    // Verification passed.
    cy.get('#bio-helper-text').should('not.exist');

    // Check that the preheat checkbox.
    cy.get(':nth-child(1) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input')
      .should('not.be.checked')
      .check({ force: true });

    // Check that the job checkbox.
    cy.get(':nth-child(2) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input')
      .should('not.be.checked')
      .check({ force: true });

    // Check that the cluster checkbox.
    cy.get(':nth-child(3) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input')
      .should('be.checked')
      .check({ force: true });
  });
});
