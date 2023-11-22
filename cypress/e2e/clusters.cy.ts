import clusters from '../fixtures/api/clusters/clusters.json';
import root from '../fixtures/api/role-root.json';
import user from '../fixtures/api/user.json';
import seedPeers from '../fixtures/api/clusters/seed-peers.json';
import schedulers from '../fixtures/api/clusters/schedulers.json';
import clusterSearchResults from '../fixtures/api/clusters/cluster-search-results.json';

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

  describe('when data is loaded', () => {
    it('display the total number of clusters and the default number', () => {
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
    });

    it('display the total number of schedulers and the active number', () => {
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
    });

    it('display the total number of seed peers and the active number', () => {
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

    it('can display clusters card', () => {
      // displays a card componen
      cy.get('.MuiBackdrop-root > .MuiBox-root').should('exist');

      // display Default background color
      cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > #isDefault')
        .should('be.visible')
        .and('contain', 'Default')
        .and('have.css', 'background-color', 'rgb(46, 143, 121)');

      // display cluster name
      cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
        .should('be.visible')
        .and('contain', 'cluster-1');

      // display cluster description
      cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .css-m4gmz7 > .MuiTypography-root')
        .should('be.visible')
        .and(
          'contain',
          'Cluster-1 is a high-performance computing cluster located in China, specifically in Hangzhou and Beijing data centers.',
        );

      // display Non-Default cluster
      cy.get(':nth-child(8) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
        .should('be.visible')
        .and('contain', 'cluster-2');

      // display Non-Default background color
      cy.get(':nth-child(8) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > #isDefault')
        .should('be.visible')
        .and('contain', 'Non-Default')
        .and('have.css', 'background-color', 'rgb(28, 41, 58)');
    });
  });

  describe('when no data is loaded', () => {
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
            body: null,
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
            body: [],
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
            body: [],
          });
        },
      );

      cy.visit('/clusters');
    });

    it('display the total number of clusters and the default number', () => {
      cy.get(
        ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', '0');

      cy.get(
        ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
      )
        .should('be.visible')
        .and('contain', '0');
    });

    it('display the total number of schedulers and the active number', () => {
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
    });

    it('display the total number of seed peers and the active number', () => {
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

    it('cluster card should present an empty status', () => {
      cy.get('#clusters').should('not.exist');
      // shouldn't render pagination buttons
      cy.get('#clusterPagination > .MuiPagination-ul').should('not.exist');
    });
  });

  describe('pagination', () => {
    it('pagination updates results and page number', () => {
      cy.get('.Mui-selected').invoke('text').should('eq', 'Cluster1');

      //total number of pages
      cy.get('#clusterPagination > .MuiPagination-ul').children().should('have.length', 4);

      // show cluster name
      cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
        .should('be.visible')
        .and('contain', 'cluster-1');
    });

    it('when pagination changes, different page results are rendered', () => {
      cy.get('.Mui-selected').invoke('text').should('eq', 'Cluster1');

      // go to last page
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // display last page cluster information
      cy.get('.clusters_clusterListContent__UwWjF > .css-k008qs').should('be.visible').and('contain', '8');

      // display cluster information
      cy.get('#isDefault')
        .should('be.visible')
        .and('contain', 'Non-Default')
        .and('have.css', 'background-color', 'rgb(28, 41, 58)');

      cy.get('.clusters_clusterListContent__UwWjF > .MuiTypography-h6')
        .should('be.visible')
        .and('contain', 'cluster-8');

      cy.get('.css-m4gmz7 > .MuiTypography-root')
        .should('be.visible')
        .and(
          'contain',
          'Cluster-8 is a high-performance computing cluster located in China, specifically in Jiangsu data centers.',
        );

      // current page number
      cy.get('#clusterPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
    });

    it('pagination resets results and page number to first page when refresh is clicked', () => {
      // Go to last page
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('.clusters_clusterListContent__UwWjF > .MuiTypography-h6')
        .should('be.visible')
        .and('contain', 'cluster-8');

      cy.get('#clusterPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
      // refresh page
      cy.reload().then(() => {
        cy.wait(2000);
      });

      // page numbers have been reset
      cy.get('#clusterPagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');

      cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
        .should('be.visible')
        .and('contain', 'cluster-1');
    });
  });

  describe('should handle API error response', () => {
    beforeEach(() => {
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
      cy.intercept({ method: 'GET', url: '/api/v1/seed-peers?page=1&per_page=10000000' }, (req) => {
        req.reply({
          forceNetworkError: true,
        });
      });
      cy.intercept({ method: 'GET', url: '/api/v1/schedulers?page=1&per_page=10000000' }, (req) => {
        req.reply({
          forceNetworkError: true,
        });
      });

      cy.visit('/clusters');
    });

    it('show error message', () => {
      // show error message
      cy.get('.css-1rr4qq7 > .MuiSnackbar-root > .MuiPaper-root > .MuiAlert-message')
        .should('be.visible')
        .and('contain', 'Failed to fetch');

      // close error message
      cy.get('.css-1rr4qq7 > .MuiSnackbar-root > .MuiPaper-root > .MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.css-1rr4qq7 > .MuiSnackbar-root > .MuiPaper-root > .MuiAlert-message').should('not.exist');
    });

    it('display the total number of clusters and the default number', () => {
      cy.get(
        ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .css-70qvj9 > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', '0');

      cy.get('#clusterPagination > .MuiPagination-ul').should('not.exist');
      cy.get(
        ':nth-child(1) > .css-q5fqw0 > .clusters_clusterContentContainer__ZxKuh > .css-zm3ms > .MuiGrid-root > .clusters_clusterBottomContentContainer__KII0M > .clusters_clusterBottomContent__k3P4u',
      )
        .should('be.visible')
        .and('contain', '0');
    });

    it('display the total number of schedulers and the active number', () => {
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
    });

    it('display the total number of seed peers and the active number', () => {
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

    it('cluster card should present an empty status', () => {
      // no clusters
      cy.get('#clusters').should('not.exist');
      // no pagination
      cy.get('#clusterPagination > .MuiPagination-ul').should('not.exist');
    });
  });

  describe('search', () => {
    it('should search cluster name', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters?name=cluster-1&page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: clusterSearchResults,
          });
        },
      );
      cy.get('#free-solo-demo').type('cluster-1{enter}');
      cy.get('#clusterPagination > .MuiPagination-ul').should('not.exist');

      // clear search box
      cy.get('#free-solo-demo').clear();
      //search all clusters
      cy.get('#free-solo-demo').type('{enter}');
      cy.get('#clusterPagination > .MuiPagination-ul').should('exist');

      // number of pagination
      cy.get('#clusterPagination > .MuiPagination-ul').children().should('have.length', 4);

      cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
        .should('be.visible')
        .and('contain', 'cluster-1');

      cy.get(':nth-child(8) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
        .should('be.visible')
        .and('contain', 'cluster-2');
    });

    it('should search cluster name and show no results', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters?name=cluster-16&page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: null,
          });
        },
      );

      cy.get('#free-solo-demo').type('cluster-16{enter}');
      //no clusters card
      cy.get('#clusters').should('not.exist');
      // hidden pagination
      cy.get('#clusterPagination > .MuiPagination-ul').should('not.exist');
    });

    it('should search cluster name , show no results, and show error', () => {
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
      // error message
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    });
  });
});
