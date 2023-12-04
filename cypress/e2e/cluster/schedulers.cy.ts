import root from '../../fixtures/api/role-root.json';
import guest from '../../fixtures/api/role-guest.json';
import user from '../../fixtures/api/user.json';
import guestUser from '../../fixtures/api/guest-user.json';
import cluster from '../../fixtures/api/clusters/cluster/cluster.json';
import seedPeer from '../../fixtures/api/clusters/cluster/seed-peer.json';
import scheduler from '../../fixtures/api/clusters/cluster/scheduler.json';
import deleteScheduler from '../../fixtures/api/clusters/cluster/delete-scheduler.json';
import schedulerDeleteAfter from '../../fixtures/api/clusters/cluster/scheduler-delete-after.json';
import searchScheduler from '../../fixtures/api/clusters/cluster/search-scheduler.json';

describe('Schedulers', () => {
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
    cy.visit('clusters/1');
    cy.viewport(1440, 1080);
  });

  describe('when data is loaded', () => {
    it('display the total number of scheduler and the active number', () => {
      cy.get('.css-ms744u-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root')
        .should('be.visible')
        .and('contain', '4');

      cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label')
        .should('be.visible')
        .and('contain', 'Total: 11');
    });

    it('can display schedulers table', () => {
      // Show hostname.
      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'scheduler-7');

      // Show ip.
      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(3) > .show_ipContainer__pzOmv',
      )
        .should('be.visible')
        .and('contain', '30.44.98.202');

      // Show state.
      cy.get(':nth-child(1) > :nth-child(5) > .MuiChip-root')
        .should('be.visible')
        .and('contain', 'Active')
        .and('have.css', 'background-color', 'rgb(46, 143, 121)');

      // Show features.
      cy.get(':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(6)')
        .should('be.visible')
        .and('contain', 'Schedule')
        .and('contain', 'Preheat');

      // Show scheduler-5 information.
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
        .scrollIntoView()
        .should('be.visible')
        .and('contain', 'scheduler-10');

      cy.get(':nth-child(5) > :nth-child(5) > .MuiChip-root')
        .should('be.visible')
        .and('contain', 'Inactive')
        .and('have.css', 'background-color', 'rgb(28, 41, 58)');
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
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
    });

    it('display the total number of scheduler and the active number', () => {
      cy.get('.css-ms744u-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root')
        .should('be.visible')
        .and('contain', '0');

      cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label')
        .should('be.visible')
        .and('contain', 'Total: 0');
    });

    it('there should be a message indicating that there is no scheduler', () => {
      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > .MuiTableCell-root',
      )
        .should('be.visible')
        .and('contain', `You don't have scheduler cluster.`);
    });
  });

  describe('should handle API error response', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
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

    it('display the total number of scheduler and the active number', () => {
      cy.get('.css-ms744u-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root')
        .should('be.visible')
        .and('contain', '0');

      cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label')
        .should('be.visible')
        .and('contain', 'Total: 0');
    });

    it('there should be a message indicating that there is no scheduler', () => {
      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > .MuiTableCell-root',
      )
        .should('be.visible')
        .and('contain', `You don't have scheduler cluster.`);
    });
  });

  describe('pagination', () => {
    it('pagination updates results and page number', () => {
      cy.get('#scheduler-table').should('be.visible');

      // Check number of pagination.
      cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 5);

      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');
    });

    it('when pagination changes, different page results are rendered', () => {
      cy.get('#scheduler-table > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'scheduler-7');

      // Go to next page.
      cy.get(':nth-child(7) > .MuiPagination-root > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableHead-root > .MuiTableRow-root > :nth-child(2)',
      ).scrollIntoView();

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Show scheduler information.
      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'scheduler-11');

      cy.get(':nth-child(1) > :nth-child(5) > .MuiChip-root')
        .and('contain', 'Inactive')
        .and('have.css', 'background-color', 'rgb(28, 41, 58)');

      // Go to last page.
      cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'scheduler-2');
    });

    it('pagination resets results and page number to first page when refresh is clicked', () => {
      // Go to last page.
      cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'scheduler-2');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(2000);
      });

      // Check if the page number has been reset.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');

      cy.get('#scheduler-table > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'scheduler-7');
    });
  });

  describe('search', () => {
    it('should search scheduler hostname', () => {
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

      cy.get('#scheduler-table-body').children().should('have.length', 5);

      cy.get(
        ':nth-child(6) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
      ).type('scheduler-8{enter}');

      cy.get('#scheduler-table-body').children().should('have.length', 1);

      // Pagination has been hidden.
      cy.get('#scheduler-pagination > .MuiPagination-ul').should('not.exist');

      // Clear search box.
      cy.get(
        ':nth-child(6) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
      ).clear();

      // If the search is empty, all schedulers will be displayed.
      cy.get('#scheduler-button').click();

      // Check number of pagination.
      cy.get('#scheduler-table-body').children().should('have.length', 5);
    });

    it('should search scheduler hostname and show no results', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?host_name=scheduler-12&page=1&per_page=10000000&scheduler_cluster_id=1',
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
      ).type('scheduler-12{enter}');

      // No scheduler.
      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > .MuiTableCell-root',
      )
        .should('be.visible')
        .and('contain', `You don't have scheduler cluster.`);

      // Pagination has been hidden.
      cy.get('#scheduler-pagination > .MuiPagination-ul').should('not.exist');
    });

    it('should search scheduler hostname, show no results, and show error', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?host_name=scheduler-12&page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get(
        ':nth-child(6) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
      ).type('scheduler-12{enter}');

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });
  });

  describe('delete', () => {
    it('when a scheduler is removed, this scheduler is the only scheduler on the last page.', () => {
      // Check the total number of schedulers.
      cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('exist').and('contain', 'Total: 11');

      // Go to last page.
      cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 5);

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
      ).as('delete');
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deleteScheduler,
          });
        },
      );

      cy.get('#scheduler-2').click();
      cy.get('#cancelDeleteScheduler').click();
      cy.get('#scheduler-2').click();

      // Confirm delete.
      cy.get('#deleteScheduler').click();
      cy.wait('@delete');

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

      // The total number of schedulers will be reduced by one.
      cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('exist').and('contain', 'Total: 10');

      // Check whether the current page is on the second page.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Check if the total number of pages is 4.
      cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 4);
    });

    it('when deleting a scheduler, there is only one scheduler on the next page', () => {
      // Go to next page.
      cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'scheduler-4');
      cy.get('#scheduler-4').click();

      // Check if the total number of pages is 5.
      cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 5);

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
      ).as('delete');
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: schedulerDeleteAfter,
          });
        },
      );

      cy.get('#deleteScheduler').click();
      cy.wait('@delete');

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

      // The total number of scheduler is 10.
      cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('exist').and('contain', 'Total: 10');

      // Check if the total number of pages is 4.
      cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 4);

      cy.get(
        ':nth-child(7) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(5) > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'scheduler-2');
    });

    it('try to delete scheduler using guest user', () => {
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
          method: 'DELETE',
          url: '/api/v1/schedulers/7',
        },
        (req) => {
          req.reply({
            statusCode: 401,
            body: { message: 'permission deny' },
          });
        },
      ).as('delete');

      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'scheduler-7');

      cy.get('#scheduler-7').click();
      cy.get('#deleteScheduler').click();
      cy.wait('@delete');

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'permission deny');
    });

    it('should handle API error response', () => {
      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/schedulers/7',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      ).as('delete');

      cy.get(
        ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
      )
        .should('be.visible')
        .and('contain', 'scheduler-7');

      cy.get('#scheduler-7').click();

      cy.get('#deleteScheduler').click();
      cy.wait('@delete');

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });
  });
});
