import cluster from '../../fixtures/clusters/cluster/cluster.json';
import seedPeer from '../../fixtures/clusters/cluster/seed-peer.json';
import scheduler from '../../fixtures/clusters/cluster/scheduler.json';
import deleteScheduler from '../../fixtures/schedulers/delete-scheduler.json';
import updateSchedulerFeature from '../../fixtures/schedulers/update-scheduler-feature.json';
import schedulerDeleteAfter from '../../fixtures/schedulers/scheduler-delete-after.json';
import deletedInactiveScheduler from '../../fixtures/clusters/cluster/deleted-inactive-scheduler.json';
import deletedInactiveSeedPeer from '../../fixtures/clusters/cluster/deleted-inactive-seed-peer.json';
import schedulerActive from '../../fixtures/schedulers/scheduler-active.json';
import seedPeerActive from '../../fixtures/seed-peers/seed-peer-active.json';

describe('Schedulers', () => {
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
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/scheduler-features',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: ['schedule', 'preheat'],
        });
      },
    );

    cy.signin();
    cy.visit('clusters/1');
    cy.viewport(1440, 2080);
  });

  // describe('when data is loaded', () => {
  //   it('display the total number of scheduler and the active number', () => {
  //     cy.get('.css-ms744u-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root')
  //       .should('be.visible')
  //       .and('contain', '4');

  //     cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label')
  //       .should('be.visible')
  //       .and('contain', 'Total: 11');
  //   });

  //   it('can display schedulers table', () => {
  //     // Show hostname.
  //     cy.get('#scheduler-table-body > :nth-child(1) > :nth-child(2) > .MuiTypography-root')
  //       .should('be.visible')
  //       .and('contain', 'scheduler-7');

  //     // Show ip.
  //     cy.get('#scheduler-table-body > :nth-child(1) > :nth-child(3) > .show_ipContainer__pzOmv')
  //       .should('be.visible')
  //       .and('contain', '30.44.98.202');

  //     // Show state.
  //     cy.get(':nth-child(1) > :nth-child(5) > .MuiChip-root')
  //       .should('be.visible')
  //       .and('contain', 'Active')
  //       .and('have.css', 'background-color', 'rgb(46, 143, 121)');

  //     // Show features.
  //     cy.get('#scheduler-table-body > :nth-child(1) > :nth-child(6)').should('be.visible').and('contain', 'Schedule');

  //     // Show scheduler-5 information.
  //     cy.get('#scheduler-table-body > :nth-child(2) > :nth-child(2) > .MuiTypography-root')
  //       .scrollIntoView()
  //       .should('be.visible')
  //       .and('contain', 'scheduler-5');

  //     cy.get('#scheduler-table-body > :nth-child(2) > :nth-child(3)')
  //       .should('be.visible')
  //       .and('contain', '20.14.28.202');

  //     cy.get('#scheduler-table-body > :nth-child(5) > :nth-child(2)')
  //       .scrollIntoView()
  //       .should('be.visible')
  //       .and('contain', 'scheduler-10');

  //     cy.get(':nth-child(5) > :nth-child(5) > .MuiChip-root')
  //       .should('be.visible')
  //       .and('contain', 'Inactive')
  //       .and('have.css', 'background-color', 'rgb(28, 41, 58)');
  //   });
  // });

  // describe('when no data is loaded', () => {
  //   beforeEach(() => {
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           body: [],
  //         });
  //       },
  //     );
  //   });

  //   it('display the total number of scheduler and the active number', () => {
  //     cy.get('.css-ms744u-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root')
  //       .should('be.visible')
  //       .and('contain', '0');

  //     cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label')
  //       .should('be.visible')
  //       .and('contain', 'Total: 0');
  //   });

  //   it('there should be a message indicating that there is no scheduler', () => {
  //     cy.get('#scheduler-table-body > .MuiTableRow-root > .MuiTableCell-root')
  //       .should('be.visible')
  //       .and('contain', `You don't have scheduler cluster.`);
  //   });
  // });

  // describe('should handle API error response', () => {
  //   beforeEach(() => {
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           forceNetworkError: true,
  //         });
  //       },
  //     );
  //   });

  //   it('show error message', () => {
  //     // Show error message.
  //     cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
  //   });

  //   it('display the total number of scheduler and the active number', () => {
  //     cy.get('.css-ms744u-MuiPaper-root > .css-1m2ggra > .css-1vkqvkd > .MuiBox-root > .MuiTypography-root')
  //       .should('be.visible')
  //       .and('contain', '0');

  //     cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label')
  //       .should('be.visible')
  //       .and('contain', 'Total: 0');
  //   });

  //   it('there should be a message indicating that there is no scheduler', () => {
  //     cy.get('#scheduler-table-body > .MuiTableRow-root > .MuiTableCell-root')
  //       .should('be.visible')
  //       .and('contain', `You don't have scheduler cluster.`);
  //   });
  // });

  // describe('pagination', () => {
  //   it('pagination updates results and page number', () => {
  //     cy.get('#scheduler-table').should('be.visible');

  //     // Check number of pagination.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 5);

  //     cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');
  //   });

  //   it('when pagination changes, different page results are rendered', () => {
  //     cy.get('#scheduler-table > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root')
  //       .should('be.visible')
  //       .and('have.text', 'scheduler-7');

  //     // Go to next page.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

  //     // Check the current page number.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

  //     // Show scheduler information.
  //     cy.get('#scheduler-table > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root')
  //       .should('be.visible')
  //       .and('contain', 'scheduler-11');

  //     cy.get(':nth-child(1) > :nth-child(5) > .MuiChip-root')
  //       .and('contain', 'Inactive')
  //       .and('have.css', 'background-color', 'rgb(28, 41, 58)');

  //     // Go to last page.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

  //     // Check the current page number.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

  //     cy.get('#scheduler-table-body > .MuiTableRow-root > :nth-child(2)')
  //       .should('be.visible')
  //       .and('contain', 'scheduler-2');
  //   });

  //   it('when you click refresh, the paginated results and page numbers remain unchanged.', () => {
  //     // Go to last page.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

  //     // Check the current page number.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

  //     cy.get('#scheduler-table-body > .MuiTableRow-root > .MuiTableCell-root')
  //       .should('be.visible')
  //       .and('contain', 'scheduler-2');

  //     // Refresh page.
  //     cy.reload().then(() => {
  //       cy.wait(2000);
  //     });

  //     // Check if the page number has been reset.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

  //     cy.get('#scheduler-table > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root')
  //       .should('be.visible')
  //       .and('have.text', 'scheduler-2');
  //   });

  //   it('when returning to the previous page, pagination and results remain unchanged', () => {
  //     // Go to last page.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

  //     // Check the current page number.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

  //     cy.get('#scheduler-table-body > .MuiTableRow-root > .MuiTableCell-root')
  //       .should('be.visible')
  //       .and('contain', 'scheduler-2');

  //     // Go to show scheduler page.
  //     cy.get('#scheduler-table-body > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root').click();

  //     // Then I see that the current page is the show update personal-access-tokens.
  //     cy.url().should('include', '/clusters/1/schedulers/2');

  //     // Go back to the last page。
  //     cy.go('back');

  //     // Check the current page number.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

  //     cy.get('#scheduler-table-body > .MuiTableRow-root > .MuiTableCell-root')
  //       .should('be.visible')
  //       .and('contain', 'scheduler-2');
  //   });
  // });

  // describe('search', () => {
  //   it('should search scheduler hostname', () => {
  //     cy.get('#scheduler-table-body').children().should('have.length', 5);
  //     cy.get('#free-solo-demo').type('scheduler-8');

  //     // Then I see that the current page is the clusters/1?schedulerSearch=scheduler-8!
  //     cy.url().should('include', '/clusters/1?schedulerSearch=scheduler-8');
  //     cy.get('#scheduler-table-body').children().should('have.length', 1);

  //     // Pagination has been hidden.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul').should('not.exist');
  //     cy.get('#scheduler-table-body').should('exist').children().should('have.length', 1);

  //     // Show scheduler-8 information.
  //     cy.get('#scheduler-table-body').should('be.visible', 'scheduler-8');

  //     // Clear search box.
  //     cy.get('#free-solo-demo').clear();

  //     // Check number of pagination.
  //     cy.get('#scheduler-table-body').children().should('have.length', 5);
  //   });

  //   it('should search scheduler hostname and show no results', () => {
  //     cy.get('#free-solo-demo').type('scheduler-12');
  //     // No scheduler.
  //     cy.get('#scheduler-table-body > .MuiTableRow-root > .MuiTableCell-root')
  //       .should('be.visible')
  //       .and('contain', `You don't have scheduler cluster.`);
  //     // Pagination has been hidden.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul').should('not.exist');
  //   });

  //   it('should be queried based on the query string', () => {
  //     cy.visit('/clusters/1?schedulerSearch=scheduler-8&seedPeerSearch=seed-peer-10');

  //     // The content of the input box is displayed as scheduler-8.
  //     cy.get('#free-solo-demo').should('have.value', 'scheduler-8');

  //     cy.get('#scheduler-table-body').children().should('have.length', 1);

  //     // Clear search box.
  //     cy.get('#free-solo-demo').clear();

  //     // Then I see that the current page is the clusters!
  //     cy.url().should('include', '/clusters/1?seedPeerSearch=seed-peer-10');
  //   });
  // });

  // describe('delete', () => {
  //   it('when a scheduler is removed, this scheduler is the only scheduler on the last page', () => {
  //     // Check the total number of schedulers.
  //     cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('exist').and('contain', 'Total: 11');

  //     // Go to last page.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

  //     // Check the current page number.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

  //     cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 5);

  //     cy.get('#scheduler-2').click();
  //     cy.get('#delete-scheduler-2').click();
  //     cy.get('#cancelDeleteScheduler').click();
  //     cy.get('#scheduler-2').click();

  //     cy.intercept(
  //       {
  //         method: 'DELETE',
  //         url: '/api/v1/schedulers/2',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //         });
  //       },
  //     );
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           body: deleteScheduler,
  //         });
  //       },
  //     );

  //     cy.get('#delete-scheduler-2').click();
  //     // Confirm delete.
  //     cy.get('#deleteScheduler').click();

  //     // Delete success message.
  //     cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

  //     // The total number of schedulers will be reduced by one.
  //     cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('exist').and('contain', 'Total: 10');

  //     // Check whether the current page is on the second page.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

  //     // Check if the total number of pages is 4.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 4);
  //   });

  //   it('when deleting a scheduler, there is only one scheduler on the next page', () => {
  //     // Go to next page.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
  //     cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
  //     cy.get('#scheduler-table-body > :nth-child(5) > :nth-child(2)')
  //       .should('be.visible')
  //       .and('contain', 'scheduler-4');
  //     cy.get('#scheduler-4').click();

  //     // Check if the total number of pages is 5.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 5);

  //     cy.intercept(
  //       {
  //         method: 'DELETE',
  //         url: '/api/v1/schedulers/4',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //         });
  //       },
  //     ).as('delete');
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           body: schedulerDeleteAfter,
  //         });
  //       },
  //     );

  //     cy.get(':nth-child(7) > .MuiPaper-root > .MuiList-root > #delete-scheduler-4').click();
  //     cy.get('#deleteScheduler').click();
  //     cy.wait('@delete');

  //     // Delete success message.
  //     cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

  //     // The total number of scheduler is 10.
  //     cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('exist').and('contain', 'Total: 10');

  //     // Check if the total number of pages is 4.
  //     cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 4);

  //     cy.get('#scheduler-table-body > :nth-child(5) > :nth-child(2)')
  //       .scrollIntoView()
  //       .should('be.visible')
  //       .and('contain', 'scheduler-2');
  //   });

  //   it('try to delete scheduler using guest user', () => {
  //     cy.guestSignin();

  //     cy.intercept(
  //       {
  //         method: 'DELETE',
  //         url: '/api/v1/schedulers/7',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 401,
  //           body: { message: 'permission deny' },
  //         });
  //       },
  //     ).as('delete');

  //     cy.get('#scheduler-table-body > :nth-child(1) > :nth-child(2)')
  //       .should('be.visible')
  //       .and('contain', 'scheduler-7');

  //     cy.get('#scheduler-7').click();
  //     cy.get(':nth-child(7) > .MuiPaper-root > .MuiList-root > #delete-scheduler-7').click();
  //     cy.get('#deleteScheduler').click();
  //     cy.wait('@delete');

  //     // Show error message.
  //     cy.get('.MuiAlert-message').should('have.text', 'permission deny');
  //   });

  //   it('should handle API error response', () => {
  //     cy.intercept(
  //       {
  //         method: 'DELETE',
  //         url: '/api/v1/schedulers/7',
  //       },
  //       (req) => {
  //         req.reply({
  //           forceNetworkError: true,
  //         });
  //       },
  //     ).as('delete');

  //     cy.get('#scheduler-table-body > :nth-child(1) > :nth-child(2)')
  //       .should('be.visible')
  //       .and('contain', 'scheduler-7');

  //     cy.get('#scheduler-7').click();
  //     cy.get(':nth-child(7) > .MuiPaper-root > .MuiList-root > #delete-scheduler-7').click();

  //     cy.get('#deleteScheduler').click();
  //     cy.wait('@delete');

  //     // Show error message.
  //     cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
  //   });
  // });

  // describe('delete inactive schedulers and inactive seed peers', () => {
  //   it('There are no inactive scheduler and inactive seed peers that can be deleted', () => {
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           body: seedPeerActive,
  //         });
  //       },
  //     );
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           body: schedulerActive,
  //         });
  //       },
  //     );

  //     cy.get('#delete-all-inactive-instances').click();
  //     cy.get('.css-pbbh6n > .css-70qvj9 > .MuiTypography-root').should(
  //       'have.text',
  //       'Delete inactive schedulers and inactive seed peers',
  //     );
  //     cy.get('#schedulerTotal').should('have.text', '0 inactive');
  //     cy.get('#back-button').should('be.disabled');

  //     // Check next button.
  //     cy.get('#next-button').should('be.disabled');
  //   });

  //   it('can delete inactive schedulers and inactive seed peers', () => {
  //     const seedPeer = [10, 11, 9, 3];
  //     const schedulers = [10, 11, 9, 8, 6, 4, 2];

  //     for (let i = 0; i < seedPeer.length; i++) {
  //       cy.intercept('DELETE', `/api/v1/seed-peers/${seedPeer[i]}`, (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           delayMs: 400,
  //         });
  //       });
  //     }

  //     for (let i = 0; i < schedulers.length; i++) {
  //       cy.intercept('DELETE', `/api/v1/schedulers/${schedulers[i]}`, (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           delayMs: 400,
  //         });
  //       });
  //     }

  //     cy.get('#delete-all-inactive-instances').click();
  //     cy.get('.css-pbbh6n > .css-70qvj9 > .MuiTypography-root').should(
  //       'have.text',
  //       'Delete inactive schedulers and inactive seed peers',
  //     );
  //     cy.get('#schedulerTotal').should('have.text', '7 inactive');
  //     cy.get('#back-button').should('be.disabled');
  //     cy.get('#next-button').should('not.be.disabled');
  //     cy.get('#next-button').click();

  //     // Display the total number of seed peer.
  //     cy.get('#seedPeerTotal').should('have.text', '3 inactive');
  //     cy.get('#next-button').click();
  //     cy.get('#save-delete').click();
  //     cy.get('#deleteAllInactive-helper-text').should('have.text', 'Please enter "DELETE"');

  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           body: deletedInactiveScheduler,
  //         });
  //       },
  //     );
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           body: deletedInactiveSeedPeer,
  //         });
  //       },
  //     );

  //     cy.get('#deleteAllInactive').type('DELETE');

  //     cy.get('#deleteAllInactive-helper-text').should('not.exist');

  //     cy.get('#save-delete').click();

  //     // Show delete loading page.
  //     cy.get('.MuiLinearProgress-root').should('be.visible');

  //     // Unable to display delete cancel button and delete cancel icon button.
  //     cy.get('#close-delete-icon').should('not.exist');
  //     cy.get('#cancel-button').should('not.exist');
  //     cy.get('body').click('topLeft');
  //     cy.get('.css-xmqx0h').should('be.visible');

  //     cy.get('#failure').should('not.exist');
  //     // Show number of deleted schedulers.
  //     cy.get('.show_logHeaderWrapper__8-k3K > :nth-child(1) > :nth-child(1) > .MuiTypography-h6').should(
  //       'have.text',
  //       7,
  //     );

  //     // Show number of deleted seed peers.
  //     cy.get(':nth-child(2) > :nth-child(1) > .MuiTypography-h6').should('have.text', 3);

  //     // Show successfully deleted message.
  //     cy.get('.MuiAlert-message').should(
  //       'have.text',
  //       'You have successfully removed all inactive schedulers and inactive seed peers!',
  //     );
  //     cy.get('#cancel-button').click();

  //     // Check the total number of schedulers.
  //     cy.get('.css-ms744u-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('have.text', 'Total: 4');

  //     // Check the total number of seed peers.
  //     cy.get('.css-1o0u1hg-MuiPaper-root > .MuiChip-root > .MuiChip-label').should('have.text', 'Total: 8');
  //   });

  //   it('cannot delete inactive schedulers and inactive seed peers', () => {
  //     cy.intercept('DELETE', `/api/v1/schedulers/10`, (req) => {
  //       req.reply({
  //         statusCode: 404,
  //         delayMs: 100,
  //         body: { message: 'Not Found' },
  //       });
  //     });

  //     cy.get('#delete-all-inactive-instances').click();
  //     cy.get('#back-button').should('be.disabled');
  //     cy.get('#next-button').should('not.be.disabled');
  //     cy.get('#next-button').click();

  //     // Display the total number of seed peer.
  //     cy.get('#seedPeerTotal').should('have.text', '3 inactive');
  //     cy.get('#next-button').click();
  //     cy.get('#save-delete').click();
  //     cy.get('#deleteAllInactive-helper-text').should('have.text', 'Please enter "DELETE"');

  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           body: deletedInactiveScheduler,
  //         });
  //       },
  //     );
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           body: deletedInactiveSeedPeer,
  //         });
  //       },
  //     );

  //     cy.get('#deleteAllInactive').type('DELETE{enter}');
  //     cy.get('#failure').should('exist');
  //     cy.get('#inactive-header').click();

  //     // Show error message.
  //     cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
  //       .should('be.visible')
  //       .and('have.text', 'Deletion of scheduler with ID 10 failed! Error : Not Found.');
  //   });

  //   it('should handle API error response', () => {
  //     cy.intercept('DELETE', `/api/v1/schedulers/10`, (req) => {
  //       req.reply({
  //         forceNetworkError: true,
  //       });
  //     });

  //     cy.get('#delete-all-inactive-instances').click();
  //     cy.get('#back-button').should('be.disabled');
  //     cy.get('#next-button').should('not.be.disabled');
  //     cy.get('#next-button').click();

  //     // Display the total number of seed peer.
  //     cy.get('#seedPeerTotal').should('have.text', '3 inactive');
  //     cy.get('#next-button').click();
  //     cy.get('#save-delete').click();
  //     cy.get('#deleteAllInactive-helper-text').should('have.text', 'Please enter "DELETE"');

  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           forceNetworkError: true,
  //         });
  //       },
  //     );
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           forceNetworkError: true,
  //         });
  //       },
  //     );

  //     cy.get('#deleteAllInactive').type('DELETE{enter}');
  //     cy.get('#failure').should('exist');
  //     cy.get('#inactive-header').click();

  //     // Show error message.
  //     cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
  //       .should('be.visible')
  //       .and('have.text', 'Deletion of scheduler with ID 10 failed! Error : Failed to fetch.');

  //     // Show error message.
  //     cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
  //   });

  //   it('try to delete inactive scheduler and inactive seed peer using guest user', () => {
  //     cy.guestSignin();

  //     cy.intercept('DELETE', `/api/v1/schedulers/10`, (req) => {
  //       req.reply({
  //         statusCode: 401,
  //         body: { message: 'permission deny' },
  //       });
  //     });

  //     cy.get('#delete-all-inactive-instances').click();
  //     cy.get('#back-button').should('be.disabled');
  //     cy.get('#next-button').should('not.be.disabled');
  //     cy.get('#next-button').click();

  //     // Display the total number of seed peer.
  //     cy.get('#seedPeerTotal').should('have.text', '3 inactive');
  //     cy.get('#next-button').click();
  //     cy.get('#save-delete').click();
  //     cy.get('#deleteAllInactive-helper-text').should('have.text', 'Please enter "DELETE"');

  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           body: deletedInactiveScheduler,
  //         });
  //       },
  //     );
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
  //       },
  //       (req) => {
  //         req.reply({
  //           statusCode: 200,
  //           body: deletedInactiveSeedPeer,
  //         });
  //       },
  //     );

  //     cy.get('#deleteAllInactive').type('DELETE{enter}');
  //     cy.get('#failure').should('exist');
  //     cy.get('#inactive-header').click();

  //     // Show error message.
  //     cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
  //       .should('be.visible')
  //       .and('have.text', 'Deletion of scheduler with ID 10 failed! Error : permission deny.');
  //   });
  // });

  describe('change scheduler features', () => {
    // it('can update features', () => {
    //   // Show scheduler-7 no Preheat
    //   cy.get('#scheduler-table-body > :nth-child(1) > :nth-child(6)')
    //     .should('be.visible')
    //     .and('contain', 'Schedule')
    //     .and('not.contain', 'Preheat');
    //   cy.get('#scheduler-7').click();
    //   // Display the edit features dialog.
    //   cy.get(':nth-child(7) > .MuiPaper-root > .MuiList-root > #scheduler-7-edit').click();
    //   // Check that the Schedule checkbox.
    //   cy.get('#Schedule-Checkbox').should('have.prop', 'checked', true);
    //   //  Check that the Preheat checkbox.
    //   cy.get('#Preheat-Checkbox').should('have.prop', 'checked', false);
    //   // Check all checkboxes
    //   cy.get('[type="checkbox"]').check();
    //   cy.intercept({ method: 'PATCH', url: '/api/v1/schedulers/7' }, (req) => {
    //     (req.body = ''),
    //       req.reply({
    //         statusCode: 200,
    //         body: {},
    //       });
    //   });
    //   cy.intercept(
    //     {
    //       method: 'GET',
    //       url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
    //     },
    //     (req) => {
    //       req.reply({
    //         statusCode: 200,
    //         body: updateSchedulerFeature,
    //       });
    //     },
    //   );
    //   cy.get('#editFeatures').click();
    //   cy.get('#scheduler-table-body > :nth-child(1) > :nth-child(6)')
    //     .should('be.visible')
    //     .and('contain', 'Schedule')
    //     .and('contain', 'Preheat');
    // });
    // it('try to update features with guest user', () => {
    //   cy.guestSignin();
    //   // Show scheduler-7 no Preheat
    //   cy.get('#scheduler-table-body > :nth-child(1) > :nth-child(6)')
    //     .should('be.visible')
    //     .and('contain', 'Schedule')
    //     .and('not.contain', 'Preheat');
    //   cy.get('#scheduler-7').click();
    //   // Display the edit features dialog.
    //   cy.get(':nth-child(7) > .MuiPaper-root > .MuiList-root > #scheduler-7-edit').click();
    //   // Check that the Schedule checkbox.
    //   cy.get('#Schedule-Checkbox').should('have.prop', 'checked', true);
    //   //  Check that the Preheat checkbox.
    //   cy.get('#Preheat-Checkbox').should('have.prop', 'checked', false);
    //   // Check all checkboxes.
    //   cy.get('[type="checkbox"]').check();
    //   cy.intercept({ method: 'PATCH', url: '/api/v1/schedulers/7' }, (req) => {
    //     (req.body = ''),
    //       req.reply({
    //         statusCode: 401,
    //         body: { message: 'permission deny' },
    //       });
    //   });
    //   cy.get('#editFeatures').click();
    //   // Show error message.
    //   cy.get('.MuiAlert-message').should('be.visible').and('contain', 'permission deny');
    //   cy.get('#cancelEditFeatures').click();
    // });
    // it('get cluster API error response', () => {
    //   // cy.intercept(
    //   //   {
    //   //     method: 'GET',
    //   //     url: '/api/v1/scheduler-features',
    //   //   },
    //   //   (req) => {
    //   //     req.reply({
    //   //       forceNetworkError: true,
    //   //     });
    //   //   },
    //   // );
    //   // Show scheduler-7 no Preheat
    //   cy.get('#scheduler-table-body > :nth-child(1) > :nth-child(6)')
    //     .should('be.visible')
    //     .and('contain', 'Schedule')
    //     .and('not.contain', 'Preheat');
    //   cy.get('#scheduler-7').click();
    //   // Display the edit features dialog.
    //   cy.get(':nth-child(7) > .MuiPaper-root > .MuiList-root > #scheduler-7-edit').click();
    //   // Check that the Schedule checkbox.
    //   cy.get('#Schedule-Checkbox').should('have.prop', 'checked', true);
    //   //  Check that the Preheat checkbox.
    //   cy.get('#Preheat-Checkbox').should('have.prop', 'checked', false);
    //   // Check all checkboxes
    //   cy.get('[type="checkbox"]').check();
    //   cy.intercept({ method: 'PATCH', url: '/api/v1/schedulers/7' }, (req) => {
    //     (req.body = ''),
    //       req.reply({
    //         forceNetworkError: true,
    //       });
    //   });
    //   cy.get('#editFeatures').click();
    //   // Show error message.
    //   cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    // });
    it('', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/scheduler-features',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      cy.get('#scheduler-7').click();

      // No change features button.
      cy.get(':nth-child(7) > .MuiPaper-root > .MuiList-root > #delete-scheduler-7').should('not.be.visible');
    });
  });
});
