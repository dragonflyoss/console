import root from '../fixtures/api/role-root.json';
import user from '../fixtures/api/user.json';
import cluster from '../fixtures/api/clusters/cluster/cluster.json';
import seedPeers from '../fixtures/api/clusters/cluster/seed-peer.json';
import seedPeer from '../fixtures/api/seed-peer.json';
import seedPeerInactive from '../fixtures/api/seed-peer-inactive.json';

describe('Seed peer', () => {
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
          body: seedPeers,
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
    cy.intercept({ method: 'GET', url: '/api/v1/seed-peers/10' }, (req) => {
      req.reply({
        statusCode: 200,
        body: seedPeer,
      });
    });

    cy.signin();
    cy.visit('/clusters/1/seed-peers/10');
    cy.viewport(1440, 1080);
  });

  it('click the hostname', () => {
    cy.visit('/clusters/1');

    cy.get('#seed-peer-table-body > :nth-child(1) > :nth-child(2) > .MuiTypography-root').should(
      'have.text',
      'seed-peer-10',
    );
    cy.get('#seed-peer-table-body > :nth-child(1) > :nth-child(2) > .MuiTypography-root').click();

    // Then I see that the current page is the clusters/1/seed-peers/10!
    cy.url().should('include', '/clusters/1/seed-peers/10');
  });

  it('click the breadcrumb', () => {
    // Check for breadcrumb.
    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
      .should('be.visible')
      .and('contain', 'seed-peer-cluster-1');

    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root').click();

    // Then I see that the current page is the clusters/1!
    cy.url().should('include', '/clusters/1');
  });

  describe('when data is loaded', () => {
    it('can display breadcrumb', () => {
      cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
        .should('be.visible')
        .and('contain', 'seed-peer-cluster-1');

      cy.get('.MuiBreadcrumbs-ol > :nth-child(7) > .MuiTypography-root')
        .should('be.visible')
        .and('contain', 'seed-peer-10');
    });

    it('can display active seed peer', () => {
      // Show ID.
      cy.get('.show_container__nkAxK > :nth-child(1)').should('be.visible').and('contain', '10');

      // Show Hostname.
      cy.get('.show_container__nkAxK > :nth-child(2)').should('be.visible').and('contain', 'seed-peer-10');

      // Show IP.
      cy.get('.show_container__nkAxK > :nth-child(3)').should('be.visible').and('contain', '33.149.137.183');

      // Show Cluster ID.
      cy.get('.show_clusterIDContaine__GdZwH').should('be.visible').and('contain', '1');

      // Show Port.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(1)').should('be.visible').and('contain', '65006');

      // Show Download Port.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(2)').should('be.visible').and('contain', '65002');

      // Show Object Storage Port.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(3) > .css-1n0qe7k-MuiTypography-root')
        .should('be.visible')
        .and('contain', '443');

      // Show Type.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(4)').should('be.visible').and('contain', 'Supe');

      // Show Active background color.
      cy.get(':nth-child(5) > .MuiChip-root')
        .should('be.visible')
        .and('contain', 'Active')
        .and('have.css', 'background-color', 'rgb(46, 143, 121)');

      // Show Created At.
      cy.get(':nth-child(6) > .MuiChip-root > .MuiChip-label').should('have.text', '2023-11-11 20:09:08');

      // Show Updated At.
      cy.get(':nth-child(7) > .MuiChip-root > .MuiChip-label').should('have.text', '2023-11-11 20:09:13');
    });

    it('can display inactive seed peer', () => {
      cy.intercept({ method: 'GET', url: '/api/v1/seed-peers/11' }, (req) => {
        req.reply({
          statusCode: 200,
          body: seedPeerInactive,
        });
      });

      cy.visit('/clusters/1/seed-peers/11');

      // Show Hostname.
      cy.get('.show_container__nkAxK > :nth-child(2)').should('be.visible').and('contain', 'seed-peer-11');

      // Show Inactive background color.
      cy.get(':nth-child(5) > .MuiChip-root')
        .should('be.visible')
        .and('contain', 'Inactive')
        .and('have.css', 'background-color', 'rgb(28, 41, 58)');
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
      cy.intercept({ method: 'GET', url: '/api/v1/seed-peers/10' }, (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      });
    });

    it('unable to display breadcrumb', () => {
      cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
        .should('be.visible')
        .and('contain', 'seed-peer-cluster-1');

      cy.get('.MuiBreadcrumbs-ol > :nth-child(7) > .MuiTypography-root').should('be.visible').and('contain', '-');
    });

    it('seed peer should render empty status', () => {
      // Show ID.
      cy.get('.show_container__nkAxK > :nth-child(1)').should('contain', '-');

      // Show Hostname.
      cy.get('.show_container__nkAxK > :nth-child(2)').should('contain', '-');

      // Show IP.
      cy.get('.show_container__nkAxK > :nth-child(3)').should('contain', '-');

      // Show Cluster ID.
      cy.get('.show_clusterIDContaine__GdZwH').should('contain', '-');

      // Show Port.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(1)').should('contain', '-');

      // Show Download Port.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(2)').should('contain', '-');

      // Show Object Storage Port.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(3) > .css-1n0qe7k-MuiTypography-root').should('contain', '-');

      // Show Type.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(4)').should('contain', '-');

      // Show Start.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(5)').should('contain', '-');

      // Show Created At.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(6)').should('contain', '-');

      // Show Updated At.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(7)').should('contain', '-');
    });
  });

  describe('should handle API error response', () => {
    beforeEach(() => {
      cy.intercept({ method: 'GET', url: '/api/v1/seed-peers/1' }, (req) => {
        req.reply({
          forceNetworkError: true,
        });
      });

      cy.visit('/clusters/1/seed-peers/1');
    });

    it('show error message', () => {
      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiAlert-message').should('not.exist');
    });

    it('unable to display breadcrumb', () => {
      cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
        .should('be.visible')
        .and('contain', 'seed-peer-cluster-1');

      cy.get('.MuiBreadcrumbs-ol > :nth-child(7) > .MuiTypography-root').should('be.visible').and('contain', '-');
    });

    it('seed peer should render empty status', () => {
      // Show ID.
      cy.get('.show_container__nkAxK > :nth-child(1)').should('contain', '-');

      // Show Hostname.
      cy.get('.show_container__nkAxK > :nth-child(2)').should('contain', '-');

      // Show IP.
      cy.get('.show_container__nkAxK > :nth-child(3)').should('contain', '-');

      // Show Cluster ID.
      cy.get('.show_clusterIDContaine__GdZwH').should('contain', '-');

      // Show Port.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(1)').should('contain', '-');

      // Show Download Port.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(2)').should('contain', '-');

      // Show Object Storage Port.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(3) > .css-1n0qe7k-MuiTypography-root').should('contain', '-');

      // Show Type.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(4)').should('contain', '-');

      // Show Start.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(5)').should('contain', '-');

      // Show Created At.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(6)').should('contain', '-');

      // Show Updated At.
      cy.get('.show_seedPeerContainer__X4hKN > :nth-child(7)').should('contain', '-');
    });
  });
});
