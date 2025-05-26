import cluster from '../../fixtures/clusters/cluster/cluster.json';
import seedPeers from '../../fixtures/clusters/cluster/seed-peer.json';
import seedPeer from '../../fixtures/seed-peers/seed-peer.json';
import seedPeerInactive from '../../fixtures/seed-peers/seed-peer-inactive.json';

describe('Seed peer', () => {
  beforeEach(() => {
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
    cy.visit('/clusters/1/seed-peers');

    cy.get('.MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

    cy.get('#card-hostname-seed-peer-10').should('have.text', 'seed-peer-10');
    cy.get('#card-hostname-seed-peer-10').click();

    // Then I see that the current page is the clusters/1/seed-peers/10!
    cy.url().should('include', '/clusters/1/seed-peers/10');
  });

  it('click the breadcrumb', () => {
    // Check for breadcrumb.
    cy.get('#seed-peer-cluster-id').should('be.visible').and('contain', 'seed-peer-cluster-1');

    cy.get('#seed-peer-cluster-id').click();

    // Then I see that the current page is the clusters/1!
    cy.url().should('include', '/clusters/1');
  });

  describe('when data is loaded', () => {
    it('can display breadcrumb', () => {
      // Show isloading.
      cy.get('[data-testid="isloading"]').should('be.exist');
      cy.get('#seed-peer-cluster-id').should('be.visible').and('contain', 'seed-peer-cluster-1');

      cy.get('#seed-peer-hostname').should('be.visible').and('contain', 'seed-peer-10');

      cy.get('[data-testid="isloading"]').should('not.exist');
    });

    it('can display active seed peer', () => {
      // Displays the seed peer ID.
      cy.get('#id').should('be.visible').and('contain', '10');

      // Displays the seed peer hostname.
      cy.get('#hostname').should('be.visible').and('contain', 'seed-peer-10');

      // Displays the seed peer IP.
      cy.get('#ip').should('be.visible').and('contain', '33.149.137.183');

      // Displays the seed peer cluster ID.
      cy.get('#cluster-id').should('be.visible').and('contain', '1');

      // Displays the seed peer port.
      cy.get('#port').should('be.visible').and('contain', '65006');

      // Displays the seed peer Download Port.
      cy.get('#download-port').should('be.visible').and('contain', '65002');

      // Displays the seed peer Object Storage Port.
      cy.get('#object-storage-port').should('be.visible').and('contain', '443');

      // Displays the seed peer Type.
      cy.get('#type').should('be.visible').and('contain', 'Supe');

      // Displays the seed peer Active background color.
      cy.get('#status')
        .should('be.visible')
        .and('contain', 'Active')
        .and('have.css', 'background-color', 'rgb(0, 129, 112)');

      // Displays the seed peer Created At.
      cy.get('#created-at').should('have.text', '2023-11-11 20:09:08');

      // Displays the seed peer Updated At.
      cy.get('#updated-at').should('have.text', '2023-11-11 20:09:13');
    });

    it('can display inactive seed peer', () => {
      cy.intercept({ method: 'GET', url: '/api/v1/seed-peers/11' }, (req) => {
        req.reply({
          statusCode: 200,
          body: seedPeerInactive,
        });
      });

      cy.visit('/clusters/1/seed-peers/11');

      // Displays the seed peer hostname.
      cy.get('#hostname').should('be.visible').and('contain', 'seed-peer-11');

      // Displays the seed peer Inactive background color.
      cy.get('#status')
        .should('be.visible')
        .and('contain', 'Inactive')
        .and('have.css', 'background-color', 'rgb(93, 95, 97)');
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
      cy.intercept({ method: 'GET', url: '/api/v1/seed-peers/9' }, (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      });
      cy.visit('/clusters/1/seed-peers/9');
    });

    it('unable to display breadcrumb', () => {
      cy.get('#seed-peer-cluster-id').should('be.visible').and('contain', 'seed-peer-cluster-1');

      cy.get('#seed-peer-hostname').should('be.visible').and('contain', '-');
    });

    it('seed peer should render empty status', () => {
      // Displays the seed peer ID.
      cy.get('#id').should('contain', '-');

      // Displays the seed peer hostname.
      cy.get('#hostname').should('contain', '-');

      // Displays the seed peer IP.
      cy.get('#ip').should('contain', '-');

      // Displays the seed peer cluster ID.
      cy.get('#cluster-id').should('contain', '-');

      // Displays the seed peer port.
      cy.get('#port').should('contain', '-');

      // Displays the seed peer Download Port.
      cy.get('#download-port').should('contain', '-');

      // Displays the seed peer Object Storage Port.
      cy.get('#object-storage-port').should('contain', '-');

      // Displays the seed peer Type.
      cy.get('#type').should('contain', '-');

      // Show Start.
      cy.get('#status').should('contain', '-');

      // Displays the seed peer Created At.
      cy.get('#created-at').should('contain', '-');

      // Displays the seed peer Updated At.
      cy.get('#updated-at').should('contain', '-');
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
      cy.get('#error-message').should('be.visible').and('contain', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('#error-message').should('not.exist');
    });

    it('unable to display breadcrumb', () => {
      cy.get('#seed-peer-cluster-id').should('be.visible').and('contain', 'seed-peer-cluster-1');

      cy.get('#seed-peer-hostname').should('be.visible').and('contain', '-');
    });

    it('seed peer should render empty status', () => {
      // Displays the seed peer ID.
      cy.get('#id').should('contain', '-');

      // Displays the seed peer hostname.
      cy.get('#hostname').should('contain', '-');

      // Displays the seed peer IP.
      cy.get('#ip').should('contain', '-');

      // Displays the seed peer cluster ID.
      cy.get('#cluster-id').should('contain', '-');

      // Displays the seed peer port.
      cy.get('#port').should('contain', '-');

      // Displays the seed peer Download Port.
      cy.get('#download-port').should('contain', '-');

      // Displays the seed peer Object Storage Port.
      cy.get('#object-storage-port').should('contain', '-');

      // Displays the seed peer Type.
      cy.get('#type').should('contain', '-');

      // Show Start.
      cy.get('#status').should('contain', '-');

      // Displays the seed peer Created At.
      cy.get('#created-at').should('contain', '-');

      // Displays the seed peer Updated At.
      cy.get('#updated-at').should('contain', '-');
    });
  });
});
