import tokens from '../fixtures/tokens/tokens.json';
import createToken from '../fixtures/tokens/create-token.json';
import _ from 'lodash';

describe('Create token', () => {
  beforeEach(() => {
    cy.signin();

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
    cy.visit('/developer/personal-access-tokens/new');

    cy.viewport(1440, 1080);
  });

  it('can create token', () => {
    cy.visit('/developer/personal-access-tokens');

    // Click the `ADD PERSONAL ACCESS TOKENS` button.
    cy.get('.css-1qdyvok > .MuiButtonBase-root').click();

    // Then I see that the current page is the developer/personal-access-tokens/new!
    cy.url().should('include', '/developer/personal-access-tokens/new');

    cy.get('#name').type('root-12');

    // Choose an expiration time of 60 days.
    cy.get('#demo-simple-select').click();
    cy.get('[data-value="60"]').click();

    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/personal-access-tokens',
      },
      (req) => {
        req.body = {};
        req.reply({
          statusCode: 200,
          body: {
            id: 12,
            created_at: '2023-12-05T11:26:32Z',
            updated_at: '2023-12-05T11:26:32Z',
            is_del: 0,
            name: 'root-12',
            bio: '',
            token: 'ZjM1NzM1NGItYjYwYi00OTEyLTlmN2QtNjc5M2JhNzhiOTI3',
            scopes: [],
            state: 'active',
            expired_at: '2033-12-02T11:26:17Z',
            user_id: 2,
          },
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
          body: createToken,
        });
      },
    );

    cy.get('#save').click();

    // Then I see that the current page is the developer/personal-access-tokens!
    cy.url().should('include', '/developer/personal-access-tokens');

    // After creation is completed, the copyable token will be displayed.
    cy.get('.css-1s0a73l').should('exist');

    // Click the Copy icon button.
    cy.get('.css-1s0a73l > .MuiButtonBase-root').click();

    // The copy icon is no longer displayed.
    cy.get('#copy').should('not.exist');

    // Shwo done icon.
    cy.get('#done').should('exist');

    // Show `copied!` text.
    cy.get('.MuiTooltip-tooltip').should('exist').and('have.text', 'copied!');

    // Let's check the copied text.
    cy.window()
      .its('navigator.clipboard')
      .then((clip) => clip.readText())
      .should('equal', 'ZjM1NzM1NGItYjYwYi00OTEyLTlmN2QtNjc5M2JhNzhiOTI3');

    cy.wait(1000);

    cy.get('#copy').should('exist');
    cy.get('#done').should('not.exist');
    cy.get('.MuiTooltip-tooltip').should('not.exist');

    // Display successfully created token information.
    cy.get('#root-12').should('be.visible').and('have.text', 'root-12');

    // Refresh page.
    cy.reload().then(() => {
      cy.wait(2000);
    });

    // When you click refresh, the replication token will not be displayed again for your security.
    cy.get('.css-1s0a73l').should('not.exist');
  });

  it('cannot create token with existing token', () => {
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/personal-access-tokens',
      },
      (req) => {
        req.body = {};
        req.reply({
          statusCode: 409,
          body: { message: 'Conflict' },
        });
      },
    );

    cy.get('#name').type('root-12{enter}');

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Conflict');
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiPaper-root').should('not.exist');
  });

  it('click the `CANCEL button', () => {
    cy.get('#cancel').click();

    // Then I see that the current page is the developer/personal-access-tokens!
    cy.url().should('include', '/developer/personal-access-tokens');
  });

  it('token cannot be created without required attributes', () => {
    cy.get('#save').click();

    cy.get('#name-helper-text').should('exist').and('have.text', 'Fill in the characters, the length is 1-100.');
  });

  it('try to create token with guest user', () => {
    cy.visit('/signin');

    cy.guestSignin();

    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/personal-access-tokens',
      },
      (req) => {
        req.body = {};
        req.reply({
          statusCode: 401,
          body: { message: 'permission deny' },
        });
      },
    );

    cy.visit('/developer/personal-access-tokens/new');

    // Users menu does not exist.
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');

    cy.get('#name').type('root-12{enter}');

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'permission deny');
  });

  it('should handle API error response', () => {
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/personal-access-tokens',
      },
      (req) => {
        req.body = {};
        req.reply({
          forceNetworkError: true,
        });
      },
    );

    cy.get('#name').type('root-12{enter}');

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
  });

  it('cannot create token with invalid attributes', () => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const name = _.times(101, () => _.sample(characters)).join('');
    const description = _.times(1001, () => _.sample(characters)).join('');

    // Should name message describing the validation error.
    cy.get('#name').type(name);

    // Show verification error message.
    cy.get('#name-helper-text').should('exist').and('have.text', 'Fill in the characters, the length is 1-100.');

    // Submit form when validation fails.
    cy.get('#save').click();

    // Then I see that the current page is the developer/personal-access-tokens/new!
    cy.url().should('include', '/developer/personal-access-tokens/new');
    cy.get('#name').clear();

    // Enter the correct name.
    cy.get('#name').type('root-12');

    // Should display message describing the validation error.

    cy.get('#bio').type(description);

    // Show verification error message.
    cy.get('#bio-helper-text').should('exist').and('have.text', 'Fill in the characters, the length is 0-1000.');
    cy.get('#save').click();

    // Then I see that the current page is the developer/personal-access-tokens/new!
    cy.url().should('include', '/developer/personal-access-tokens/new');

    cy.get(
      ':nth-child(1) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input',
    ).click();

    // Check if the preheat checkbox is checked.
    cy.get(':nth-child(1) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input')
      .should('be.checked')
      .check({ force: true });

    cy.get(
      ':nth-child(2) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input',
    ).click();

    // Check if the job checkbox is checked.
    cy.get(':nth-child(2) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input')
      .should('be.checked')
      .check({ force: true });

    cy.get(
      ':nth-child(3) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input',
    ).click();

    // Check if the cluster checkbox is checked.
    cy.get(':nth-child(3) > .MuiBox-root > .MuiFormControlLabel-root > .MuiButtonBase-root > .PrivateSwitchBase-input')
      .should('be.checked')
      .check({ force: true });
  });
});
