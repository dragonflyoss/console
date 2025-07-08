import clusters from '../../../fixtures/clusters/clusters.json';
import preheats from '../../../fixtures/job/preheats/preheats.json';
import createPreheatFile from '../../../fixtures/job/preheats/create-preheat-file.json';
import createPreheatImage from '../../../fixtures/job/preheats/create-preheat-image.json';
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

  it('can create an All Peers task with a preheat scope of 30%', () => {
    // By default, there is no percentage and count.
    cy.get('#count-or-percentage').should('not.exist');

    // Scope select all peers.
    cy.get('#select-scope').click();
    cy.get('#all_peers').click();

    cy.get('#all').should('have.text', `Preheat to each peer in the P2P cluster.`);

    cy.get('#count-or-percentage').should('exist');

    cy.get('#radio-percentage').click();

    cy.get('#percentage').click(100, 10);

    // Select count.
    cy.get('#radio-count').click();

    cy.get('#count').click();

    cy.get('#count').type('50');

    // Scope select all seed peers.
    cy.get('#select-scope').click();
    cy.get('#all_seed_peers').click();

    cy.get('#all').should('have.text', `Preheat to each seed peer in the P2P cluster.`);
  });

  it('click the `CANCEL button', () => {
    cy.get('#cancel').click();

    // Then I see that the current page is the preheats page!
    cy.url().should('include', '/jobs/preheats');
  });

  it('can create preheat file', () => {
    cy.visit('/jobs/preheats');
    cy.get('#new-preheat').click();

    cy.url().should('include', '/jobs/preheats/new');

    cy.get('.MuiTypography-h5').should('have.text', 'Create Preheat');

    cy.get('#description').type('create preheat');

    // Select a cluster.
    cy.get('#cluster').type('cluster-1{enter}');

    cy.get('body').click('topLeft');

    cy.get('#pieceLength').type('5');

    // Select a scope.
    cy.get('#select-scope').click();

    cy.get('#all_seed_peers').click();

    // Add url.
    cy.get('#url').type('https://example.com/path/to/file');

    cy.get('#add-url').click();
    cy.get('#url-0').type('https://example.com/path/to/file/url-1');

    // Add tag.
    cy.get('#tag').type('tag-1');

    // Add application.
    cy.get('#application').type('application-1');

    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/jobs',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: createPreheatFile,
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
          body: createPreheatFile,
        });
      },
    );

    cy.get('#save').click();

    // Then I see that the current page is the preheats page!
    cy.url().should('include', '/jobs/preheats/12');

    // Displays successfully added preheat task.
    cy.get('#description').should('have.text', 'create preheat');
    cy.get('#status').should('have.text', 'PENDING');
    cy.get('#url-0').should('have.text', 'https://example.com/path/to/file/url-1');
    cy.get('#url-1').should('have.text', 'https://example.com/path/to/file');
    cy.get('#id').should('have.text', 12);
    cy.get('#piece-length').should('have.text', '5 MiB');
    cy.get('#scope').should('have.text', 'All Seed Peers');
    cy.get('#tag').should('have.text', 'tag-1');
    cy.get('#application').should('have.text', 'application-1');
  });

  it('can create preheat image', () => {
    cy.get('#preheat-image').click();

    cy.get('#description').type('create preheat');

    // Select a cluster.
    cy.get('#cluster').type('cluster-1{enter}');

    cy.get('body').click('topLeft');

    cy.get('#pieceLength').type('5');

    // Select a scope.
    cy.get('#select-scope').click();

    cy.get('#all_seed_peers').click();

    // Add url.
    cy.get('#url').type('https://example.com/path/to/file');

    cy.get('#name').type('root');
    cy.get('#password').type('password');

    // Add tag.
    cy.get('#tag').type('tag-1');

    // Add application.
    cy.get('#application').type('application-1');

    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/jobs',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: createPreheatImage,
        });
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs/13',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: createPreheatImage,
        });
      },
    );

    cy.get('#save').click();

    // Should show preheat details.
    cy.get('#description').should('have.text', 'create preheat');
    cy.get('#status').should('have.text', 'PENDING');
    cy.get('#type').should('have.text', 'Image');
    cy.get('#url').should('have.text', 'https://ghcr.io/v2/dragonflyoss/scheduler/manifests/v2.1.0');
    cy.get('#id').should('have.text', 13);
    cy.get('#platform').should('have.text', 'Linux AMD64');
    cy.get('#piece-length').should('have.text', '-');
    cy.get('#scope').should('have.text', 'Single Seed Peer');
    cy.get('#tag').should('have.text', 'tag-1');
    cy.get('#application').should('have.text', 'application-1');
    cy.get('#ips-0').should('have.text', '10.244.4.5');
    cy.get('#ips-1').should('have.text', '10.244.4.6');
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
          body: createPreheatFile,
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
          body: createPreheatFile,
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
    cy.get('#piece-length').should('have.text', '5 MiB');
  });

  describe('should handle API error response', () => {
    it('creating a preheat file API error response', () => {
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

    it('creating a preheat image API error response', () => {
      cy.get('#preheat-image');

      cy.intercept(
        {
          method: 'POST',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.reply({
            statusCode: 500,
            body: {
              message:
                'Get "https://index.docker.io/v2/": context deadline exceeded (Client.Timeout exceeded while awaiting headers)',
            },
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
      cy.get('.MuiAlert-message')
        .should('be.visible')
        .and(
          'contain',
          'Get "https://index.docker.io/v2/": context deadline exceeded (Client.Timeout exceeded while awaiting headers)',
        );
    });
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

    it('try to verify URL', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const url = _.times(1001, () => _.sample(characters)).join('');

      // Should display message URL the validation error.
      cy.get('#url').type(`https://docs${url}`);

      cy.get('#url-helper-text').should('be.visible').and('have.text', 'Fill in the characters, the length is 1-1000.');

      // Click add URL button.
      cy.get('#add-url').click();

      // cy.get('#url-0').type('https://example.com/path/to/file/url-1');

      cy.get('#save').click();

      // The added URL validation error prompt should be displayed.
      cy.get('#url-0-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 1-1000.');

      cy.get('#url-0').type('https://example.com/path/to/file');

      // Click add URL button.
      cy.get('#add-url').click();

      // Check whether to add URL input box.
      cy.get('#url-1').should('exist');

      // Click the clear URL button.
      cy.get('#clear-url-1').click();
      cy.get('#url-1').should('not.exist');

      cy.get('#url').clear();
    });

    it('try to verify the preheat image args', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const url = _.times(1001, () => _.sample(characters)).join('');
      const filter = _.times(101, () => _.sample(characters)).join('');

      cy.get('#preheat-image').click();

      // Select a cluster.
      cy.get('#cluster').click();
      cy.contains('li', 'cluster-1').click();
      cy.get('body').click('topLeft');

      cy.get('#url').type('https://docs');

      // Should display message name the validation error.
      cy.get('#name').type(filter);

      // Show verification error message.
      cy.get('#name-helper-text').should('have.text', 'Fill in the characters, the length is 0-100.');

      cy.get('#name').clear();
      cy.get('#name').type('root');

      cy.get('#name-helper-text').should('not.exist');

      // Should display message password the validation error.
      cy.get('#password').type(filter);

      // Show verification error message.
      cy.get('#password-helper-text').should('have.text', 'Fill in the characters, the length is 0-100.');

      cy.get('#password').clear();
      cy.get('#password').type('root');

      cy.get('#password-helper-text').should('not.exist');

      // Should display message Piece Length the validation error.
      cy.get('#select-scope').click();
      cy.get('#all_peers').click();

      cy.get('#radio-count').click();

      cy.get('#count').should('have.value', '1');

      cy.get('#count').clear();

      cy.get('#count').type('0');

      // Show verification error message.
      cy.get('#count-helper-text').should('have.text', 'Fill in the characters, the length is 1-200.');

      cy.get('#count').clear();

      cy.get('#count').type('201');

      cy.get('#count-helper-text').should('have.text', 'Fill in the characters, the length is 1-200.');

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

      // Should display message ips the validation error.
      cy.get('#ips').type('ips');

      cy.get('#save').click();

      // Show verification error message.
      cy.get('#ips-helper-text').should('be.visible').and('have.text', 'Please press ENTER to end the ips creation');

      cy.get('#ips').clear();
      cy.get('#ips').type('ips{enter}');

      cy.get('#ips').type(filter);

      // Show verification error message.
      cy.get('#ips-helper-text').should('be.visible').and('have.text', 'Fill in the characters, the length is 0-100.');

      cy.get('#save').click();

      // Preheat creation failed, the page is still in preheat/new!
      cy.url().should('include', '/jobs/preheats/new');
    });

    it('try to verify the preheat image header', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const key = _.times(101, () => _.sample(characters)).join('');

      cy.get('#preheat-image').click();
      // Select a cluster.
      cy.get('#cluster').click();
      cy.contains('li', 'cluster-1').click();
      cy.get('body').click('topLeft');

      // Add ure.
      cy.get('#url').type('https://example.com/path/to/file');

      // Click add header button.
      cy.get('#add-headers').click();

      cy.get('#header').children().should('have.length', 3);

      // Verification passed.
      cy.get('#key-0').type('key');
      cy.get('#key-0-helper-text').should('not.exist');

      // Incorrect header key entered.
      cy.get('#key-0').clear();
      cy.get('#key-0').type(key);

      // Show header key verification error message.
      cy.get('#key-0-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 1-100.');

      cy.get('#save').click();

      // Preheat creation failed, the page is still in preheat/new!
      cy.url().should('include', '/jobs/preheats/new');

      cy.get('#save').click();

      cy.get('#value-0-helper-text').should('have.text', 'Fill in the characters, the length is 1-10000.');

      cy.get('#value-0').type('key');

      cy.get('#value-0-helper-text').should('not.exist');

      // Preheat creation failed, the page is still in preheat/new!
      cy.url().should('include', '/jobs/preheats/new');

      // Add haeder.
      cy.get('#header > .MuiButton-root').click();

      // Check the number of headers.
      cy.get('#header').children().should('have.length', 4);

      // Delete header input box.
      cy.get('#clear-header-1').click();

      cy.get('#header').children().should('have.length', 3);
    });

    it('try to verify the preheat file args', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const url = _.times(1001, () => _.sample(characters)).join('');
      const filter = _.times(101, () => _.sample(characters)).join('');

      // Select a cluster.
      cy.get('#cluster').click();
      cy.contains('li', 'cluster-1').click();
      cy.get('body').click('topLeft');

      cy.get('#url').type('https://docs');

      // Should display message Piece Length the validation error.
      cy.get('#select-scope').click();
      cy.get('#all_peers').click();

      cy.get('#radio-count').click();

      cy.get('#count').should('have.value', '1');

      cy.get('#count').clear();

      cy.get('#count').type('0');

      // Show verification error message.
      cy.get('#count-helper-text').should('have.text', 'Fill in the characters, the length is 1-200.');

      cy.get('#count').clear();

      cy.get('#count').type('201');

      cy.get('#count-helper-text').should('have.text', 'Fill in the characters, the length is 1-200.');

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

      // Should display message ips the validation error.
      cy.get('#ips').type('ips');

      cy.get('#save').click();

      // Show verification error message.
      cy.get('#ips-helper-text').should('be.visible').and('have.text', 'Please press ENTER to end the ips creation');

      cy.get('#ips').clear();
      cy.get('#ips').type('ips{enter}');

      cy.get('#ips').type(filter);

      // Show verification error message.
      cy.get('#ips-helper-text').should('be.visible').and('have.text', 'Fill in the characters, the length is 0-100.');

      cy.get('#save').click();

      // Preheat creation failed, the page is still in preheat/new!
      cy.url().should('include', '/jobs/preheats/new');
    });

    it('try to verify the preheat file header', () => {
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

      // Verification passed.
      cy.get('#key-0').type('key');
      cy.get('#key-0-helper-text').should('not.exist');

      // Incorrect header key entered.
      cy.get('#key-0').clear();
      cy.get('#key-0').type(key);

      // Show header key verification error message.
      cy.get('#key-0-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 1-100.');

      cy.get('#save').click();

      // Preheat creation failed, the page is still in preheat/new!
      cy.url().should('include', '/jobs/preheats/new');

      cy.get('#save').click();

      cy.get('#value-0-helper-text').should('have.text', 'Fill in the characters, the length is 1-10000.');

      cy.get('#value-0').type('key');

      cy.get('#value-0-helper-text').should('not.exist');

      // Preheat creation failed, the page is still in preheat/new!
      cy.url().should('include', '/jobs/preheats/new');

      // Add haeder.
      cy.get('#header > .MuiButton-root').click();

      // Check the number of headers.
      cy.get('#header').children().should('have.length', 4);

      // Delete header input box.
      cy.get('#clear-header-1').click();

      cy.get('#header').children().should('have.length', 3);
    });
  });
});
