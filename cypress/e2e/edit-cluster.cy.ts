import root from '../fixtures/api/role-root.json';
import guest from '../fixtures/api/role-guest.json';
import user from '../fixtures/api/user.json';
import guestUser from '../fixtures/api/guest-user.json';
import cluster from '../fixtures/api/clusters/cluster.json';
import seedPeer from '../fixtures/api/clusters/show-cluster/seed-peer.json';
import scheduler from '../fixtures/api/clusters/show-cluster/scheduler.json';
import editClusterBody from '../fixtures/api/clusters/show-cluster/edit-cluster.body.json';
import editCluster from '../fixtures/api/clusters/show-cluster/edit-cluster.json';
import _ from 'lodash';

describe('Edit cluster', () => {
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
          body: seedPeer,
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
          body: scheduler,
        });
      },
    );
    cy.visit('/clusters/1');
    cy.viewport(1440, 1080);
  });

  it('Update cluster', () => {
    cy.intercept({ method: 'PATCH', url: '/api/v1/clusters/1' }, (req) => {
      (req.body = ''),
        req.reply({
          statusCode: 200,
          body: editClusterBody,
        });
    });

    cy.get('.css-bbra84-MuiButtonBase-root-MuiButton-root').click();
    cy.get('.MuiPaper-root > .css-0 > :nth-child(2)').should('be.visible').and('contain', 'cluster-1');
    cy.get('.PrivateSwitchBase-input').click();
    cy.get('#description').clear();
    cy.get('#description').type('update cluster-1');
    cy.get('#location').clear();
    cy.get('#location').type('China|Shang|Hai');
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root')
      .type('{selectall}')
      .type('{backspace}');
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

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: editCluster,
        });
      },
    );

    cy.get('#filterParentLimit').type('50{enter}');
    cy.get('.show_container__osP4U > .MuiTypography-root').scrollIntoView();
    cy.get('.information_clusterContainer__l8H8p > :nth-child(3) > .MuiTypography-subtitle1')
      .should('be.visible')
      .and('contain', 'update cluster-1');
    cy.get('.information_clusterContainer__l8H8p > :nth-child(5) > .MuiTypography-subtitle1')
      .should('be.visible')
      .and('contain', 'No');
    cy.get('#cidrs').click();
    cy.get('.MuiDialogContent-root > :nth-child(4)').should('be.visible').and('contain', '192.168.20.2');
    cy.get('body').click('topLeft');
    cy.get('.MuiPaper-root > :nth-child(1) > .MuiTypography-body1').scrollIntoView();
    cy.get('.MuiPaper-root > :nth-child(1) > .MuiTypography-body1').should('be.visible').and('contain', '400');
  });

  it('Validate error', () => {
    const character = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const location = _.times(101, () => _.sample(character)).join('');
    const description = _.times(1001, () => _.sample(character)).join('');

    cy.visit('/clusters/1/edit');
    cy.get('#description').type(description);
    cy.get('#description-helper-text')
      .should('be.visible')
      .and('contain', 'Fill in the characters, the length is 0-1000.');
    cy.get('#location').type(location);
    cy.get('#location-helper-text').should('be.visible').and('contain', `Fill in the characters, the length is 0-100.`);
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(location);
    cy.get('#idc-helper-text').should('be.visible').and('contain', `Fill in the characters, the length is 0-100.`);
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').clear();
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('hz');
    cy.get('#save').click();
    cy.get('#idc-helper-text').should('be.visible').and('contain', `Please press ENTER to end the IDC creation.`);
    cy.get(':nth-child(3) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('192.168.40.0/24');
    cy.get('#save').click();
    cy.get('#cidrs-helper-text').should('be.visible').and('contain', `Please press ENTER to end the CIDRs creation.`);
    cy.get('#seedPeerLoadLimit').type('5000');
    cy.get('#seedPeerLoadLimit-helper-text')
      .should('be.visible')
      .and('contain', `Fill in the number, the length is 0-5000.`);
    cy.get('#peerLoadLimit').clear();
    cy.get('#peerLoadLimit').type('2001');
    cy.get('#peerLoadLimit-helper-text')
      .should('be.visible')
      .and('contain', `Fill in the number, the length is 0-2000.`);
    cy.get('#numberOfConcurrentDownloadPieces').clear();
    cy.get('#numberOfConcurrentDownloadPieces').type('51');
    cy.get('#numberOfConcurrentDownloadPieces-helper-text')
      .should('be.visible')
      .and('contain', `Fill in the number, the length is 0-50.`);
    cy.get('#candidateParentLimit').clear();
    cy.get('#candidateParentLimit').type('21');
    cy.get('#candidateParentLimit-helper-text')
      .should('be.visible')
      .and('contain', `Fill in the number, the length is 1-20.`);
    cy.get('#filterParentLimit').clear();
    cy.get('#filterParentLimit').type('9');
    cy.get('#filterParentLimit-helper-text')
      .should('be.visible')
      .and('contain', `Fill in the number, the length is 10-1000.`);
    cy.get('#filterParentLimit').clear();
    cy.get('#filterParentLimit').type('1001');
    cy.get('#filterParentLimit-helper-text')
      .should('be.visible')
      .and('contain', `Fill in the number, the length is 10-1000.`);
  });

  it('Role guest update cluster', () => {
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
    cy.intercept({ method: 'PATCH', url: '/api/v1/clusters/1' }, (req) => {
      (req.body = ''),
        req.reply({
          statusCode: 401,
          body: { message: 'permission deny' },
        });
    });

    cy.visit('/clusters/1/edit');
    cy.get('.MuiPaper-root > .css-0 > :nth-child(2)').should('be.visible').and('contain', 'cluster-1');
    cy.get('.PrivateSwitchBase-input').click();
    cy.get('#description').clear();
    cy.get('#description').type('update cluster-1');
    cy.get('#location').clear();
    cy.get('#location').type('China|Shang|Hai');
    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root')
      .type('{selectall}')
      .type('{backspace}');
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
    cy.get('.MuiBreadcrumbs-ol').scrollIntoView();
    cy.wait(1000);
    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root').should('be.visible').and('contain', 'cluster-1');
  });

  it('Interface error', () => {
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

    cy.visit('/clusters/1/edit');

    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
    cy.get('.MuiPaper-root > .css-0 > :nth-child(2)').should('be.visible').and('contain', 'Name:');
  });
});
