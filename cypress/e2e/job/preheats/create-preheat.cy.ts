import clusters from '../../../fixtures/clusters/clusters.json';
import preheats from '../../../fixtures/job/preheats/preheats.json';
import createPreheat from '../../../fixtures/job/preheats/create-preheat.json';
import _ from 'lodash';

describe('Create preheat', () => {
  beforeEach(() => {
    cy.signin();
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusters,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10&type=preheat',
      },
      (req) => {
        req.reply((res: any) => {
          const responseHeaders = {
            ...res.headers,
            Link: '</api/v1/jobs?page=1&per_page=10&state=FAILURE>;rel=prev,</api/v1/jobs?page=2&per_page=10&state=FAILURE>;rel=next,</api/v1/jobs?page=1&per_page=10&state=FAILURE>;rel=first,</api/v1/jobs?page=2&per_page=10&state=FAILURE>;rel=last',
          };
          res.send(200, preheats, responseHeaders);
        });
      },
    );
    cy.visit('/jobs/preheats/new');
    cy.viewport(1440, 1080);
  });

  it('click the `CANCEL button', () => {
    cy.get('#cancel').click();

    // Then I see that the current page is the preheats page!
    cy.url().should('include', '/jobs/preheats');
  });

  it('can create preheat', () => {
    cy.visit('/jobs/preheats');
    cy.get('#new-preheat').click();

    cy.url().should('include', '/jobs/preheats/new');

    cy.get('.MuiTypography-h5').should('have.text', 'Create Preheat');

    cy.get('#description').type('create preheat');

    // Select a cluster.
    cy.get('#cluster').type('cluster-1{enter}');

    cy.get('body').click('topLeft');

    cy.get('#pieceLength').type('4');

    // Select a scope.
    cy.get('#select-scope').click();

    cy.get('#all_seed_peers').click();

    // Add url.
    cy.get('#url').type('https://example.com/path/to/file');

    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/jobs',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: createPreheat,
        });
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs/12',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: createPreheat,
        });
      },
    );

    cy.get('#save').click();

    // Then I see that the current page is the preheats page!
    cy.url().should('include', '/jobs/preheats/12');

    // Displays successfully added preheat task.
    cy.get('#description').should('have.text', 'create preheat');
    cy.get('#status').should('have.text', 'PENDING');
    cy.get('#id').should('have.text', 12);
    cy.get('#piece-length').should('have.text', '4 MiB');
  });

  it('cannot to use cluster without scheduler for preheat', () => {
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/jobs',
      },
      (req) => {
        req.reply({
          statusCode: 500,
          body: { message: 'candidate schedulers not found' },
        });
      },
    );

    cy.get('#cluster').click();
    cy.contains('li', 'cluster-2').click();
    cy.get('body').click('topLeft');

    // Select a scope.
    cy.get('#select-scope').click();
    cy.get('body').click('topLeft');
    cy.get('#select-scope').click();
    cy.get('#all_seed_peers').click();

    cy.get('#url').type('https://example.com/path/to/file');

    cy.get('#save').click();

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'candidate schedulers not found');

    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiAlert-message').should('not.exist');
  });

  it('cannot create preheat task without required attributes', () => {
    cy.get('#save').click();

    cy.get('#cluster-helper-text').should('be.visible').and('have.text', 'Select at least one option.');
    cy.get('#url-helper-text').should('be.visible').and('have.text', 'Fill in the characters, the length is 1-1000.');
  });

  it('try to create preheat with guest user', () => {
    cy.guestSignin();
    cy.visit('/jobs/preheats/new');

    // Check if the guest user is signin in.
    cy.get('[href="/users"]').should('not.exist');

    // Select a cluster.
    cy.get('#cluster').click();
    cy.contains('li', 'cluster-1').click();
    cy.get('body').click('topLeft');

    // Select a scope.
    cy.get('#select-scope').click();
    cy.get('#single_seed_peer').click();

    // Add ure.
    cy.get('#url').type('https://example.com/path/to/file');

    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/jobs',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: createPreheat,
        });
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs/12',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: createPreheat,
        });
      },
    );

    cy.get('#save').click();

    // Then I see that the current page is the preheats page!
    cy.url().should('include', '/jobs/preheats/12');

    // Displays successfully added preheat task.
    cy.get('#description').should('have.text', 'create preheat');
    cy.get('#status').should('have.text', 'PENDING');
    cy.get('#id').should('have.text', 12);
    cy.get('#piece-length').should('have.text', '4 MiB');
  });

  it('should handle API error response', () => {
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/jobs',
      },
      (req) => {
        req.reply({
          forceNetworkError: true,
        });
      },
    );

    cy.get('#cluster').click();
    cy.contains('li', 'cluster-2').click();
    cy.get('body').click('topLeft');

    // Select a scope.
    cy.get('#select-scope').click();
    cy.get('#all_peers').click();

    cy.get('#url').type('https://example.com/path/to/file');

    cy.get('#save').click();

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
  });

  describe('cannot create preheat with invalid attributes', () => {
    it('try to verify information', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const description = _.times(1001, () => _.sample(characters)).join('');

      cy.get('#cluster').type('cluster-99{enter}');
      cy.get('#cluster-helper-text').should('have.text', 'cluster not found');

      cy.get('#cluster').type('cluster-9{enter}');

      // Select a cluster.
      cy.get('#cluster').click();
      cy.contains('li', 'cluster-1').click();
      cy.get('body').click('topLeft');

      // Add ure.
      cy.get('#url').type('https://example.com/path/to/file');

      // Should display message describing the validation error.
      cy.get('#description').type(description);

      // Show verification error message.
      cy.get('#description-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 0-1000.');

      cy.get('#save').click();
    });

    it('try to verify args', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const url = _.times(1001, () => _.sample(characters)).join('');
      const filter = _.times(101, () => _.sample(characters)).join('');

      // Select a cluster.
      cy.get('#cluster').click();
      cy.contains('li', 'cluster-1').click();
      cy.get('body').click('topLeft');

      // Should display message url the validation error.
      cy.get('#url').type(`https://docs${url}`);

      cy.get('#url-helper-text').should('be.visible').and('have.text', 'Fill in the characters, the length is 1-1000.');

      cy.get('#save').click();
      cy.get('#url').clear();
      cy.get('#url').type('https://docs');

      // Should display message Piece Length the validation error.
      cy.get('#pieceLength').type('0');

      // Show verification error message.
      cy.get('#pieceLength-helper-text').should('have.text', 'Please enter a value between 4 and 1024 MiB.');

      cy.get('#pieceLength').clear();
      cy.get('#pieceLength-helper-text').should('not.eq');
      cy.get('#pieceLength').type('1025');
      cy.get('#save').click();

      // Preheat creation failed, the page is still in preheat/new!
      cy.url().should('include', '/jobs/preheats/new');

      cy.get('#pieceLength-helper-text').should('exist');

      // Should display message tag the validation error.
      cy.get('#tag').type(url);

      cy.get('#tag-helper-text').should('be.visible').and('have.text', 'Fill in the characters, the length is 0-1000.');

      cy.get('#tag').clear();

      // Should display message filter the validation error.
      cy.get('#filteredQueryParams').type('filter');

      cy.get('#save').click();

      // Show verification error message.
      cy.get('#filteredQueryParams-helper-text')
        .should('be.visible')
        .and('have.text', 'Please press ENTER to end the filter creation');

      cy.get('#filteredQueryParams').clear();
      cy.get('#filteredQueryParams').type('filter{enter}');

      cy.get('#filteredQueryParams').type(filter);

      // Show verification error message.
      cy.get('#filteredQueryParams-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 0-100.');

      cy.get('#save').click();

      // Preheat creation failed, the page is still in preheat/new!
      cy.url().should('include', '/jobs/preheats/new');
    });

    it('try to verify header', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const key = _.times(101, () => _.sample(characters)).join('');

      // Select a cluster.
      cy.get('#cluster').click();
      cy.contains('li', 'cluster-1').click();
      cy.get('body').click('topLeft');

      // Add ure.
      cy.get('#url').type('https://example.com/path/to/file');

      // Click add header button.
      cy.get('#add-headers').click();

      cy.get('#header').children().should('have.length', 3);

      // Show header key verification error message.
      cy.get('.new_headersKeyInput__aZcds > .MuiFormHelperText-root')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 1-100.');

      // Show  header value verification error message.
      cy.get('.new_headersValueInput__zn-9E > .MuiFormHelperText-root')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 1-10000.');

      // Verification passed.
      cy.get('.new_headersKeyInput__aZcds > .MuiInputBase-root > .MuiInputBase-input').type('key');
      cy.get('.new_headersKeyInput__aZcds > .MuiFormHelperText-root').should('not.exist');

      // Incorrect header key entered.
      cy.get('.new_headersKeyInput__aZcds > .MuiInputBase-root > .MuiInputBase-input').clear();
      cy.get('.new_headersKeyInput__aZcds > .MuiInputBase-root > .MuiInputBase-input').type(key);

      // Show header key verification error message.
      cy.get('.new_headersKeyInput__aZcds > .MuiFormHelperText-root')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 1-100.');

      cy.get('#save').click();

      // Preheat creation failed, the page is still in preheat/new!
      cy.url().should('include', '/jobs/preheats/new');

      // Verification passed.
      cy.get('.new_headersKeyInput__aZcds > .MuiInputBase-root > .MuiInputBase-input').clear();
      cy.get('.new_headersKeyInput__aZcds > .MuiInputBase-root > .MuiInputBase-input').type('key');
      cy.get('.new_headersKeyInput__aZcds > .MuiFormHelperText-root').should('not.exist');

      cy.get('#save').click();

      // Preheat creation failed, the page is still in preheat/new!
      cy.url().should('include', '/jobs/preheats/new');

      // Add haeder.
      cy.get('#header > .MuiButton-root').click();

      // Check the number of headers.
      cy.get('#header').children().should('have.length', 4);

      // Delete header.
      cy.get('#header > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('#header').children().should('have.length', 3);
    });
  });
});
