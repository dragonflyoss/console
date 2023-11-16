import clusters from '../fixtures/api/clusters/clusters.json';
import root from '../fixtures/api/role-root.json';
import guest from '../fixtures/api/role-guest.json';
import user from '../fixtures/api/user.json';
import guestUser from '../fixtures/api/guest-user.json';
import seedPeers from '../fixtures/api/clusters/seed-peers.json';
import schedulers from '../fixtures/api/clusters/schedulers.json';
import cluster from '../fixtures/api/clusters/cluster.json';
import noScopesCluster from '../fixtures/api/clusters/show-cluster/no-scopes-cluster.json';
import seedPeer from '../fixtures/api/clusters/show-cluster/seed-peer.json';
import scheduler from '../fixtures/api/clusters/show-cluster/scheduler.json';
import deleteCluster from '../fixtures/api/clusters/show-cluster/delete-cluster.json';
import afterDeleteClusters from '../fixtures/api/clusters/show-cluster/after-delete-clusters.json';
import afterDeleteSchedulers from '../fixtures/api/clusters/show-cluster/after-delete-schedulers.json';
import secondDeleteScheduler from '../fixtures/api/clusters/show-cluster/second-delete-scheduler.json';
import searchScheduler from '../fixtures/api/clusters/show-cluster/search-scheduler.json';
import afterDeleteSeedPeers from '../fixtures/api/clusters/show-cluster/after-delete-seed-peers.json';
import secondDeleteSeedPeer from '../fixtures/api/clusters/show-cluster/second-delete-seed-peer.json';
import searchSeedPeer from '../fixtures/api/clusters/show-cluster/search-seed-peer.json';

describe('Show cluster', () => {
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

    cy.visit('/clusters');
    cy.viewport(1440, 1080);
  });

  it('Cluster', () => {
    cy.get(
      ':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .clusters_creatTimeContainer__k6XfL > .MuiButtonBase-root',
    ).click();

    cy.window().then((win) => {
      win.scrollTo(0, 0);
    });

    cy.get('.css-1p7sslo').scrollTo(0, 0);
    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root').should('be.visible').and('contain', 'cluster-1');
    cy.get('.information_clusterContainer__l8H8p > :nth-child(1) > .MuiTypography-subtitle1')
      .should('be.visible')
      .and('contain', 'cluster-1');
    cy.get('.information_clusterContainer__l8H8p > :nth-child(3) > .MuiTypography-subtitle1')
      .should('be.visible')
      .and(
        'contain',
        'Cluster-1 is a high-performance computing cluster located in China, specifically in Hangzhou and Beijing data centers.',
      );
    cy.get('.information_clusterContainer__l8H8p > :nth-child(5) > .MuiTypography-subtitle1')
      .should('be.visible')
      .and('contain', 'Yes');
    cy.get('.information_clusterContainer__l8H8p > :nth-child(7) > .css-70qvj9 > .MuiTypography-root')
      .should('be.visible')
      .and('contain', '1');
    cy.get('.information_clusterContainer__l8H8p > :nth-child(9) > .css-70qvj9 > .MuiTypography-root')
      .should('be.visible')
      .and('contain', '1');
    cy.get('.information_locationTextContainer__ZdjKa > .MuiTypography-root')
      .should('be.visible')
      .and('contain', 'China|Hang|Zhou');
    cy.get(
      ':nth-child(2) > .information_cidrsContainer__joiB7 > .information_cidrsTags__4sKxa > .MuiBox-root > :nth-child(1)',
    )
      .should('be.visible')
      .and('contain', 'Hangzhou');
    cy.get(
      ':nth-child(2) > .information_cidrsContainer__joiB7 > .information_cidrsTags__4sKxa > .MuiBox-root > :nth-child(2)',
    )
      .should('be.visible')
      .and('contain', 'Shanghai');

    cy.get('#idc').should('exist').click();
    cy.get('.MuiDialogContent-root').should('exist');
    cy.get('.MuiDialogContent-root > :nth-child(3)').should('be.visible').and('contain', 'Beijing');
    cy.get('body').click('topLeft');
    cy.get(
      ':nth-child(3) > .information_cidrsContainer__joiB7 > .information_cidrsTags__4sKxa > .MuiBox-root > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '192.168.0.0/16');
    cy.get('#cidrs').should('exist').click();
    cy.get('.MuiDialogContent-root').should('exist');
    cy.get('.MuiDialogContent-root').should('be.visible').and('contain', '10.0.0.0/8');
    cy.get('body').click('topLeft');
    cy.get('.css-1p7sslo').scrollTo(0, 0);
    cy.get('.MuiPaper-root > :nth-child(1) > .MuiTypography-body1').should('be.visible').and('contain', '300');
    cy.get('.MuiPaper-root > :nth-child(3) > .MuiTypography-body1').should('be.visible').and('contain', '51');
    cy.get(':nth-child(5) > .MuiTypography-body1').should('be.visible').and('contain', '4');
    cy.get(':nth-child(7) > .MuiTypography-body1').should('be.visible').and('contain', '4');
    cy.get(':nth-child(9) > .MuiTypography-body1').should('be.visible').and('contain', '40');
  });

  it('Cluster no scopes and no schedulers and seedPeers', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/2',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: noScopesCluster,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=2',
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
        url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=2',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );
    cy.get(':nth-child(8) > .MuiPaper-root > .clusters_clusterListContent__UwWjF')
      .should('be.visible')
      .and('contain', 'cluster-2')
      .and('contain', 'Non-Default');
    cy.get(
      ':nth-child(8) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .clusters_creatTimeContainer__k6XfL > .MuiButtonBase-root',
    ).click();

    cy.get('.information_clusterContainer__l8H8p > :nth-child(1)').should('be.visible').and('contain', 'cluster-2');
    cy.get(':nth-child(7) > .css-70qvj9 > .MuiButtonBase-root > .MuiBox-root').click();
    cy.get('#schedulerClusterIDCopyIcon').should('exist');
    cy.get('#schedulerClusterIDTooltip').should('exist');
    cy.wait(1000);
    cy.get('#schedulerClusterIDCopyIcon').should('not.exist');
    cy.get('#schedulerClusterIDTooltip').should('not.exist');

    cy.window()
      .its('navigator.clipboard')
      .then((clip) => clip.readText())
      .should('equal', '2');

    cy.get('.information_locationTextContainer__ZdjKa').should('have.text', '-');
    cy.get(':nth-child(2) > .MuiPaper-root > .information_cidrsTags__4sKxa').should('have.text', '-');
    cy.get(':nth-child(3) > .MuiPaper-root > .information_cidrsTags__4sKxa').should('have.text', '-');
    cy.get('.css-ms744u-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root').should(
      'have.text',
      '0',
    );
    cy.get('.css-1o0u1hg-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root').should(
      'have.text',
      '0',
    );
    cy.get(':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > .MuiTableCell-root')
      .should('exist')
      .and('contain', `You don't have scheduler cluster.`);
    cy.get(':nth-child(8) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > .MuiTableCell-root')
      .should('exist')
      .and('contain', `You don't have seed peer cluster.`);
  });

  it('Clipboard', () => {
    cy.visit('/clusters/1');

    cy.get(':nth-child(7) > .css-70qvj9 > .MuiButtonBase-root > .MuiBox-root').click();
    cy.get('#schedulerClusterIDCopyIcon').should('exist');
    cy.get('#schedulerClusterIDTooltip').should('exist');
    cy.wait(1000);
    cy.get('#schedulerClusterIDCopyIcon').should('not.exist');
    cy.get('#schedulerClusterIDTooltip').should('not.exist');

    cy.window()
      .its('navigator.clipboard')
      .then((clip) => clip.readText())
      .should('equal', '1');

    cy.get(':nth-child(9) > .css-70qvj9 > .MuiButtonBase-root > .MuiBox-root').click();
    cy.get('#seedPeerClusterIDCopyIcon').should('exist');
    cy.get('#seedPeerClusterIDTooltip').should('exist');
    cy.wait(1000);
    cy.get('#seedPeerClusterIDCopyIcon').should('not.exist');
    cy.get('#seedPeerClusterIDTooltip').should('not.exist');

    cy.window()
      .its('navigator.clipboard')
      .then((clip) => clip.readText())
      .should('equal', '1');
  });

  it('Interface errors', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 404,
          body: { message: 'Not Found' },
        });
      },
    );

    cy.visit('clusters/1');
    cy.get('.MuiBreadcrumbs-ol > :nth-child(1)').scrollIntoView();
    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root').should('not.be.visible');
    cy.get('.MuiAlert-message').should('have.text', 'Not Found');
  });

  it('Delete cluster', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/10',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: deleteCluster,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=10',
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
        url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=10',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );

    cy.get(':nth-child(7) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-10');
    cy.get(
      ':nth-child(7) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .clusters_creatTimeContainer__k6XfL > .MuiButtonBase-root',
    ).click();
    cy.get('.information_clusterContainer__l8H8p > :nth-child(1) > .MuiTypography-subtitle1')
      .should('be.visible')
      .and('contain', 'cluster-10');

    cy.intercept(
      {
        method: 'DELETE',
        url: '/api/v1/clusters/10',
      },
      (req) => {
        req.reply({
          statusCode: 200,
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
          body: afterDeleteClusters,
        });
      },
    );

    cy.get('.css-1rqacr6-MuiButtonBase-root-MuiButton-root').click();
    cy.get('#cancelDeleteCluster').click();
    cy.get('.css-1rqacr6-MuiButtonBase-root-MuiButton-root').click();
    cy.get('#deleteCluster').click();
    cy.get(':nth-child(7) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-2');
  });

  it('Role guest delete cluster', () => {
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
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/10',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: deleteCluster,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=10',
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
        url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=10',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );

    cy.get(':nth-child(7) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-10');
    cy.get(
      ':nth-child(7) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .clusters_creatTimeContainer__k6XfL > .MuiButtonBase-root',
    ).click();
    cy.get('.information_clusterContainer__l8H8p > :nth-child(1) > .MuiTypography-subtitle1')
      .should('be.visible')
      .and('contain', 'cluster-10');

    cy.intercept(
      {
        method: 'DELETE',
        url: '/api/v1/clusters/10',
      },
      (req) => {
        req.reply({
          statusCode: 401,
          body: { message: 'permission deny' },
        });
      },
    );

    cy.get('.css-1rqacr6-MuiButtonBase-root-MuiButton-root').click();
    cy.get('#deleteCluster').click();
    cy.get('.MuiAlert-message').should('have.text', 'permission deny');
  });

  it('Delete cluster failed', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/10',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: deleteCluster,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=10',
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
        url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=10',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );

    cy.get(':nth-child(7) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-10');
    cy.get(
      ':nth-child(7) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .clusters_creatTimeContainer__k6XfL > .MuiButtonBase-root',
    ).click();
    cy.get('.information_clusterContainer__l8H8p > :nth-child(1) > .MuiTypography-subtitle1')
      .should('be.visible')
      .and('contain', 'cluster-10');

    cy.intercept(
      {
        method: 'DELETE',
        url: '/api/v1/clusters/10',
      },
      (req) => {
        req.reply({
          statusCode: 200,
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
          body: afterDeleteClusters,
        });
      },
    );

    cy.get('.css-1rqacr6-MuiButtonBase-root-MuiButton-root').click();
    cy.get('#deleteCluster').click();
    cy.get(':nth-child(7) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-2');
  });

  it('If Scheduler Cluster and Seed Peer Cluster exist, deleting the cluster fails', () => {
    cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', '1');
    cy.get(
      ':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .clusters_creatTimeContainer__k6XfL > .MuiButtonBase-root',
    ).click();
    cy.get('.information_clusterContainer__l8H8p > :nth-child(1) > .MuiTypography-subtitle1')
      .should('be.visible')
      .and('contain', 'cluster-1');

    cy.intercept(
      {
        method: 'DELETE',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 500,
          body: { message: 'scheduler cluster exists scheduler' },
        });
      },
    );

    cy.get('.css-1rqacr6-MuiButtonBase-root-MuiButton-root').click();
    cy.get('#deleteCluster').click();
    cy.get('.MuiAlert-message').should('have.text', 'scheduler cluster exists scheduler');
  });

  it('Schedulers and seedPeers total', () => {
    cy.visit('/clusters/1');
    cy.get('.css-ms744u-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root')
      .should('be.visible')
      .and('contain', '4');
    cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label')
      .should('be.visible')
      .and('contain', 'Total: 11');
    cy.get('.css-1o0u1hg-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root')
      .should('be.visible')
      .and('contain', '8');
    cy.get('.css-1o0u1hg-MuiPaper-root > .MuiChip-root > .MuiChip-label')
      .should('be.visible')
      .and('contain', 'Total: 11');
  });

  it('Schedulers', () => {
    cy.visit('/clusters/1');

    cy.get('.css-1p7sslo > :nth-child(7)').scrollIntoView();
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'scheduler-7');
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(3) > .show_ipContainer__pzOmv',
    )
      .should('be.visible')
      .and('contain', '30.44.98.202');
    cy.get(':nth-child(1) > :nth-child(5) > .MuiChip-root > .MuiChip-label')
      .should('be.visible')
      .and('contain', 'Active');
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(2) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'scheduler-5');
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(2) > :nth-child(3) > .show_ipContainer__pzOmv',
    )
      .should('be.visible')
      .and('contain', '20.14.28.202');
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'scheduler-10');
    cy.get(':nth-child(5) > :nth-child(5) > .MuiChip-root > .MuiChip-label')
      .should('be.visible')
      .and('contain', 'Inactive');
    cy.get(':nth-child(7) > .MuiPagination-root > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(2)',
    ).scrollIntoView();
    cy.get('#schedulerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'scheduler-11');
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(3) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'scheduler-8');
    cy.get('#schedulerPagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();
    cy.get('#schedulerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'scheduler-2');
  });

  it('Delete scheduler', () => {
    cy.visit('/clusters/1');

    cy.get('#schedulerPagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();
    cy.get('#schedulerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

    cy.intercept(
      {
        method: 'DELETE',
        url: '/api/v1/schedulers/2',
      },
      (req) => {
        req.reply({
          statusCode: 200,
        });
      },
    ).as('deleteScheduler');
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: afterDeleteSchedulers,
        });
      },
    );
    cy.get(':nth-child(7) > .MuiButtonBase-root').click();
    cy.get('#cancelDeleteScheduler').click();
    cy.get(':nth-child(7) > .MuiButtonBase-root').click();
    cy.get('#deleteScheduler').click();

    cy.wait('@deleteScheduler');

    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('have.text', 'Submission successful!');

    cy.get(
      ':nth-child(7) > .css-8atqhb > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(2)',
    ).scrollIntoView();

    cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('exist').and('contain', 'Total: 10');

    cy.get(
      ':nth-child(7) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'scheduler-11');
    cy.get('#schedulerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
  });

  it('Failed to delete scheduler', () => {
    cy.visit('/clusters/1');

    cy.get('#schedulerPagination > .MuiPagination-ul .Mui-selected').scrollIntoView();
    cy.get(':nth-child(1) > :nth-child(7) > .MuiButtonBase-root > [data-testid="DeleteIcon"]').click();

    cy.intercept(
      {
        method: 'DELETE',
        url: '/api/v1/schedulers/7',
      },
      (req) => {
        req.reply({
          statusCode: 401,
          body: { message: 'Unauthorized' },
        });
      },
    ).as('deleteScheduler');
    cy.get('#deleteScheduler').click();

    cy.wait('@deleteScheduler');

    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('have.text', 'Unauthorized');
  });

  it('Role guest delete scheduler', () => {
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

    cy.visit('/clusters/1');

    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(2)',
    ).scrollIntoView();
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'scheduler-7');

    cy.intercept(
      {
        method: 'DELETE',
        url: '/api/v1/schedulers/7',
      },
      (req) => {
        req.reply({
          statusCode: 401,
          body: { message: 'permission deny' },
        });
      },
    ).as('deleteScheduler');

    cy.get(':nth-child(1) > :nth-child(7) > .MuiButtonBase-root').click();
    cy.get('#deleteScheduler').click();

    cy.wait('@deleteScheduler');

    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('have.text', 'permission deny');
  });

  it('Search scheduler', () => {
    cy.visit('/clusters/1');

    cy.get('.css-1p7sslo > :nth-child(5)').scrollIntoView();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/schedulers?host_name=scheduler-8&page=1&per_page=10000000&scheduler_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: searchScheduler,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/schedulers?host_name=scheduler-3&page=1&per_page=10000000&scheduler_cluster_id=1',
      },
      (req) => {
        req.reply({
          forceNetworkError: true,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/schedulers?host_name=scheduler-100&page=1&per_page=10000000&scheduler_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );

    cy.get(
      ':nth-child(6) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
    ).type('scheduler-8{enter}');
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'scheduler-8');
    cy.get('.MuiAutocomplete-endAdornment').click();
    cy.get('#scheduler-button').click();
    cy.wait(1000);
    cy.get('#schedulerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');
    cy.get('#schedulerPagination > .MuiPagination-ul').children().should('have.length', 5);
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'scheduler-7');
    cy.get(
      ':nth-child(6) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
    ).type('scheduler-3{enter}');
    cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    cy.get('.MuiAutocomplete-endAdornment').click();
    cy.get(
      ':nth-child(7) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
    ).type('scheduler-100{enter}');
    cy.get(
      ':nth-child(7) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > .MuiTableCell-root',
    ).and('contain', `You don't have scheduler cluster.`);
  });

  it('Delete the scheduler, but there is only one scheduler on the next page', () => {
    cy.visit('/clusters/1');

    cy.get('#schedulerPagination > .MuiPagination-ul .Mui-selected').scrollIntoView();
    cy.get('#schedulerPagination > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
    cy.get('#schedulerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'scheduler-4');
    cy.get(':nth-child(5) > :nth-child(7) > .MuiButtonBase-root').click();
    cy.get('#schedulerPagination > .MuiPagination-ul').children().should('have.length', 5);

    cy.intercept(
      {
        method: 'DELETE',
        url: '/api/v1/schedulers/4',
      },
      (req) => {
        req.reply({
          statusCode: 200,
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
          body: secondDeleteScheduler,
        });
      },
    ).as('deleteScheduler');

    cy.get('#deleteScheduler').click();

    cy.wait('@deleteScheduler');

    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('have.text', 'Submission successful!');
    cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('exist').and('contain', 'Total: 10');
    cy.get('#schedulerPagination > .MuiPagination-ul').children().should('have.length', 4);
    cy.get(
      ':nth-child(7) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'scheduler-2');
  });

  it('seedPeers', () => {
    cy.visit('/clusters/1');

    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(2)',
    ).scrollIntoView();
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'seed-peer-10');
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(3) > .show_ipContainer__pzOmv',
    )
      .should('be.visible')
      .and('contain', '192.168.255.255');
    cy.get(':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(4)')
      .should('be.visible')
      .and('contain', '65006');
    cy.get(':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(5)')
      .should('be.visible')
      .and('contain', '65002');
    cy.get(':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(7)')
      .should('be.visible')
      .and('contain', 'Super');
    cy.get(':nth-child(1) > :nth-child(8) > .MuiChip-root').should('be.visible').and('contain', 'Active');
    cy.get('#seedPeerPagination > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
    cy.get('#seedPeerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(4) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'seed-peer-11');
    cy.get(':nth-child(4) > :nth-child(8) > .MuiChip-root > .MuiChip-label')
      .should('be.visible')
      .and('contain', 'Inactive');
    cy.get('#seedPeerPagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();
    cy.get('#seedPeerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'seed-peer-3');
    cy.get('#seedPeerPagination > .MuiPagination-ul > :nth-child(1) > .MuiButtonBase-root').click();
    cy.get('#seedPeerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
    cy.get('#seedPeerPagination > .MuiPagination-ul > :nth-child(5) > .MuiButtonBase-root').click();
    cy.get('#seedPeerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');
  });

  it('Delete seedPeer', () => {
    cy.visit('/clusters/1');

    cy.get('#seedPeerPagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();
    cy.get('#seedPeerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'seed-peer-3');

    cy.intercept({ method: 'DELETE', url: '/api/v1/seed-peers/3' }, (req) => {
      req.reply({
        statusCode: 200,
      });
    }).as('deleteSeedPeer');

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: afterDeleteSeedPeers,
        });
      },
    );

    cy.get(':nth-child(9) > .MuiButtonBase-root').click();
    cy.get('#cancelDeleteSeedPeer').click();
    cy.get('.MuiDialogContent-root').should('not.exist');
    cy.get(':nth-child(9) > .MuiButtonBase-root').click();
    cy.get('#deleteSeedPeer').click();

    cy.wait('@deleteSeedPeer');
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('have.text', 'Submission successful!');
    cy.wait(1000);

    cy.get('.css-1o0u1hg-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('exist').and('contain', 'Total: 10');
    cy.get('#seedPeerPagination > .MuiPagination-ul').children().should('have.length', 4);
  });

  it('Failed to delete seedPeer', () => {
    cy.visit('/clusters/1');

    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(2)',
    ).scrollIntoView();
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'seed-peer-10');

    cy.intercept(
      {
        method: 'DELETE',
        url: '/api/v1/seed-peers/10',
      },
      (req) => {
        req.reply({
          statusCode: 401,
          body: { message: 'Unauthorized' },
        });
      },
    ).as('deleteSeedPeer');

    cy.get(':nth-child(1) > :nth-child(9) > .MuiButtonBase-root').click();
    cy.get('#deleteSeedPeer').click();

    cy.wait('@deleteSeedPeer');

    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('have.text', 'Unauthorized');
  });

  it('Role guest delete seedPeer', () => {
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

    cy.visit('/clusters/1');

    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(2)',
    ).scrollIntoView();
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'seed-peer-10');

    cy.intercept(
      {
        method: 'DELETE',
        url: '/api/v1/seed-peers/10',
      },
      (req) => {
        req.reply({
          statusCode: 401,
          body: { message: 'permission deny' },
        });
      },
    ).as('deleteSeedPeer');

    cy.get(':nth-child(1) > :nth-child(9) > .MuiButtonBase-root').click();
    cy.get('#deleteSeedPeer').click();

    cy.wait('@deleteSeedPeer');

    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('have.text', 'permission deny');
  });

  it('Search seedPeer', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?host_name=seed-peer-4&page=1&per_page=10000000&seed_peer_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: searchSeedPeer,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?host_name=seed-peer-3&page=1&per_page=10000000&seed_peer_cluster_id=1',
      },
      (req) => {
        req.reply({
          forceNetworkError: true,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?host_name=seed-peer-100&page=1&per_page=10000000&seed_peer_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(2)',
    ).scrollIntoView();
    cy.get(
      ':nth-child(9) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
    ).type('seed-peer-4{enter}');
    cy.get('#seedPeerPagination > .MuiPagination-ul').should('not.exist');
    cy.get('.MuiAutocomplete-endAdornment').click();
    cy.get('#seedPeer-button').click();
    cy.wait(1000);
    cy.get('#seedPeerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');
    cy.get('#seedPeerPagination > .MuiPagination-ul').children().should('have.length', 5);
    cy.get(
      ':nth-child(9) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
    ).type('seed-peer-3{enter}');
    cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    cy.get('.MuiAutocomplete-endAdornment').click();
    cy.get('.css-1p7sslo > :nth-child(10)').scrollIntoView();
    cy.get(
      ':nth-child(9) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
    ).type('seed-peer-100{enter}');
    cy.get(':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > .MuiTableCell-root')
      .should('be.visible')
      .and('contain', `You don't have seed peer cluster.`);
  });

  it('Delete the seed-peer, but there is only one seed-peer on the next page', () => {
    cy.visit('/clusters/1');

    cy.get('#seedPeerPagination > .MuiPagination-ul').scrollIntoView();
    cy.get('#seedPeerPagination > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
    cy.get('#seedPeerPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
    )
      .scrollIntoView()
      .should('be.visible')
      .and('contain', 'seed-peer-9');
    cy.get(':nth-child(5) > :nth-child(8) > .MuiChip-root > .MuiChip-label')
      .should('be.visible')
      .and('contain', 'Inactive');

    cy.intercept({ method: 'DELETE', url: '/api/v1/seed-peers/9' }, (req) => {
      req.reply({
        statusCode: 200,
      });
    }).as('deleteSeedPeer');
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: secondDeleteSeedPeer,
        });
      },
    );

    cy.get(':nth-child(5) > :nth-child(9) > .MuiButtonBase-root').click();
    cy.get('#deleteSeedPeer').click();
    cy.wait('@deleteSeedPeer');
    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('have.text', 'Submission successful!');
    cy.get('#seedPeerPagination > .MuiPagination-ul').scrollIntoView();
    cy.get('.css-1o0u1hg-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('exist').and('contain', 'Total: 10');
    cy.get('#seedPeerPagination > .MuiPagination-ul').children().should('have.length', 4);
    cy.get(
      ':nth-child(10) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'seed-peer-3');
    cy.get(
      ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(3) > .show_ipContainer__pzOmv',
    )
      .should('be.visible')
      .and('contain', '30.44.18.202');
  });
});
