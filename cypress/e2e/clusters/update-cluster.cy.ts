import cluster from '../../fixtures/clusters/cluster/cluster.json';
import updateCluster from '../../fixtures/clusters/cluster/update-cluster.json';
import _ from 'lodash';

describe('Update cluster', () => {
  beforeEach(() => {
    cy.signin();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: cluster,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );

    cy.visit('/clusters/1/edit');
    cy.viewport(1440, 1080);
  });

  it('when data is loaded', () => {
    // Show cluster information.
    cy.get('.MuiPaper-root > .css-0 > :nth-child(2)').should('contain', 'cluster-1');

    cy.get('.PrivateSwitchBase-input').should('be.checked').check({ force: true });

    // Show scopes.
    cy.get('#location').should('have.value', 'China|Hang|Zhou');

    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root')
      .should('contain', 'Hangzhou')
      .and('contain', 'Shanghai');

    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root')
      .should('contain', '10.0.0.0/8')
      .and('contain', '192.168.0.0/16')
      .and('contain', '172.16.0.0/12');

    cy.get(':nth-child(4) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root')
      .should('contain', 'cluster-1')
      .and('contain', 'cluster-2')
      .and('contain', 'cluster-3');

    // Show config.
    cy.get('#seedPeerLoadLimit').should('have.value', 300);
    cy.get('#peerLoadLimit').should('have.value', 51);
    cy.get('#candidateParentLimit').should('have.value', 4);
    cy.get('#filterParentLimit').should('have.value', 40);
  });

  it('when no data is loaded', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/2',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: {
            id: 0,
            name: '',
            bio: '',
            scopes: {
              idc: '',
              location: '',
              cidrs: null,
              hostnames: null,
            },
            scheduler_cluster_id: 1,
            seed_peer_cluster_id: 1,
            scheduler_cluster_config: {
              candidate_parent_limit: 0,
              filter_parent_limit: 0,
            },
            seed_peer_cluster_config: {
              load_limit: 0,
            },
            peer_cluster_config: {
              load_limit: 0,
            },
            created_at: '2023-03-08T02:39:03Z',
            updated_at: '2023-03-08T02:39:03Z',
            is_default: false,
          },
        });
      },
    );

    cy.visit('/clusters/2/edit');

    // Show cluster information.

    cy.get('.MuiPaper-outlined > .css-0 > :nth-child(1)').should('contain', '0');

    cy.get('.MuiPaper-root > .css-0 > :nth-child(2)').should('contain', '');

    cy.get('.PrivateSwitchBase-input').should('not.be.checked').check({ force: false });

    // When location is empty.
    cy.get('#location').should('have.value', '');

    // When idc is empty.
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').should(
      'have.value',
      '',
    );
    // When CIDRs is empty.
    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').should(
      'have.value',
      '',
    );
    // When Hostname is empty.
    cy.get(':nth-child(4) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').should(
      'have.value',
      '',
    );

    // Show config.
    cy.get('#seedPeerLoadLimit').should('have.value', 0);
    cy.get('#peerLoadLimit').should('have.value', 0);
    cy.get('#candidateParentLimit').should('have.value', 0);
    cy.get('#filterParentLimit').should('have.value', 0);
  });

  it('can update cluster', () => {
    cy.intercept({ method: 'PATCH', url: '/api/v1/clusters/1' }, (req) => {
      (req.body = ''),
        req.reply({
          statusCode: 200,
          body: {},
        });
    });
    cy.visit('/clusters/1');

    // Click update cluster button.
    cy.get('.css-bbra84-MuiButtonBase-root-MuiButton-root').click();

    // Show cluster name.
    cy.get('.MuiPaper-root > .css-0 > :nth-child(2)').should('be.visible').and('contain', 'cluster-1');

    cy.get('.PrivateSwitchBase-input').click();

    // Update cluster description.
    cy.get('#description').clear();
    cy.get('#description').type('update cluster-1');

    // Update cluster Scopes.
    cy.get('#location').clear();
    cy.get('#location').type('China|Shang|Hai');

    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root')
      .type('{selectall}')
      .type('{backspace}');

    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(
      '192.168.20.2{enter}',
    );

    // Update cluster Config.
    cy.get('#seedPeerLoadLimit').clear();
    cy.get('#seedPeerLoadLimit').type('400');

    cy.get('#peerLoadLimit').clear();
    cy.get('#peerLoadLimit').type('50');

    cy.get('#candidateParentLimit').clear();
    cy.get('#candidateParentLimit').type('5');

    cy.get('#filterParentLimit').clear();
    cy.get('#filterParentLimit').type('50');

    // Click save button.
    cy.get('#save').click();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: updateCluster,
        });
      },
    );

    // Then I see that the current page is the clusters/1!
    cy.url().should('include', '/clusters/1');

    cy.get('.show_container__osP4U > .MuiTypography-root').scrollIntoView();

    // Check whether the cluster information is updated successfully.
    cy.get('.information_clusterContainer__l8H8p > :nth-child(3) > .MuiTypography-subtitle1')
      .should('be.visible')
      .and('contain', 'update cluster-1');

    cy.get('.information_clusterContainer__l8H8p > :nth-child(5) > .MuiTypography-subtitle1')
      .should('be.visible')
      .and('contain', 'No');

    cy.get('#cidrs').click();

    cy.get('.MuiDialogContent-root > :nth-child(4)').should('be.visible').and('contain', '192.168.20.2');

    cy.get('body').click('topLeft');

    cy.get('.MuiPaper-root > :nth-child(1) > .MuiTypography-body1')
      .scrollIntoView()
      .should('be.visible')
      .and('contain', '400');
  });

  it('click the `CANCEL button', () => {
    cy.get('#cancel').click();

    // Then I see that the current page is the clusters/1!
    cy.url().should('include', '/clusters/1');
  });

  it('try to update cluster with guest user', () => {
    cy.intercept({ method: 'PATCH', url: '/api/v1/clusters/1' }, (req) => {
      (req.body = ''),
        req.reply({
          statusCode: 401,
          body: { message: 'permission deny' },
        });
    });

    cy.guestSignin();

    cy.get('#save').click();

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'permission deny');

    // Close error message.
    cy.get(':nth-child(1) > .MuiSnackbar-root > .MuiPaper-root > .MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiAlert-message').should('not.exist');
  });

  describe('should handle API error response', () => {
    it('get cluster API error response', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
    });

    it('update cluster API error response', () => {
      cy.intercept({ method: 'PATCH', url: '/api/v1/clusters/1' }, (req) => {
        (req.body = ''),
          req.reply({
            forceNetworkError: true,
          });
      });

      cy.get('#description').clear();
      cy.get('#description').type('update cluster-1');

      cy.get('#save').click();
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    });
  });

  describe('cannot update cluster with invalid attributes', () => {
    it('try to verify information', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const description = _.times(1001, () => _.sample(characters)).join('');

      cy.get('#description').clear();
      cy.get('#description').type(description);

      // Show verification error message.
      cy.get('#description-helper-text')
        .should('be.visible')
        .and('contain', 'Fill in the characters, the length is 0-1000.');

      // Submit form when validation fails.
      cy.get('#save').click();
      cy.url().should('include', '/clusters/1/edit');
      cy.get('#description').clear();

      // Verification passed.
      cy.get('#description').type('cluster description');
    });

    it('try to verify scopes', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const location = _.times(101, () => _.sample(characters)).join('');

      // Should display location the validation error message.
      cy.get('#location').type(location);

      // Show verification error message.
      cy.get('#location-helper-text')
        .should('be.visible')
        .and('contain', 'Fill in the characters, the length is 0-100.');

      // Submit form when validation fails.
      cy.get('#save').click();
      cy.url().should('include', '/clusters/1/edit');
      cy.get('#location').clear();

      // Verification passed.
      cy.get('#location').type('Beijing');
      cy.get('#location-helper-text').should('not.exist');

      // Should display idc the validation error message.
      cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('hz');
      cy.get('#save').click();
      cy.url().should('include', '/clusters/1/edit');
      cy.get('#idc-helper-text').should('be.visible').and('contain', `Please press ENTER to end the IDC creation.`);

      // Verification passed.
      cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('hz{enter}');
      cy.get('#idc-helper-text').should('not.exist');

      // Should display cidrs the validation error message.
      cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(
        '192.168.40.0/24',
      );
      cy.get('#save').click();
      cy.url().should('include', '/clusters/1/edit');
      // Show verification error message.
      cy.get('#cidrs-helper-text').should('be.visible').and('contain', `Please press ENTER to end the CIDRs creation.`);

      cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(
        '192.168.40.0/24{enter}',
      );
      cy.get('#cidrs-helper-text').should('not.exist');

      // Should display hostnames the validation error message.
      cy.get(':nth-child(4) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('cluster-2');

      cy.get('#save').click();
      cy.url().should('include', '/clusters/1/edit');

      // Show verification error message.
      cy.get('#hostnames-helper-text')
        .should('be.visible')
        .and('contain', `Please press ENTER to end the Hostnames creation.`);

      cy.get(':nth-child(4) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(
        'cluster-1{enter}',
      );
      cy.get('#hostnames-helper-text').should('not.exist');
    });

    it('try to verify config', () => {
      // Should display seed peer load limit the validation error message.
      cy.get('#seedPeerLoadLimit').type('5000');

      // Show verification error message.
      cy.get('#seedPeerLoadLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 0-5000.`);

      // Submit form when validation fails.
      cy.get('#save').click();

      // cluster creation failed, the page is still in cluster/new!
      cy.url().should('include', '/clusters/1/edit');
      cy.get('#seedPeerLoadLimit').clear();
      cy.get('#seedPeerLoadLimit').type('400');

      // Verification passed.
      cy.get('#seedPeerLoadLimit-helper-text').should('not.exist');

      // Should display peer load limit the validation error message.
      cy.get('#peerLoadLimit').clear();
      cy.get('#peerLoadLimit').type('2001');

      // Show verification error message.
      cy.get('#peerLoadLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 0-2000.`);
      cy.get('#save').click();
      cy.url().should('include', '/clusters/1/edit');
      cy.get('#peerLoadLimit').clear();
      cy.get('#peerLoadLimit').type('50');

      // Verification passed.
      cy.get('#peerLoadLimit-helper-text').should('not.exist');

      // Should display candidate parent limit the validation error message.
      cy.get('#candidateParentLimit').clear();
      cy.get('#candidateParentLimit').type('21');

      // Show verification error message.
      cy.get('#candidateParentLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 1-20.`);
      cy.get('#save').click();
      cy.url().should('include', '/clusters/1/edit');
      cy.get('#candidateParentLimit').clear();
      cy.get('#candidateParentLimit').type('5');
      cy.get('#candidateParentLimit-helper-text').should('not.exist');

      // Should display filter parent limit the validation error message.
      cy.get('#filterParentLimit').clear();

      // Minimum validation range not reached.
      cy.get('#filterParentLimit').type('9');

      // Show verification error message.
      cy.get('#filterParentLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 10-1000.`);
      cy.get('#save').click();
      cy.url().should('include', '/clusters/1/edit');
      cy.get('#filterParentLimit').clear();

      // Maximum verification range exceeded.
      cy.get('#filterParentLimit').type('1001');

      // Show verification error message.
      cy.get('#filterParentLimit-helper-text')
        .should('be.visible')
        .and('contain', `Fill in the number, the length is 10-1000.`);
      cy.get('#save').click();

      cy.url().should('include', '/clusters/1/edit');
      cy.get('#filterParentLimit').clear();
      cy.get('#filterParentLimit').type('100');

      // Verification passed.
      cy.get('#filterParentLimit-helper-text').should('not.exist');
    });
  });
});
