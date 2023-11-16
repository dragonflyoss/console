import clusters from '../fixtures/api/clusters/clusters.json';
import root from '../fixtures/api/role-root.json';
import user from '../fixtures/api/user.json';
import seedPeers from '../fixtures/api/clusters/seed-peers.json';
import schedulers from '../fixtures/api/clusters/schedulers.json';
import searchCluster from '../fixtures/api/clusters/search-cluster.json';

describe('Clusters', () => {
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

    cy.visit('/clusters');
    cy.viewport(1440, 1080);
  });

  it('Quantity statistics panel', () => {
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

    cy.get(
      ':nth-child(2) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '12');

    cy.get(
      ':nth-child(2) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
    )
      .should('be.visible')
      .and('contain', '4');

    cy.get(
      '.clusters_seedPeerContainer__u4Xst > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '12');
    cy.get(
      '.clusters_seedPeerContainer__u4Xst > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
    )
      .should('be.visible')
      .and('contain', '8');
  });

  it('Clusters card', () => {
    cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .css-qg3jsa > .MuiTypography-root')
      .should('be.visible')
      .and('contain', 'Default');
    cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-1');
    cy.get(
      ':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .clusters_creatTimeContainer__k6XfL > .MuiChip-root > .MuiChip-label',
    )
      .should('be.visible')
      .and('contain', '2023-10-31-15:48');

    cy.get(':nth-child(8) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-2');

    cy.get(':nth-child(8) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .css-1625a13 > .MuiTypography-root')
      .should('be.visible')
      .and('contain', 'Non-Default');
  });

  it('Toggle pagination', () => {
    cy.get('.Mui-selected').invoke('text').should('eq', 'Cluster1');
    cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
    cy.get('.clusters_clusterListContent__UwWjF > .MuiTypography-h6').should('be.visible').and('contain', 'cluster-8');
    cy.get('.MuiPaginationItem-root.Mui-selected').invoke('text').should('eq', '2');
    cy.get('.MuiPagination-ul > :nth-child(2) > .MuiButtonBase-root').click();
    cy.get('.MuiPaginationItem-root.Mui-selected').invoke('text').should('eq', '1');
    cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-1');
  });

  it('If the data is empty', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: null,
        });
      },
    ).as('clusters');
    cy.intercept('GET', '/api/v1/seed-peers?page=1&per_page=10000000', (req) => {
      req.reply({
        statusCode: 200,
        body: [],
      });
    }).as('seedPeers');
    cy.intercept('GET', '/api/v1/schedulers?page=1&per_page=10000000', (req) => {
      req.reply({
        statusCode: 200,
        body: [],
      });
    }).as('schedulers');

    cy.visit('/clusters');
    cy.wait(['@clusters', '@seedPeers', '@schedulers']);

    cy.get(
      ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '0');
    cy.get('.MuiGrid-item').should('exist').should('be.empty');
    cy.get('.css-iusmz7').should('not.exist');
    cy.get(
      ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
    )
      .should('be.visible')
      .and('contain', '0');
    cy.get(
      ':nth-child(2) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '0');
    cy.get(
      ':nth-child(2) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
    )
      .should('be.visible')
      .and('contain', '0');
    cy.get(
      '.clusters_seedPeerContainer__u4Xst > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '0');
    cy.get(
      '.clusters_seedPeerContainer__u4Xst > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
    )
      .should('be.visible')
      .and('contain', '0');
  });

  it('Interface error', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          forceNetworkError: true,
        });
      },
    );
    cy.intercept('GET', '/api/v1/seed-peers?page=1&per_page=10000000', (req) => {
      req.reply({
        forceNetworkError: true,
      });
    });
    cy.intercept('GET', '/api/v1/schedulers?page=1&per_page=10000000', (req) => {
      req.reply({
        forceNetworkError: true,
      });
    });
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/1',
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
        url: '/api/v1/users/1/roles',
      },
      (req) => {
        req.reply({
          forceNetworkError: true,
        });
      },
    );

    cy.visit('/clusters');

    cy.get('.MuiSnackbar-root > .MuiPaper-root').should('exist');
    cy.get('.css-1rr4qq7 > .MuiSnackbar-root > .MuiPaper-root > .MuiAlert-message')
      .should('be.visible')
      .and('contain', 'Failed to fetch');
    cy.get('.css-1rr4qq7 > .MuiSnackbar-root > .MuiPaper-root > .MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.css-1rr4qq7 > .MuiSnackbar-root > .MuiPaper-root > .MuiAlert-message').should('not.exist');
    cy.get('.MuiList-root').should('exist').should('not.have.descendants');
    cy.get(
      ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '0');
    cy.get('.MuiGrid-item').should('exist').should('be.empty');
    cy.get('.css-iusmz7').should('not.exist');
    cy.get(
      ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
    )
      .should('be.visible')
      .and('contain', '0');
    cy.get(
      ':nth-child(2) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '0');
    cy.get(
      ':nth-child(2) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
    )
      .should('be.visible')
      .and('contain', '0');
    cy.get(
      '.clusters_seedPeerContainer__u4Xst > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '0');
    cy.get(
      '.clusters_seedPeerContainer__u4Xst > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
    )
      .should('be.visible')
      .and('contain', '0');
  });

  it('Search cluster', () => {
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

    cy.get('#free-solo-demo').type('cluster-1{enter}');

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters?name=cluster-22&page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: null,
        });
      },
    );

    cy.get('#free-solo-demo').clear();
    cy.get('#free-solo-demo').type('cluster-22{enter}');
    cy.get('.MuiGrid-item').should('exist').should('be.empty');
    cy.get('.css-iusmz7').should('not.exist');
    cy.get('#free-solo-demo').clear();
    cy.get('#free-solo-demo').type('{enter}');
    cy.get('.css-iusmz7').should('exist');
    cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-1');
    cy.get(':nth-child(8) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-2');

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters?name=cluster-1&page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          forceNetworkError: true,
        });
      },
    );

    cy.get('#free-solo-demo').clear();
    cy.get('#free-solo-demo').type('cluster-1{enter}');
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
  });
});
