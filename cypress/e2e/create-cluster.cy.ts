import clusters from '../fixtures/api/clusters/clusters.json';
import root from '../fixtures/api/role-root.json';
import guest from '../fixtures/api/role-guest.json';
import user from '../fixtures/api/user.json';
import guestUser from '../fixtures/api/guest-user.json';
import seedPeers from '../fixtures/api/clusters/seed-peers.json';
import schedulers from '../fixtures/api/clusters/schedulers.json';
import createClustes from '../fixtures/api/clusters/create-cluster.json';
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

    cy.signin();
    cy.visit('/clusters/new');
    cy.viewport(1440, 1080);
  });

  it('can create cluster', () => {
    cy.visit('/clusters');

    // Number of cluster.
    cy.get(
      ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '11');

    // Number of cluster default.
    cy.get(
      ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
    )
      .should('be.visible')
      .and('contain', '7');

    // Click the `ADD CLUSTER` button.
    cy.get('.clusters_clusterTitle__5Lhnw > .MuiButtonBase-root').click();

    cy.url().should('include', '/clusters/new');

    // Add Information.
    cy.get('.PrivateSwitchBase-input').click();
    cy.get('#name').type('cluster-12');
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
          body: createClustes,
        });
      },
    );

    // Click the `save` button.
    cy.get('#save').click();

    // Then I see that the current page is the clusters.
    cy.url().should('include', '/clusters');

    // Cluster added successfully.
    cy.get(':nth-child(8) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-12');

    // The number of clusters has been increased.
    cy.get(
      ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '12');

    // The default number of clusters has been increased.
    cy.get(
      ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
    )
      .should('be.visible')
      .and('contain', '8');
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
            concurrent_piece_count: 4,
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

    cy.get('.MuiPaper-root').should('not.exist');
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

    cy.guestSignin();

    cy.intercept({ method: 'POST', url: '/api/v1/clusters' }, (req) => {
      (req.body = ''),
        req.reply({
          statusCode: 401,
          body: { message: 'permission deny' },
        });
    });

    cy.get('#name').type('cluster-12{enter}');

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

    cy.get('#name').type('cluster-12');
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

      // Show verification error.
      cy.get('#name-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 1-40.');
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#name').clear();
      cy.get('#name').type('cluster-12');
      cy.get('#name-helper-text').should('not.exist');

      // Should display message describing the validation error.
      cy.get('#description').type(description);

      // Show verification error.
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

      // Name is a required attribute.
      cy.get('#name').type('cluster-12');

      // Should display message location the validation error.
      cy.get('#location').type(location);

      // Show verification error.
      cy.get('#location-helper-text')
        .should('be.visible')
        .and('contain', 'Fill in the characters, the length is 0-100.');
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#location').clear();
      cy.get('#location').type('Beijing');
      cy.get('#location-helper-text').should('not.exist');

      // Should display message idc the validation error.
      cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('hz');
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#idc-helper-text').should('be.visible').and('contain', `Please press ENTER to end the IDC creation.`);

      // Show verification passed.
      cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('hz{enter}');
      cy.get('#idc-helper-text').should('not.exist');

      // Should display message cidrs the validation error.
      cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(
        '192.168.40.0/24',
      );
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');

      // Show verification passed.
      cy.get('#cidrs-helper-text').should('be.visible').and('contain', `Please press ENTER to end the CIDRs creation.`);
      cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(
        '192.168.40.0/24{enter}',
      );
      cy.get('#cidrs-helper-text').should('not.exist');
    });

    it('try to verify config', () => {
      // Name is a required attribute.
      cy.get('#name').type('cluster-12');

      // Should display message seed peer load limit the validation error.
      cy.get('#seedPeerLoadLimit').type('5000');
      cy.get('#seedPeerLoadLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 0-5000.`);
      cy.get('#save').click();

      // Cluster creation failed, the page is still in cluster/new.
      cy.url().should('include', '/clusters/new');
      cy.get('#seedPeerLoadLimit').clear();
      cy.get('#seedPeerLoadLimit').type('400');

      // Verification passed.
      cy.get('#seedPeerLoadLimit-helper-text').should('not.exist');

      // Should display message peer load limit the validation error.
      cy.get('#peerLoadLimit').clear();
      cy.get('#peerLoadLimit').type('2001');
      cy.get('#peerLoadLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 0-2000.`);
      cy.get('#save').click();

      // Cluster creation failed, the page is still in cluster/new.
      cy.url().should('include', '/clusters/new');
      cy.get('#peerLoadLimit').clear();
      cy.get('#peerLoadLimit').type('50');

      // Verification passed.
      cy.get('#peerLoadLimit-helper-text').should('not.exist');

      // Should display message number of concurrent download pieces the validation error.
      cy.get('#numberOfConcurrentDownloadPieces').clear();
      cy.get('#numberOfConcurrentDownloadPieces').type('51');
      cy.get('#numberOfConcurrentDownloadPieces-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 0-50.`);
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#numberOfConcurrentDownloadPieces').clear();
      cy.get('#numberOfConcurrentDownloadPieces').type('10');

      // Verification passed.
      cy.get('#numberOfConcurrentDownloadPieces-helper-text').should('not.exist');

      // Should display message candidate parent limit the validation error.
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

      // Should display message filter parent limit the validation error.
      cy.get('#filterParentLimit').clear();

      // Validation minimum range.
      cy.get('#filterParentLimit').type('9');
      cy.get('#filterParentLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 10-1000.`);
      cy.get('#save').click();
      cy.url().should('include', '/clusters/new');
      cy.get('#filterParentLimit').clear();

      // Verify maximum range.
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
    });
  });
});
