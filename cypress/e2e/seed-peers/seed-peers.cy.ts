import cluster from '../../fixtures/clusters/cluster/cluster.json';
import seedPeer from '../../fixtures/clusters/cluster/seed-peer.json';
import scheduler from '../../fixtures/clusters/cluster/scheduler.json';
import deleteSeedPeer from '../../fixtures/seed-peers/delete-seed-peer.json';
import seedPeerDeleteAfter from '../../fixtures/seed-peers/seed-peer-delete-after.json';
import searchSeedPeer from '../../fixtures/seed-peers/search-seed-peer.json';

describe('Seed peers', () => {
  beforeEach(() => {
    cy.signin();

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

    cy.visit('clusters/1');
    cy.viewport(1440, 1080);
  });

  describe('when data is loaded', () => {
    it('display the total number of seed peer and the active number', () => {
      cy.get('.css-1o0u1hg-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root')
        .should('be.visible')
        .and('contain', '8');

      cy.get('.css-1o0u1hg-MuiPaper-root > .MuiChip-root > .MuiChip-label')
        .should('be.visible')
        .and('contain', 'Total: 11');
    });

    it('can display seed peers table', () => {
      // Show hostname.
      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
      )
        .scrollIntoView()
        .should('be.visible')
        .and('contain', 'seed-peer-10');

      // Show ip.
      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(3) > .show_ipContainer__pzOmv',
      )
        .should('be.visible')
        .and('contain', '192.168.255.255');

      // Show port.
      cy.get(':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(4)')
        .should('be.visible')
        .and('contain', '65006');

      // Show download port.
      cy.get(':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(5)')
        .should('be.visible')
        .and('contain', '65002');

      // Show object storage port.
      cy.get(':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(6)')
        .should('be.visible')
        .and('contain', '443');

      // Show type.
      cy.get(':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(7)')
        .should('be.visible')
        .and('contain', 'Super');

      // Show state.
      cy.get(':nth-child(1) > :nth-child(8) > .MuiChip-root')
        .should('be.visible')
        .and('contain', 'Active')
        .and('have.css', 'background-color', 'rgb(46, 143, 121)');
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: [],
          });
        },
      );
    });

    it('display the total number of seed peer and the active number', () => {
      cy.get('.css-1o0u1hg-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root')
        .should('be.visible')
        .and('contain', '0');

      cy.get('.css-1o0u1hg-MuiPaper-root > .MuiChip-root > .MuiChip-label')
        .should('be.visible')
        .and('contain', 'Total: 0');
    });

    it('there should be a message indicating that there is no seed peer', () => {
      cy.get(
        ':nth-child(8) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > .MuiTableCell-root',
      )
        .scrollIntoView()
        .should('be.visible')
        .and('contain', `You don't have seed peer cluster.`);
    });
  });

  describe('should handle API error response', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );
    });

    it('show error message', () => {
      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });

    it('display the total number of seed peer and the active number', () => {
      cy.get('.css-1o0u1hg-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root')
        .should('be.visible')
        .and('contain', '0');

      cy.get('.css-1o0u1hg-MuiPaper-root > .MuiChip-root > .MuiChip-label')
        .should('be.visible')
        .and('contain', 'Total: 0');
    });

    it('there should be a message indicating that there is no seed peer', () => {
      cy.get(
        ':nth-child(8) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > .MuiTableCell-root',
      )
        .scrollIntoView()
        .should('be.visible')
        .and('contain', `You don't have seed peer cluster.`);
    });
  });

  describe('pagination', () => {
    it('pagination updates results and page number', () => {
      cy.get('#seed-peer-table').scrollIntoView().should('be.visible');

      // Check number of pagination.
      cy.get('#seed-peer-pagination > .MuiPagination-ul').children().should('have.length', 5);

      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');
    });

    it('when pagination changes, different page results are rendered', () => {
      cy.get('#seed-peer-pagination > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').scrollIntoView();

      // Go to next page.
      cy.get('#seed-peer-pagination > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').scrollIntoView().should('have.text', '2');

      // Show seed peer information.
      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(4) > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'seed-peer-11');

      cy.get(':nth-child(4) > :nth-child(8) > .MuiChip-root')
        .should('be.visible')
        .and('contain', 'Inactive')
        .and('have.css', 'background-color', 'rgb(28, 41, 58)');

      // Go to last page.
      cy.get('#seed-peer-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').scrollIntoView().should('have.text', '3');

      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'seed-peer-3');

      cy.get('#seed-peer-pagination > .MuiPagination-ul > :nth-child(1) > .MuiButtonBase-root').click();
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#seed-peer-pagination > .MuiPagination-ul > :nth-child(5) > .MuiButtonBase-root').click();
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');
    });

    it('when you click refresh, the paginated results and page numbers remain unchanged.', () => {
      // Go to last page.
      cy.get('#seed-peer-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      // show hostname.
      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'seed-peer-3');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(2000);
      });

      // Check if the page number has been reset.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').scrollIntoView().should('have.text', '3');

      cy.get('#seed-peer-table-body > :nth-child(1) > :nth-child(2) > .MuiTypography-root')
        .should('be.visible')
        .and('contain', 'seed-peer-3');
    });

    it('when returning to the previous page, pagination and results remain unchanged', () => {
      // Go to last page.
      cy.get('#seed-peer-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      // show hostname.
      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'seed-peer-3');

      // Go to show seedPeer page.
      cy.get('#seed-peer-table-body > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root').click();

      // Then I see that the current page is the show update personal-access-tokens.
      cy.url().should('include', '/clusters/1/seed-peers/3');

      // Go back to the last page。
      cy.go('back');

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      // show hostname.
      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
      )
        .scrollIntoView()
        .should('be.visible')
        .and('contain', 'seed-peer-3');
    });
  });

  describe('search', () => {
    it('should search seed peer hostname', () => {
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

      cy.get('#seed-peer-table-body').children().should('have.length', 5);

      cy.get(
        ':nth-child(9) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
      ).type('seed-peer-4{enter}');

      cy.get('#seed-peer-table-body').children().should('have.length', 1);

      // Pagination has been hidden.
      cy.get('#seed-peer-pagination > .MuiPagination-ul').should('not.exist');

      // Clear search box.
      cy.get('.MuiAutocomplete-endAdornment').click();

      // If the search is empty, all seed peers will be displayed
      cy.get('#seedPeer-button').click();

      // Check number of pagination.
      cy.get('#seed-peer-table-body').children().should('have.length', 5);
    });

    it('should search seed peer hostname and show no results', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?host_name=seed-peer-12&page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: [],
          });
        },
      );

      cy.get(
        ':nth-child(9) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
      ).type('seed-peer-12{enter}');

      // No seed peer.
      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > .MuiTableCell-root',
      )
        .should('be.visible')
        .and('contain', `You don't have seed peer cluster.`);

      // Pagination has been hidden.
      cy.get('#seed-peer-pagination > .MuiPagination-ul').should('not.exist');
    });

    it('should search seed peer hostname, show no results, and show error', () => {
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

      cy.get(
        ':nth-child(9) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
      ).type('seed-peer-3{enter}');

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch').should('be.visible');
    });
  });

  describe('delete', () => {
    it('when a seed peer is deleted, the seed peer is the only seed peer on the last page', () => {
      // Check the total number of seed peers.
      cy.get('.css-1o0u1hg-MuiPaper-root > .MuiChip-root > .MuiChip-label')
        .should('be.visible')
        .and('contain', 'Total: 11');

      // Go to last page.
      cy.get('#seed-peer-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'seed-peer-3');

      cy.get('#seed-peer-3').click();
      cy.get('#cancelDeleteSeedPeer').click();
      cy.get('.MuiDialogContent-root').should('not.exist');
      cy.get('#seed-peer-3').click();

      cy.intercept({ method: 'DELETE', url: '/api/v1/seed-peers/3' }, (req) => {
        req.reply({
          statusCode: 200,
        });
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deleteSeedPeer,
          });
        },
      );

      // Confirm delete.
      cy.get('#deleteSeedPeer').click();

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

      // The total number of seed peers will be reduced by one.
      cy.get('.css-1o0u1hg-MuiPaper-root > .MuiChip-root > .MuiChip-label')
        .scrollIntoView()
        .should('be.visible')
        .and('contain', 'Total: 10');

      // Check whether the current page is on the second page.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Check if the total number of pages is 4.
      cy.get('#seed-peer-pagination > .MuiPagination-ul').children().should('have.length', 4);

      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
      )
        .scrollIntoView()
        .should('be.visible')
        .and('contain', 'seed-peer-9');
    });

    it('when deleting a seed peer, there is only one seed peer on the next page', () => {
      cy.get('#seed-peer-pagination > .MuiPagination-ul').scrollIntoView();

      // Go to next page.
      cy.get('#seed-peer-pagination > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Check if the total number of pages is 5.
      cy.get('#seed-peer-pagination > .MuiPagination-ul').children().should('have.length', 5);

      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
      )
        .scrollIntoView()
        .should('be.visible')
        .and('contain', 'seed-peer-9');

      cy.get(':nth-child(5) > :nth-child(8) > .MuiChip-root > .MuiChip-label')
        .should('be.visible')
        .and('contain', 'Inactive');

      cy.get(':nth-child(5) > :nth-child(9) > .MuiButtonBase-root').click();

      cy.intercept({ method: 'DELETE', url: '/api/v1/seed-peers/9' }, (req) => {
        req.reply({
          statusCode: 200,
        });
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: seedPeerDeleteAfter,
          });
        },
      );

      cy.get('#deleteSeedPeer').click();

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

      // The total number of scheduler is 10.
      cy.get('.css-1o0u1hg-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('exist').and('contain', 'Total: 10');

      // Check if the total number of pages is 4.
      cy.get('#seed-peer-pagination > .MuiPagination-ul').scrollIntoView().children().should('have.length', 4);

      cy.get(
        ':nth-child(10) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'seed-peer-3');
    });

    it('try to delete seed peer using guest user', () => {
      cy.guestSignin();

      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
      )
        .scrollIntoView()
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
      );

      cy.get('#seed-peer-10').click();

      cy.get('#deleteSeedPeer').click();
      // show error message.
      cy.contains('.MuiAlert-message', 'permission deny');
    });

    it('should handle API error response', () => {
      cy.get(
        ':nth-child(9) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
      )
        .scrollIntoView()
        .should('be.visible')
        .and('contain', 'seed-peer-10');

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/seed-peers/10',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#seed-peer-10').click();

      cy.get('#deleteSeedPeer').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });
  });
});
