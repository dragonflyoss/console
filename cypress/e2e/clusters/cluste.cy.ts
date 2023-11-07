import clusters from './ __mocks__/clusters.json';
import seedPeers from './ __mocks__//seed_peers.json';
import schedulers from './ __mocks__/schedulers.json';
import users from './ __mocks__/users.json';
import roles from './ __mocks__/roles.json';
import searchCluster from './ __mocks__/search_cluster.json';
import seedPeer from './ __mocks__/seed_peer.json';
import schedule from './ __mocks__/scheduler.json';
import cluster from './ __mocks__/cluster.json';

describe('The clusters Page', () => {
  beforeEach(() => {
    cy.signin();
    
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
        url: '/api/v1/clusters?name=cluster-1&page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: searchCluster,
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
          body: users,
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
          body: roles,
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
          body: schedule,
        });
      },
    );
  });

  it('clusters page', function () {
    cy.visit('/clusters');

    cy.get('.MuiBreadcrumbs-li > .MuiTypography-root').should('be.visible').and('contain', 'Cluster');

    cy.get('.MuiInputBase-root').type('cluster-1{enter}');

    cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-1');

    cy.get('.clusters_creatTimeContainer__k6XfL > .MuiButtonBase-root').click();

    cy.wait(2000);

    cy.get('.information_clusterContainer__l8H8p > :nth-child(1) > .MuiTypography-subtitle1')
      .should('be.visible')
      .and('contain', 'cluster-1');

    cy.get('.MuiBreadcrumbs-ol > :nth-child(1) > .MuiTypography-root').click();

    cy.get('.clusters_clusterTitle__5Lhnw > .MuiButtonBase-root').click();

    cy.get('#cancle').click();
    cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
    cy.get('.MuiPagination-ul > :nth-child(2) > .MuiButtonBase-root').click();

    //Search cluster
    cy.get('.MuiInputBase-root').type('cluster-1{enter}');
    cy.get('.MuiAutocomplete-endAdornment').click();
    cy.get('#submit-button').click();

    cy.get('.MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();
    cy.get('.MuiPagination-ul > :nth-child(1) > .MuiButtonBase-root').click();
  });
});
