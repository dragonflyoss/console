import root from '../fixtures/api/role-root.json';
import user from '../fixtures/api/user.json';
import cluster from '../fixtures/api/clusters/cluster.json';
import seedPeer from '../fixtures/api/clusters/show-cluster/seed-peer.json';
import scheduler from '../fixtures/api/clusters/show-cluster/scheduler.json';
import seedPeerID from '../fixtures/api/seed-peer/seed-peer.json';
import inactiveSeedPeer from '../fixtures/api/seed-peer/inactive-seed-peer.json';

describe('SeedPeer', () => {
  beforeEach(() => {
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

    cy.signin();
    cy.visit('/clusters/1');
    cy.viewport(1440, 1080);
  });

  it('SeedPeer', () => {
    cy.intercept({ method: 'GET', url: '/api/v1/seed-peers/10' }, (req) => {
      req.reply({
        statusCode: 200,
        body: seedPeerID,
      });
    });

    cy.wait(1000);
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2)',
    ).scrollIntoView();
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'seed-peer-10');
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    ).click();
    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
      .should('be.visible')
      .and('contain', 'seed-peer-cluster-1');
    cy.get('.MuiBreadcrumbs-ol > :nth-child(7) > .MuiTypography-root')
      .should('be.visible')
      .and('contain', 'seed-peer-10');
    cy.get('.show_container__nkAxK > :nth-child(1)').should('be.visible').and('contain', '10');
    cy.get('.show_container__nkAxK > :nth-child(2)').should('be.visible').and('contain', 'seed-peer-10');
    cy.get('.show_container__nkAxK > :nth-child(3)').should('be.visible').and('contain', '33.149.137.183');
    cy.get('.show_clusterIDContaine__GdZwH').should('be.visible').and('contain', '1');
    cy.get('.show_seedPeerContainer__X4hKN > :nth-child(1)').should('be.visible').and('contain', '65006');
    cy.get('.show_seedPeerContainer__X4hKN > :nth-child(2)').should('be.visible').and('contain', '65002');
    cy.get('.show_seedPeerContainer__X4hKN > :nth-child(4)').should('be.visible').and('contain', 'Supe');
    cy.get(':nth-child(5) > .MuiChip-root')
      .should('be.visible')
      .and('contain', 'Active')
      .and('have.css', 'background-color', 'rgb(46, 143, 121)');
    cy.get(':nth-child(6) > .MuiChip-root > .MuiChip-label').should('be.visible').and('have.text', '2023-11-12-04:09');
    cy.get(':nth-child(7) > .MuiChip-root > .MuiChip-label').should('be.visible').and('have.text', '2023-11-12-04:09');
  });

  it('State Inactive', () => {
    cy.intercept({ method: 'GET', url: '/api/v1/seed-peers/11' }, (req) => {
      req.reply({
        statusCode: 200,
        body: inactiveSeedPeer,
      });
    });

    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2)',
    ).scrollIntoView();
    cy.get('#seedPeerPagination > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(4) > :nth-child(2) > .MuiTypography-root',
    )
      .should('have.text', 'seed-peer-11')
      .click();
    cy.get('.MuiBreadcrumbs-ol > :nth-child(7) > .MuiTypography-root')
      .should('be.visible')
      .and('contain', 'seed-peer-11');
    cy.get(':nth-child(5) > .MuiChip-root')
      .should('be.visible')
      .and('contain', 'Inactive')
      .and('have.css', 'background-color', 'rgb(28, 41, 58)');
  });

  it('Interface error', () => {
    cy.intercept({ method: 'GET', url: '/api/v1/seed-peers/5' }, (req) => {
      req.reply({
        statusCode: 404,
        body: { message: 'Not Found' },
      });
    });

    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
    ).scrollIntoView();
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'seed-peer-5');
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
    ).click();
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Not Found');
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
      .should('be.visible')
      .and('contain', 'seed-peer-cluster-1');
    cy.get('.show_container__nkAxK > :nth-child(1) > .css-1n0qe7k-MuiTypography-root').should('have.text', '-');
    cy.get('.show_seedPeerContainer__X4hKN > :nth-child(1) > .css-1n0qe7k-MuiTypography-root').should('have.text', '-');
  });
});
