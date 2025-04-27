import clusters from '../../fixtures/clusters/clusters.json';
import seedPeers from '../../fixtures/seed-peers/seed-peers.json';
import schedulers from '../../fixtures/schedulers/schedulers.json';

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

    cy.visit('/clusters');
    cy.viewport(1440, 1480);
  });

  describe('when data is loaded', () => {
    it('display the total number of clusters and the default number', () => {
      // Click the create cluster button.
      cy.get('#create-cluster').click();

      // Then I see that the current page is the create cluster!
      cy.url().should('include', '/clusters/new');

      cy.get('#cancel').click();

      // Then I see that the current page is the clusters!
      cy.url().should('include', '/clusters');
      cy.get('[data-testid="isloading"]').should('be.exist');

      // Check total clusters.
      cy.get('#total-clusters').should('be.visible').and('contain', '37');

      // Check total default clusters.
      cy.get('#default-clusters').should('be.visible').and('contain', '13');

      cy.get('[data-testid="isloading"]').should('not.exist');
    });

    it('display the total number of schedulers and the active number', () => {
      cy.get('#total-schedulers').should('be.visible').and('contain', '12');

      cy.get('#active-schedulers').should('be.visible').and('contain', '4');
    });

    it('display the total number of seed peers and the active number', () => {
      cy.get('#total-seed-peer').should('be.visible').and('contain', '12');

      cy.get('#active-seed-peer').should('be.visible').and('contain', '8');
    });

    it('can display clusters card', () => {
      // Display the card component.
      cy.get('#clusters').should('exist');

      // Show Default background color.
      cy.get('#default-cluster-1')
        .should('be.visible')
        .and('contain', 'Default')
        .and('have.css', 'background-color', 'rgb(0, 129, 112)');

      // Show cluster name.
      cy.get('#cluster-name-1').should('be.visible').and('contain', 'cluster-1');

      // Show cluster description.
      cy.get('#cluster-description-1')
        .should('be.visible')
        .and(
          'contain',
          'Cluster-1 is a high-performance computing cluster located in China, specifically in Hangzhou and Beijing data centers.',
        );

      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Show Non-Default cluster.
      cy.get('#cluster-name-2').should('be.visible').and('contain', 'cluster-2');

      // Show Non-Default background color.
      cy.get('#default-cluster-2')
        .should('be.visible')
        .and('contain', 'Non-Default')
        .and('have.css', 'background-color', 'rgb(93, 95, 97)');
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
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
      cy.get('#total-clusters').should('be.visible').and('contain', '0');

      cy.get('#default-clusters').should('be.visible').and('contain', '0');
    });

    it('display the total number of schedulers and the active number', () => {
      cy.get('#total-schedulers').should('be.visible').and('contain', '0');

      cy.get('#default-clusters').should('be.visible').and('contain', '0');
    });

    it('display the total number of seed peers and the active number', () => {
      cy.get('#total-seed-peer').should('be.visible').and('contain', '0');

      cy.get('#active-seed-peer').should('be.visible').and('contain', '0');
    });

    it('cluster card should present an empty status', () => {
      cy.get('#clusters').should('not.exist');

      // Shouldn't render pagination buttons.
      cy.get('#clusterPagination > .MuiPagination-ul').should('not.exist');
    });
  });

  describe('pagination', () => {
    it('pagination updates results and page number', () => {
      // Check number of pagination.
      cy.get('#clusterPagination > .MuiPagination-ul').children().should('have.length', 7);

      // Show cluster name.
      cy.get('#cluster-name-1').should('be.visible').and('contain', 'cluster-1');
    });

    it('when pagination changes, different page results are rendered', () => {
      // Go to last page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Display last page cluster information.
      cy.get('#cluster-id-8').should('be.visible').and('contain', '8');

      // Display cluster information.
      cy.get('#default-cluster-8')
        .should('be.visible')
        .and('contain', 'Non-Default')
        .and('have.css', 'background-color', 'rgb(93, 95, 97)');

      cy.get('#cluster-name-8').should('be.visible').and('contain', 'cluster-8');

      cy.get('#cluster-description-8')
        .should('be.visible')
        .and(
          'contain',
          'Cluster-8 is a high-performance computing cluster located in China, specifically in Jiangsu data centers.',
        );

      // Check the current page number.
      cy.get('#clusterPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
    });

    it('when you click refresh, the paginated results and page numbers remain unchanged.', () => {
      // Go to last page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('#cluster-name-8').should('be.visible').and('contain', 'cluster-8');

      // Check the current page number.
      cy.get('#clusterPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(2000);
      });

      // Check if the page number has been reset.
      cy.get('#clusterPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#cluster-name-8').should('be.visible').and('contain', 'cluster-8');
    });

    it('when returning to the previous page, pagination and results remain unchanged', () => {
      // Go to the next page.
      cy.get(':nth-child(7) > .MuiButtonBase-root').click();

      // Check if the page number has been reset.
      cy.get('#clusterPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#cluster-name-23').should('have.text', 'cluster-23');

      // Go to the next page.
      cy.get(':nth-child(7) > .MuiButtonBase-root').click();

      cy.get('#clusterPagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');
      cy.get('#cluster-name-13').should('have.text', 'cluster-13');
      cy.get('#cluster-name-23').should('not.exist');

      // Go to the next page.
      cy.get(':nth-child(7) > .MuiButtonBase-root').click();

      cy.get('#clusterPagination > .MuiPagination-ul .Mui-selected').should('have.text', '4');
      cy.get('#cluster-name-25').should('have.text', 'cluster-25');
      cy.get('#cluster-name-13').should('not.exist');

      // Go to the last page.
      cy.get(':nth-child(7) > .MuiButtonBase-root').click();

      cy.get('#clusterPagination > .MuiPagination-ul .Mui-selected').should('have.text', '5');

      cy.get('#clustersCard').children().should('have.length', 1);

      cy.get('#cluster-name-37').should('have.text', 'cluster-37');

      // Go to 2 page.
      cy.get('.MuiPagination-ul > :nth-child(3)').click();

      cy.get('#cluster-name-8').should('be.visible').and('contain', 'cluster-8');

      // Go to show cluster page.
      cy.get('#show-cluster-8').click();

      // Then I see that the current page is the show cluster.
      cy.url().should('include', '/clusters/8');

      // Go back to the last page。
      cy.go('back');

      // Check the current page number.
      cy.get('#clusterPagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#cluster-name-8').should('be.visible').and('contain', 'cluster-8');
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
      // Show error message.
      cy.get('#error-message').should('be.visible').and('contain', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('#error-message').should('not.exist');
    });

    it('display the total number of clusters and the default number', () => {
      cy.get('#total-clusters').should('be.visible').and('contain', '0');

      cy.get('#clusterPagination > .MuiPagination-ul').should('not.exist');
      cy.get('#default-clusters').should('be.visible').and('contain', '0');
    });

    it('display the total number of schedulers and the active number', () => {
      cy.get('#total-schedulers').should('be.visible').and('contain', '0');

      cy.get('#default-clusters').should('be.visible').and('contain', '0');
    });

    it('display the total number of seed peers and the active number', () => {
      cy.get('#total-seed-peer').should('be.visible').and('contain', '0');

      cy.get('#active-seed-peer').should('be.visible').and('contain', '0');
    });

    it('cluster card should present an empty status', () => {
      // No clusters.
      cy.get('#clusters').should('not.exist');

      // No pagination.
      cy.get('#clusterPagination > .MuiPagination-ul').should('not.exist');
    });
  });

  describe('search', () => {
    it('should search cluster name', () => {
      cy.get('#search-wrapper').type('cluster-10');

      // Then I see that the current page is the /clusters/1?search=cluster-10!
      cy.url().should('include', '/clusters?search=cluster-10');
      cy.get('#clusterPagination > .MuiPagination-ul').should('not.exist');
      cy.get('#clustersCard').should('exist').children().should('have.length', 1);
      cy.get('#cluster-name-10').should('have.text', 'cluster-10');

      // Clear search box.
      cy.get('#search-wrapper').clear();

      // If the search is empty, all clusters will be displayed.
      cy.get('#search-wrapper').type('{enter}');
      cy.get('#clusterPagination > .MuiPagination-ul').should('exist');

      // Check number of pagination.
      cy.get('#clusterPagination > .MuiPagination-ul').children().should('have.length', 7);
      cy.get('#cluster-name-1').should('be.visible').and('contain', 'cluster-1');
      cy.get('#cluster-name-22').should('be.visible').and('contain', 'cluster-22');
    });

    it('should search cluster name and show no results', () => {
      cy.get('#search-wrapper').type('cluster-47');

      // No clusters card.
      cy.get('#clustersCard').should('not.exist');

      // Pagination has been hidden.
      cy.get('#clusterPagination > .MuiPagination-ul').should('not.exist');

      cy.get('#no-clusters').should('be.visible');

      cy.get('#no-results').should('contain', '"cluster-47"');
    });

    it('should be queried based on the query string', () => {
      cy.visit('/clusters/?search=cluster-2');

      // The content of the input box is displayed as cluster-2.
      cy.get('#search-wrapper').should('have.value', 'cluster-2');

      cy.get('#clustersCard').should('exist').children().should('have.length', 9);
    });

    it('should search for cluster name and switch paging', () => {
      cy.get('#search-wrapper').type('cluster');

      // Go to 2 page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('#clustersCard').should('exist').children().should('have.length', 9);

      // Check the URL.
      cy.url().should('include', '/clusters?search=cluster&page=2');

      // Go to last page.
      cy.get('.MuiPagination-ul > :nth-child(6) > .MuiButtonBase-root').click();

      cy.get('#clustersCard').should('exist').children().should('have.length', 1);

      // Check the URL.
      cy.url().should('include', '/clusters?search=cluster&page=5');

      // Go to the first page.
      cy.get('.MuiPagination-ul > :nth-child(2) > .MuiButtonBase-root').click();

      // Check the URL.
      cy.url().should('include', '/clusters?search=cluster');

      // Go to 2 page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('#search-wrapper').type('-2');

      // Check number of pagination.
      cy.get('#clusterPagination > .MuiPagination-ul').children().should('have.length', 4);

      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Check the URL.
      cy.url().should('include', '/clusters?search=cluster-2&page=2');
    });
  });

  it('call onChange when changing page size', () => {
    // The viewport will now be changed to 1440px x 1080px
    cy.viewport(1440, 1080);

    // Check if the number of page size is 9.
    cy.get('#clustersCard').should('exist').children().should('have.length', 9);

    // The viewport will now be changed to 1600px x 1080px
    cy.viewport(1600, 1080);
    cy.wait(1000);

    // Check if the number of page size is 9.
    cy.get('#clustersCard').should('exist').children().should('have.length', 9);

    // The viewport will now be changed to 1920px x 1080px
    cy.viewport(1920, 1080);
    cy.wait(1000);

    // Check if the number of page size is 12.
    cy.get('#clustersCard').should('exist').children().should('have.length', 12);

    // The viewport will now be changed to 2048px x 1080px
    cy.viewport(2048, 1080);
    cy.wait(1000);

    // Check if the number of page size is 12.
    cy.get('#clustersCard').should('exist').children().should('have.length', 12);

    // The viewport will now be changed to 2560px x 1080px
    cy.viewport(2560, 1080);
    cy.wait(1000);

    // Check if the number of page size is 15.
    cy.get('#clustersCard').should('exist').children().should('have.length', 15);
  });
});
