import clusters from '../fixtures/api/clusters/clusters.json';
import root from '../fixtures/api/role-root.json';
import guest from '../fixtures/api/role-guest.json';
import user from '../fixtures/api/user.json';
import guestUser from '../fixtures/api/guest-user.json';
import seedPeers from '../fixtures/api/clusters/seed-peers.json';
import schedulers from '../fixtures/api/clusters/schedulers.json';
import newClusterBody from '../fixtures/api/clusters/new-cluster-body.json';
import newClustes from '../fixtures/api/clusters/new-cluster.json';
import _ from 'lodash';

describe('New cluster', () => {
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
    cy.visit('/clusters');
    cy.viewport(1440, 1080);
  });

  it('Add cluster', () => {
    cy.get(
      ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '11');
    cy.get(
      ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
    )
      .should('be.visible')
      .and('contain', '7');
    cy.get('.clusters_clusterTitle__5Lhnw > .MuiButtonBase-root').click();
    cy.get('.PrivateSwitchBase-input').click();
    cy.get('#name').type('cluster-12');
    cy.get('#description').type('Add new cluster case');
    cy.get('#location').type('China|Hang|Zhou');
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('hz{enter}');
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('sh{enter}');
    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').click();
    cy.contains('li', '10.0.0.0/8').click();
    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').click();
    cy.contains('li', '172.16.0.0/12').click();
    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').click();
    cy.contains('li', '192.168.0.0/16').click();
    cy.get(':nth-child(3) > .MuiInputBase-root').clear();
    cy.get(':nth-child(3) > .MuiInputBase-root').type('10');

    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/clusters',
      },
      (req) => {
        req.body = newClusterBody;
        req.reply({
          statusCode: 200,
          body: root,
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
          body: newClustes,
        });
      },
    );
    cy.get('#save').click();
    cy.url().should('include', '/clusters');
    cy.get(':nth-child(8) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-12');
    cy.get(
      ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '12');
    cy.get(
      ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
    )
      .should('be.visible')
      .and('contain', '8');
  });

  it('Validate error', () => {
    const character = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const name = _.times(41, () => _.sample(character)).join('');
    const location = _.times(101, () => _.sample(character)).join('');
    const description = _.times(1001, () => _.sample(character)).join('');

    cy.visit('/clusters/new');
    cy.get('#save').click();
    cy.get('#name-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 1-40.');
    cy.get('#name').type(name);
    cy.get('#name-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 1-40.');
    cy.get('#save').click();
    cy.url().should('include', '/clusters/new');
    cy.get('#name').clear();
    cy.get('#name').type('cluster-12');
    cy.get('#description').type(description);
    cy.get('#description-helper-text')
      .should('be.visible')
      .and('contain', 'Fill in the characters, the length is 0-1000.');
    cy.get('#description').clear();
    cy.get('#description').type('cluster description');
    cy.get('#location').type(location);
    cy.get('#location-helper-text').should('be.visible').and('contain', 'Fill in the characters, the length is 0-100.');
    cy.get('#save').click();
    cy.url().should('include', '/clusters/new');
    cy.get('#location').clear();
    cy.get('#location').type('Beijing');
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('hz');
    cy.get('#save').click();
    cy.get('#idc-helper-text').should('be.visible').and('contain', `Please press ENTER to end the IDC creation.`);
    cy.url().should('include', '/clusters/new');
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('hz{enter}');
    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('192.168.40.0/24');
    cy.get('#save').click();
    cy.url().should('include', '/clusters/new');
    cy.get('#cidrs-helper-text').should('be.visible').and('contain', `Please press ENTER to end the CIDRs creation.`);
    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(
      '192.168.40.0/24{enter}',
    );
    cy.get('#seedPeerLoadLimit').type('5000');
    cy.get('#seedPeerLoadLimit-helper-text')
      .should('be.visible')
      .and('contain', `Fill in the number, the length is 0-5000.`);
    cy.get('#save').click();
    cy.url().should('include', '/clusters/new');
    cy.get('#seedPeerLoadLimit').clear();
    cy.get('#seedPeerLoadLimit').type('400');
    cy.get('#peerLoadLimit').clear();
    cy.get('#peerLoadLimit').type('2001');
    cy.get('#peerLoadLimit-helper-text')
      .should('be.visible')
      .and('contain', `Fill in the number, the length is 0-2000.`);
    cy.get('#save').click();
    cy.url().should('include', '/clusters/new');
    cy.get('#peerLoadLimit').clear();
    cy.get('#peerLoadLimit').type('50');
    cy.get('#numberOfConcurrentDownloadPieces').clear();
    cy.get('#numberOfConcurrentDownloadPieces').type('51');
    cy.get('#numberOfConcurrentDownloadPieces-helper-text')
      .should('be.visible')
      .and('contain', `Fill in the number, the length is 0-50.`);
    cy.get('#save').click();
    cy.url().should('include', '/clusters/new');
    cy.get('#numberOfConcurrentDownloadPieces').clear();
    cy.get('#numberOfConcurrentDownloadPieces').type('10');
    cy.get('#candidateParentLimit').clear();
    cy.get('#candidateParentLimit').type('21');
    cy.get('#candidateParentLimit-helper-text')
      .should('be.visible')
      .and('contain', `Fill in the number, the length is 1-20.`);
    cy.get('#save').click();
    cy.url().should('include', '/clusters/new');
    cy.get('#candidateParentLimit').clear();
    cy.get('#candidateParentLimit').type('5');
    cy.get('#filterParentLimit').clear();
    cy.get('#filterParentLimit').type('9');
    cy.get('#filterParentLimit-helper-text')
      .should('be.visible')
      .and('contain', `Fill in the number, the length is 10-1000.`);
    cy.get('#save').click();
    cy.url().should('include', '/clusters/new');
    cy.get('#filterParentLimit').clear();
    cy.get('#filterParentLimit').type('1001');
    cy.get('#filterParentLimit-helper-text')
      .should('be.visible')
      .and('contain', `Fill in the number, the length is 10-1000.`);
    cy.get('#save').click();
    cy.url().should('include', '/clusters/new');
    cy.get('#filterParentLimit').clear();
    cy.get('#filterParentLimit').type('100');
  });

  it('Role guest add cluster', () => {
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
    ).as('user');
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
    ).as('guest');
    cy.intercept({ method: 'POST', url: '/api/v1/clusters' }, (req) => {
      (req.body = ''),
        req.reply({
          statusCode: 401,
          body: { message: 'permission deny' },
        });
    });

    cy.visit('/clusters/new');
    cy.wait(['@user', '@guest']);
    cy.get('.PrivateSwitchBase-input').click();
    cy.get('#name').type('cluster-12');
    cy.get('#description').type('update cluster-1');
    cy.get('#location').type('China|Shang|Hai');
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('Nanjing{enter}');
    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(
      '192.168.20.2{enter}',
    );
    cy.get('#seedPeerLoadLimit').clear();
    cy.get('#seedPeerLoadLimit').type('400');
    cy.get('#peerLoadLimit').clear();
    cy.get('#peerLoadLimit').type('50');
    cy.get('#numberOfConcurrentDownloadPieces').clear();
    cy.get('#numberOfConcurrentDownloadPieces').type('8');
    cy.get('#candidateParentLimit').clear();
    cy.get('#candidateParentLimit').type('5');
    cy.get('#filterParentLimit').clear();
    cy.get('#filterParentLimit').type('50{enter}');
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'permission deny');
    cy.get('#cancel').click();
    cy.wait(1000);
    cy.url().should('include', '/clusters');
  });

  it('Interface error', () => {
    cy.intercept({ method: 'POST', url: '/api/v1/clusters' }, (req) => {
      (req.body = ''),
        req.reply({
          forceNetworkError: true,
        });
    });

    cy.visit('/clusters/new');
    cy.get('.PrivateSwitchBase-input').click();
    cy.get('#name').type('cluster-12');
    cy.get('#description').type('update cluster-1');
    cy.get('#save').click();
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
  });
});
