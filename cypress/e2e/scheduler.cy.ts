import root from '../fixtures/api/role-root.json';
import user from '../fixtures/api/user.json';
import cluster from '../fixtures/api/clusters/cluster.json';
import seedPeer from '../fixtures/api/clusters/show-cluster/seed-peer.json';
import scheduler from '../fixtures/api/clusters/show-cluster/scheduler.json';
import schedulerID from '../fixtures/api/schedulers/scheduler.json';
import inactiveScheduler from '../fixtures/api/schedulers/inactive-scheduler.json';

describe('Scheduler', () => {
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

  it('Scheduler', () => {
    cy.intercept({ method: 'GET', url: '/api/v1/schedulers/7' }, (req) => {
      req.reply({
        statusCode: 200,
        body: schedulerID,
      });
    });

    cy.get('.css-1p7sslo > :nth-child(6)').scrollIntoView();
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    ).click();
    cy.url().should('include', '/clusters/1/schedulers/7');
    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
      .should('be.visible')
      .and('contain', 'scheduler-cluster-1');
    cy.get(':nth-child(7) > .MuiTypography-root').should('be.visible').and('contain', 'scheduler-7');
    cy.get('.show_container__qetel > :nth-child(1) > .css-1n0qe7k-MuiTypography-root')
      .should('be.visible')
      .and('contain', '7');
    cy.get(':nth-child(2) > .css-1n0qe7k-MuiTypography-root').should('be.visible').and('contain', 'scheduler-7');
    cy.get(':nth-child(3) > .css-1n0qe7k-MuiTypography-root').should('be.visible').and('contain', '30.44.98.202');
    cy.get('.show_clusterIDContaine__Gvk7F > .css-1n0qe7k-MuiTypography-root').should('be.visible').and('contain', '1');
    cy.get('.show_schedulerContainer__euX4O > :nth-child(1) > .css-1n0qe7k-MuiTypography-root')
      .should('be.visible')
      .and('contain', '8002');
    cy.get(':nth-child(2) > .MuiChip-root')
      .should('be.visible')
      .and('contain', 'Active')
      .and('have.css', 'background-color', 'rgb(46, 143, 121)');
    cy.get('.show_schedulerContainer__euX4O > :nth-child(3)')
      .should('be.visible')
      .and('contain', 'Schedule')
      .and('contain', 'Preheat');
    cy.get(':nth-child(4) > .MuiChip-root > .MuiChip-label').should('be.visible').and('contain', '2023-11-09-15:09');
    cy.get(':nth-child(5) > .MuiChip-root > .MuiChip-label').should('be.visible').and('contain', '2023-11-09-15:09');
  });

    it('State Inactive', () => {
      cy.intercept({ method: 'GET', url: '/api/v1/schedulers/10' }, (req) => {
        req.reply({
          statusCode: 200,
          body: inactiveScheduler,
        });
      });

      cy.get('.css-1p7sslo > :nth-child(6)').scrollIntoView();
      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
      ).click();
      cy.get('.show_container__qetel > :nth-child(2)').should('be.visible').and('contain', 'scheduler-10');
      cy.get(':nth-child(2) > .MuiChip-root')
        .should('be.visible')
        .and('contain', 'Inactive')
        .and('have.css', 'background-color', 'rgb(28, 41, 58)');
    });

    it('Interface error', () => {
      cy.intercept({ method: 'GET', url: '/api/v1/schedulers/10' }, (req) => {
        req.reply({
          statusCode: 404,
          body: { message: 'Not Found' },
        });
      });

      cy.get('.css-1p7sslo > :nth-child(6)').scrollIntoView();
      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
      ).click();
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Not Found');
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
      cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
        .should('be.visible')
        .and('contain', 'scheduler-cluster-1');
      cy.get(':nth-child(2) > .css-1n0qe7k-MuiTypography-root').should('be.visible').and('contain', '-');
    });
});
