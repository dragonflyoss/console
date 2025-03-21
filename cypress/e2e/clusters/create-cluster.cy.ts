import clusters from '../../fixtures/clusters/clusters.json';
import seedPeers from '../../fixtures/seed-peers/seed-peers.json';
import schedulers from '../../fixtures/schedulers/schedulers.json';
import createClusters from '../../fixtures/clusters/create-clusters.json';
import createCluster from '../../fixtures/clusters/create-cluster.json';
import _ from 'lodash';

describe('Create cluster', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/schedulers?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: schedulers,
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
          body: clusters,
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
          body: seedPeers,
        });
      },
    );

    cy.signin();
    cy.visit('/clusters/new');
    cy.viewport(1440, 1080);
  });

  it('can create cluster', () => {
    cy.visit('/clusters');

    // Show number of cluster.
    cy.get('#total-clusters').should('be.visible').and('contain', '37');

    // Show number of cluster default.
    cy.get('#default-clusters').should('be.visible').and('contain', '13');

    // Click the `ADD CLUSTER` button.
    cy.get('.clusters_clusterTitle__5Lhnw > .MuiButtonBase-root').click();

    cy.url().should('include', '/clusters/new');

    // Add Information.
    cy.get('.PrivateSwitchBase-input').click();
    cy.get('#name').type('cluster-17');
    cy.get('#description').type('Add new cluster case');
    cy.get('#location').type('China|Hang|Zhou');

    // Add idc.
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('hz{enter}');
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('sh{enter}');
    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').click();

    // Add cidrs.
    cy.contains('li', '10.0.0.0/8').click();
    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').click();
    cy.contains('li', '172.16.0.0/12').click();
    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').click();
    cy.contains('li', '192.168.0.0/16').click();

    // Add config.
    cy.get(':nth-child(3) > .MuiInputBase-root').clear();
    cy.get(':nth-child(3) > .MuiInputBase-root').type('10');

    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/clusters',
      },
      (req) => {
        req.body = '';
        req.reply({
          statusCode: 200,
          body: createCluster,
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
          body: createClusters,
        });
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/38',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: createCluster,
        });
      },
    );

    // Click the `save` button.
    cy.get('#save').click();

    // Then I see that the current page is the clusters.
    cy.url().should('include', '/clusters/38');

    cy.get('.information_classNameWrapper__Ey-oo > div.MuiBox-root > #name').should('have.text', 'cluster-38');

    cy.get('#description').should('have.text', 'Add new cluster case');

    // Show Scopes.
    cy.get('#location').should('have.text', 'China|Hang|Zhou');

    cy.get('#idc-1').should('have.text', 'hz');
    cy.get('#idc-2').should('have.text', 'sh');

    cy.get('#cidrs-1').should('have.text', '10.0.0.0/8');
    cy.get('#cidrs-2').should('have.text', '172.16.0.0/12');
    cy.get('#cidrs-3').should('have.text', '192.168.0.0/16');

    cy.get('.MuiBreadcrumbs-ol > :nth-child(1) > .MuiTypography-root').click();

    // The number of clusters has been increased.
    cy.get('#total-clusters').should('be.visible').and('contain', '38');

    // The default number of clusters has been increased.
    cy.get('#default-clusters').should('be.visible').and('contain', '14');
  });

  it('cannot create cluster with existing cluster', () => {
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/clusters',
      },
      (req) => {
        req.body = {
          name: 'cluster-1',
          bio: '',
          scopes: {
            idc: '',
            location: '',
            cidrs: [],
          },
          scheduler_cluster_config: {
            filter_parent_limit: 4,
            filter_parent_range_limit: 40,
          },
          seed_peer_cluster_config: {
            load_limit: 300,
          },
          peer_cluster_config: {
            load_limit: 50,
          },
          is_default: true,
        };
        req.reply({
          statusCode: 409,
          body: { message: 'Conflict' },
        });
      },
    );

    cy.get('#name').type('cluster-1{enter}');

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Conflict');
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiPaper-message').should('not.exist');
  });

  it('click the `CANCEL button', () => {
    cy.get('#cancel').click();

    // Then I see that the current page is the clusters.
    cy.url().should('include', '/clusters');
  });

  it('cannot create cluster without required attributes', () => {
    cy.get('#save').click();

    cy.get('#name-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 1-40.');
  });

  it('try to create cluster with guest user', () => {
    cy.guestSignin();

    cy.intercept({ method: 'POST', url: '/api/v1/clusters' }, (req) => {
      (req.body = ''),
        req.reply({
          statusCode: 401,
          body: { message: 'permission deny' },
        });
    });

    cy.get('#name').type('cluster-17{enter}');

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'permission deny');

    cy.get('#cancel').click();

    cy.wait(1000);

    // Then I see that the current page is the clusters!
    cy.url().should('include', '/clusters');
  });

  it('should handle API error response', () => {
    cy.intercept({ method: 'POST', url: '/api/v1/clusters' }, (req) => {
      (req.body = ''),
        req.reply({
          forceNetworkError: true,
        });
    });

    cy.get('#name').type('cluster-17');
    cy.get('#save').click();
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
  });

  describe('cannot create cluster with invalid attributes', () => {
    it('try to verify information', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const name = _.times(41, () => _.sample(characters)).join('');
      const description = _.times(1001, () => _.sample(characters)).join('');

      // Should display message name the validation error.
      cy.get('#save').click();

      // Name is a required attribute.
      cy.get('#name-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 1-40.');
      cy.get('#name').type(name);

      // Show verification error message.
      cy.get('#name-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 1-40.');

      // Submit form when validation fails.
      cy.get('#save').click();

      // Cluster creation failed, the page is still in cluster/new.
      cy.url().should('include', '/clusters/new');
      cy.get('#name').clear();

      // Enter the correct name.
      cy.get('#name').type('cluster-12');
      cy.get('#name-helper-text').should('not.exist');

      // Should display message describing the validation error.
      cy.get('#description').type(description);

      // Show verification error message.
      cy.get('#description-helper-text')
        .should('be.visible')
        .and('contain', 'Fill in the characters, the length is 0-1000.');
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#description').clear();
      cy.get('#description').type('cluster description');
      cy.get('#name-helper-text').should('not.exist');
    });

    it('try to verify scopes', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const location = _.times(101, () => _.sample(characters)).join('');
      const hostnames = _.times(31, () => _.sample(characters)).join('');

      // Name is a required attribute.
      cy.get('#name').type('cluster-12');

      // Should display location the validation error message.
      cy.get('#location').type(location);

      // Show verification error message.
      cy.get('#location-helper-text')
        .should('be.visible')
        .and('contain', 'Fill in the characters, the length is 0-100.');
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#location').clear();

      // Verification passed.
      cy.get('#location').type('Beijing');
      cy.get('#location-helper-text').should('not.exist');

      // Should display idc the validation error message.
      cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('hz');
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#idc-helper-text').should('be.visible').and('contain', `Please press ENTER to end the IDC creation.`);
      cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('hz{enter}');

      // Verification passed.
      cy.get('#idc-helper-text').should('not.exist');

      // Should display cidrs the validation error message.
      cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(
        '192.168.40.0/24',
      );
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#cidrs-helper-text').should('be.visible').and('contain', `Please press ENTER to end the CIDRs creation.`);

      cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(
        '192.168.40.0/24{enter}',
      );

      // Verification passed.
      cy.get('#cidrs-helper-text').should('not.exist');

      // Should display cidrs the validation error message.
      cy.get(':nth-child(4) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('sigma');
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#hostnames-helper-text')
        .should('be.visible')
        .and('contain', `Please press ENTER to end the Hostnames creation.`);
      cy.get(':nth-child(4) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(
        'hostname{enter}',
      );
      cy.get(':nth-child(4) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(hostnames);

      cy.get('#hostnames-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the characters, the length is 1-30.`);
    });

    it('try to verify config', () => {
      // Name is a required attribute.
      cy.get('#name').type('cluster-12');

      // Should display seed peer load limit the validation error message.
      cy.get('#seedPeerLoadLimit').invoke('val').should('eq', '2000');
      cy.get('#seedPeerLoadLimit').clear();
      cy.get('#seedPeerLoadLimit').type('50001');
      cy.get('#seedPeerLoadLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 0-50000.`);
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#seedPeerLoadLimit').clear();
      cy.get('#seedPeerLoadLimit').type('400');

      // Verification passed.
      cy.get('#seedPeerLoadLimit-helper-text').should('not.exist');

      // Should display peer load limit the validation error message.
      cy.get('#peerLoadLimit').invoke('val').should('eq', '200');
      cy.get('#peerLoadLimit').clear();
      cy.get('#peerLoadLimit').type('2001');
      cy.get('#peerLoadLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 0-2000.`);
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#peerLoadLimit').clear();
      cy.get('#peerLoadLimit').type('50');

      // Verification passed.
      cy.get('#peerLoadLimit-helper-text').should('not.exist');

      // Should display candidate parent limit the validation error message.
      cy.get('#candidateParentLimit').invoke('val').should('eq', '4');
      cy.get('#candidateParentLimit').clear();
      cy.get('#candidateParentLimit').type('21');
      cy.get('#candidateParentLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 1-20.`);
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#candidateParentLimit').clear();
      cy.get('#candidateParentLimit').type('5');
      cy.get('#candidateParentLimit-helper-text').should('not.exist');

      // Should display filter parent limit the validation error message.
      cy.get('#filterParentLimit').invoke('val').should('eq', '40');
      cy.get('#filterParentLimit').clear();

      // Minimum validation range not reached.
      cy.get('#filterParentLimit').type('9');
      cy.get('#filterParentLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 10-1000.`);
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#filterParentLimit').clear();

      // Maximum verification range exceeded.
      cy.get('#filterParentLimit').type('1001');
      cy.get('#filterParentLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 10-1000.`);
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#filterParentLimit').clear();
      cy.get('#filterParentLimit').type('100');

      // Verification passed.
      cy.get('#filterParentLimit-helper-text').should('not.exist');

      // Should display filter parent limit the validation error message.
      cy.get('#jobRateLimit').invoke('val').should('eq', '10');
      cy.get('#jobRateLimit').clear();

      // Minimum validation range not reached.
      cy.get('#jobRateLimit').type('0');
      cy.get('#jobRateLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 1-1000000.`);
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#jobRateLimit').clear();

      // Maximum verification range exceeded.
      cy.get('#jobRateLimit').type('1000001');
      cy.get('#jobRateLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 1-1000000.`);
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#jobRateLimit').clear();
      cy.get('#jobRateLimit').type('100');

      // Verification passed.
      cy.get('#jobRateLimit-helper-text').should('not.exist');
    });
  });
});
