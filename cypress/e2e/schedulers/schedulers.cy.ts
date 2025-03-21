import cluster from '../../fixtures/clusters/cluster/cluster.json';
import scheduler from '../../fixtures/clusters/cluster/scheduler.json';
import deleteScheduler from '../../fixtures/schedulers/delete-scheduler.json';
import updateSchedulerFeature from '../../fixtures/schedulers/update-scheduler-feature.json';
import schedulerDeleteAfter from '../../fixtures/schedulers/scheduler-delete-after.json';
import deletedInactiveScheduler from '../../fixtures/schedulers/deleted-inactive-scheduler.json';
import deletedInactiveSchedulerError from '../../fixtures/schedulers/deleted-inactive-scheduler-error.json';
import schedulerActive from '../../fixtures/schedulers/scheduler-active.json';

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
    cy.visit('clusters/1/schedulers');
    cy.viewport(1440, 1580);
  });

  describe('when data is loaded', () => {
    it('display the total number of scheduler and the active number', () => {
      cy.get('#active').should('be.visible').and('contain', '17');
      cy.get('#inactive').should('be.visible').and('contain', '34');
      cy.get('#total').should('be.visible').and('contain', '51');
    });

    it('can display schedulers table', () => {
      cy.get('[data-testid="isloading"]').should('be.exist');
      cy.get('#table').click();

      // Show idloading.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Show hostname.
      cy.get('#hostname-scheduler-7').should('be.visible').and('contain', 'scheduler-7');

      // Show ip.
      cy.get('#ip-7').should('be.visible').and('contain', '30.44.98.202');

      // Show state.
      cy.get('#state-7')
        .should('be.visible')
        .and('contain', 'Active')
        .and('have.css', 'background-color', 'rgb(31, 125, 83)');

      // Show features.
      cy.get('#features-7').should('be.visible').and('contain', 'Schedule');

      // Show scheduler-5 information.
      cy.get('#hostname-scheduler-5').should('be.visible').and('contain', 'scheduler-5');
      cy.get('#ip-5').should('be.visible').and('contain', '20.14.28.202');
      cy.get('#hostname-scheduler-43').should('be.visible').and('contain', 'scheduler-43');
      cy.get('#state-43')
        .should('be.visible')
        .and('contain', 'Inactive')
        .and('have.css', 'background-color', 'rgb(24, 35, 15)');

      // Click scheduler-18 operation button.
      cy.get('#operation-18').click();

      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .schedulers_menu__mxj5m > #view-scheduler-18').click();

      // Then I see that the current page is the scheduler 18.
      cy.url().should('include', 'clusters/1/schedulers/18');
    });

    it('can display schedulers card', () => {
      cy.get('#card-id-50').should('be.visible').and('have.text', '50');
      // Show hostname.
      cy.get('#card-hostname-scheduler-50').should('be.visible').and('contain', 'scheduler-50');
      // Show ip.
      cy.get('#card-ip-50').should('be.visible').and('contain', '192.168.0.0/19');
      // Show status.
      cy.get('#card-state-50')
        .should('be.visible')
        .and('have.text', 'Active')
        .and('have.css', 'background-color', 'rgba(0, 167, 111, 0.1)');
      cy.get('.MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();
      cy.get('#card-hostname-scheduler-41').should('be.visible').and('have.text', 'scheduler-41');
      // Show status.
      cy.get('#card-state-41')
        .should('be.visible')
        .and('have.text', 'Inactive')
        .and('have.css', 'background-color', 'rgba(145, 158, 171, 0.16)');
    });

    it('can display scheduler table and scheduler card', () => {
      cy.get('#table').click();

      // It can show that the scheduler table is 10.
      cy.get('#scheduler-table-body').children().should('have.length', 10);
      cy.get('#card').click();
      cy.get('#scheduler-card').should('exist');

      // It can show that the scheduler card is 10.
      cy.get('#scheduler-card').children().should('have.length', 9);
      cy.get('#operation-51').click();
      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .schedulers_menu__mxj5m > #view-51').click();

      // Then I see that the current page is the scheduler 51.
      cy.url().should('include', 'clusters/1/schedulers/51');
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiBreadcrumbs-ol > :nth-child(5)').click();

      // It can show that the scheduler table is 10.
      cy.get('#scheduler-card').children().should('have.length', 9);
    });

    it('display the number of schedulers according to the status', () => {
      cy.get('#table').click();
      cy.get('#lock-button').click();

      // Display active scheduler.
      cy.get('[value="active"]').click();
      cy.get('#scheduler-table-body').children().should('have.length', 10);
      cy.get('#scheduler-table-body').should('not.contain', 'Inactive');

      // Display inactive scheduler.
      cy.get('[value="inactive"]').click();
      cy.get('#scheduler-table-body').children().should('have.length', 10);
      cy.get('#scheduler-table-body').should('not.contain', 'Active');
      cy.get('#card').click();
      cy.get('#lock-button').click();

      // Display active scheduler.
      cy.get('[value="active"]').click();
      cy.get('#scheduler-card').children().should('have.length', 9);
      cy.get('#scheduler-card').should('not.contain', 'Inactive');

      // Display inactive scheduler.
      cy.get('[value="inactive"]').click();
      cy.get('#scheduler-card').children().should('have.length', 9);
      cy.get('#scheduler-card').should('not.contain', 'Active');

      // Display all scheduler.
      cy.get('#lock-button').click();
      cy.get('[value="all"]').click();
      cy.viewport(2440, 1580);
      cy.get('#scheduler-card').children().should('have.length', 15);
    });

    it('view the number of schedulers cards when changing the page size', () => {
      // The viewport will now be changed to 1440px x 1080px
      cy.viewport(1440, 1080);

      // Check if the number of page size is 9.
      cy.get('#scheduler-card').children().should('have.length', 9);

      // The viewport will now be changed to 1600px x 1080px
      cy.viewport(1600, 1080);
      cy.wait(1000);

      // Check if the number of page size is 9.
      cy.get('#scheduler-card').children().should('have.length', 9);

      // The viewport will now be changed to 1920px x 1080px
      cy.viewport(1920, 1080);
      cy.wait(1000);

      // Check if the number of page size is 12.
      cy.get('#scheduler-card').children().should('have.length', 12);

      // The viewport will now be changed to 2048px x 1080px
      cy.viewport(2048, 1080);
      cy.wait(1000);

      // Check if the number of page size is 12.
      cy.get('#scheduler-card').children().should('have.length', 12);

      // The viewport will now be changed to 2560px x 1080px
      cy.viewport(2560, 1080);
      cy.wait(1000);

      // Check if the number of page size is 15.
      cy.get('#scheduler-card').children().should('have.length', 15);
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
      cy.get('#active').should('be.visible').and('contain', '0');
      cy.get('#total').should('be.visible').and('contain', '0');
      cy.get('#inactive').should('be.visible').and('contain', '0');
    });

    it('there should be a message indicating that there is no scheduler', () => {
      cy.get('#no-scheduler').should('be.visible').and('contain', `You don't have scheduler cluster.`);

      // Show scheduler table.
      cy.get('#table').click();

      // Show scheduler table.
      cy.get('#no-scheduler-table').should('be.visible').and('contain', `You don't have scheduler cluster.`);
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
      cy.get('#active').should('be.visible').and('contain', '0');
      cy.get('#inactive').should('be.visible').and('contain', '0');
      cy.get('#total').should('be.visible').and('contain', '0');
    });

    it('there should be a message indicating that there is no scheduler', () => {
      cy.get('#no-scheduler').should('be.visible').and('contain', `You don't have scheduler cluster.`);

      // Show scheduler table.
      cy.get('#table').click();

      // Show scheduler table.
      cy.get('#no-scheduler-table').should('be.visible').and('contain', `You don't have scheduler cluster.`);
    });
  });

  describe('pagination', () => {
    it('pagination updates results and page number', () => {
      cy.get('#scheduler-card').should('be.visible');

      // Check number of pagination.
      cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 8);

      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');
    });

    it('when pagination changes, different page results are rendered', () => {
      cy.get('#card-hostname-scheduler-51').should('be.visible').and('have.text', 'scheduler-51');

      // Go to next page.
      cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Show scheduler information.
      cy.get('#card-hostname-scheduler-17').should('be.visible').and('contain', 'scheduler-17');

      cy.get('#card-state-43 > .MuiChip-label').and('contain', 'Inactive');
    });

    it('when you click refresh, the paginated results and page numbers remain unchanged.', () => {
      // Go to last page.
      cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      cy.get('#card-hostname-scheduler-41').should('be.visible').and('contain', 'scheduler-41');

      cy.url().should('include', '/clusters/1/schedulers?page=3');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(2000);
      });

      cy.url().should('include', '/clusters/1/schedulers?page=3');

      // Check if the page number has been reset.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      cy.get('#card-hostname-scheduler-41').should('be.visible').and('contain', 'scheduler-41');
    });

    it('when returning to the previous page, pagination and results remain unchanged', () => {
      // Go to last page.
      cy.get(':nth-child(7) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '6');

      cy.get('#card-hostname-scheduler-2').should('be.visible').and('contain', 'scheduler-2');

      // Go to show scheduler page.
      cy.get('#card-hostname-scheduler-2').click();

      // Then I see that the current page is the show update personal-access-tokens.
      cy.url().should('include', '/clusters/1/schedulers/2');

      // Go back to the last page。
      cy.go('back');

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '6');

      cy.get('#card-hostname-scheduler-2').should('be.visible').and('contain', 'scheduler-2');
    });
  });

  describe('search', () => {
    it('should search scheduler hostname', () => {
      // Show scheduler table.
      cy.get('#table').click();
      cy.get('#scheduler-table-body').children().should('have.length', 10);
      cy.get('#free-solo-demo').type('scheduler-8');

      // Then I see that the current page is the clusters/1?search=scheduler-8!
      cy.url().should('include', '/clusters/1/schedulers?search=scheduler-8');
      cy.get('#scheduler-table-body').children().should('have.length', 1);

      // Pagination has been hidden.
      cy.get('#scheduler-pagination > .MuiPagination-ul').should('not.exist');
      cy.get('#scheduler-table-body').should('exist').children().should('have.length', 1);

      // Show scheduler-8 information.
      cy.get('#scheduler-table-body').should('be.visible', 'scheduler-8');

      // Show scheduler card.
      cy.get('#card').click();

      cy.get('#scheduler-card').should('exist').children().should('have.length', 1);

      // Clear search box.
      cy.get('#free-solo-demo').clear();

      cy.get('#scheduler-card').should('exist').children().should('have.length', 9);

      // Show scheduler card.
      cy.get('#table').click();

      // Check number of pagination.
      cy.get('#scheduler-table-body').children().should('have.length', 10);
    });

    it('should search scheduler hostname and show no results', () => {
      cy.get('#free-solo-demo').type('scheduler-52');

      cy.wait(1000);

      cy.get('#scheduler-card').should('not.exist');
      cy.get('#no-scheduler').should('be.visible').and('contain', `You don't have scheduler cluster.`);

      // Show scheduler card.
      cy.get('#card').click();

      // No scheduler.
      cy.get('#no-scheduler-table').should('be.visible').and('contain', `You don't have scheduler cluster.`);

      // Pagination has been hidden.
      cy.get('#scheduler-pagination > .MuiPagination-ul').should('not.exist');
    });

    it('should be queried based on the query string', () => {
      // Show scheduler table.
      cy.get('#table').click();
      cy.get('#scheduler-table-body').children().should('have.length', 10);
      cy.get('#free-solo-demo').type('scheduler');

      // Then I see that the current page is the clusters/1?search=scheduler-8!
      cy.url().should('include', '/clusters/1/schedulers?search=scheduler');
      cy.get('#scheduler-table-body').children().should('have.length', 10);

      cy.get('.MuiPagination-ul > :nth-child(4)').click();

      cy.url().should('include', '/clusters/1/schedulers?search=scheduler&page=3');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(1000);
      });

      cy.get('#card').click();

      cy.get('#table').click();

      cy.reload().then(() => {
        cy.wait(1000);
      });

      cy.get('#card-hostname-scheduler-41').should('exist').should('have.text', 'scheduler-41');
    });

    it('query and then switch state', () => {
      cy.get('#free-solo-demo').type('scheduler');

      // Then I see that the current page is the clusters/1?search=scheduler-8!
      cy.url().should('include', '/clusters/1/schedulers?search=scheduler');
      cy.get('#scheduler-card').children().should('have.length', 9);
      cy.get('.MuiPagination-ul > :nth-child(4)').click();

      cy.url().should('include', '/clusters/1/schedulers?search=scheduler&page=3');

      cy.get('#lock-button').click();

      cy.get('[value="active"]').click();

      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('#scheduler-card').children().should('have.length', 8);

      // Then I see that the current page is the clusters/1?search=scheduler&page=2&status=active!
      cy.url().should('include', '/clusters/1/schedulers?search=scheduler&page=2&status=active');

      cy.get('#lock-button').click();

      cy.get('[value="inactive"]').click();

      // Then I see that the current page is the clusters/1?search=scheduler&status=inactive!
      cy.url().should('include', '/clusters/1/schedulers?search=scheduler&status=inactive');

      // Check number of pagination.
      cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 6);

      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');

      cy.get(':nth-child(5) > .MuiButtonBase-root').click();

      // Then I see that the current page is the clusters/1?search=scheduler&status=inactive!
      cy.url().should('include', '/clusters/1/schedulers?search=scheduler&page=4&status=inactive');

      // Check number of pagination.
      cy.get('#scheduler-card').children().should('have.length', 7);

      cy.get('#free-solo-demo').type('-11');

      // Then I see that the current page is the clusters/1?search=scheduler&status=inactive!
      cy.url().should('include', '/clusters/1/schedulers?search=scheduler-11&status=inactive');

      // Check number of pagination.
      cy.get('#scheduler-card').children().should('have.length', 1);

      // Paging does not exist.
      cy.get('#scheduler-pagination > .MuiPagination-ul').should('not.exist');
    });
  });

  describe('delete', () => {
    it('when a scheduler is removed, this scheduler is the only scheduler on the last page', () => {
      cy.get('#table').click();

      // Check the total number of schedulers.
      cy.get('#total').should('exist').and('contain', '51');

      cy.get('#inactive').should('exist').and('contain', '34');

      // Go to last page.
      cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(7) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '6');

      cy.get('#scheduler-table-body').children().should('have.length', 1);

      cy.url().should('include', '/clusters/1/schedulers?page=6');

      cy.get('#operation-22').click();
      cy.get('#delete-scheduler-22').click();
      cy.get('#cancelDeleteScheduler').click();
      cy.get('#operation-22').click();
      cy.get('#delete-scheduler-22').click();

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/schedulers/22',
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
          req.reply((res) => {
            res.setDelay(1000);
            res.send({
              statusCode: 200,
              body: deleteScheduler,
            });
          });
        },
      );

      // Confirm delete.
      cy.get('#deleteScheduler').click();

      cy.get('[data-testid="isloading"]').should('be.exist');

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

      cy.get('[data-testid="isloading"]').should('not.exist');

      // The total number of schedulers will be reduced by one.
      cy.get('#total').should('exist').and('contain', '50');

      cy.get('#inactive').should('exist').and('contain', '33');

      cy.url().should('include', '/clusters/1/schedulers');

      // Check if the total number of pages is 4.
      cy.get('#scheduler-table-body').children().should('have.length', 10);
    });

    it('when deleting a scheduler, there is only one scheduler on the next page', () => {
      cy.get('#table').click();

      cy.get('#hostname-scheduler-51').should('be.visible').and('contain', 'scheduler-51');
      cy.get('#inactive').should('be.visible').and('contain', '34');
      cy.get('#total').should('be.visible').and('contain', '51');

      // Check if paging exists.
      cy.get('#pagination').should('exist');
      cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', '8');

      cy.get(':nth-child(6) > .MuiButtonBase-root').click();

      cy.get('#operation-4').click();

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
            body: schedulerDeleteAfter,
          });
        },
      );

      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .schedulers_menu__mxj5m > #delete-scheduler-4').click();

      cy.get('#deleteScheduler').click();

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

      cy.get('#inactive').should('be.visible').and('contain', '33');
      cy.get('#total').should('be.visible').and('contain', '50');

      // Check if paging does not exist.
      cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', '7');

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '5');
    });

    it('delete the scheduler when switching to the scheduler card', () => {
      cy.get('#total').should('be.visible').and('contain', '51');

      cy.get('#lock-button').click();

      cy.get('[value="inactive"]').click();

      cy.get('.MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      cy.get('#operation-10').click();

      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .schedulers_menu__mxj5m > #delete-10').click();

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/schedulers/10',
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
            body: schedulerDeleteAfter,
          });
        },
      ).as('getScheduler');

      cy.get('#deleteScheduler').click();

      cy.wait('@getScheduler');

      cy.get('#total').should('be.visible').and('contain', '50');
    });

    it('search for scheduler and delete', () => {
      cy.get('#free-solo-demo').type('scheduler-22');
      cy.get('#scheduler-card').children().should('have.length', 1);

      cy.get('#operation-22').click();
      cy.get('#delete-22').click();

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/schedulers/22',
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
          req.reply((res) => {
            res.setDelay(1000);
            res.send({
              statusCode: 200,
              body: deleteScheduler,
            });
          });
        },
      );

      // Confirm delete.
      cy.get('#deleteScheduler').click();

      cy.get('[data-testid="isloading"]').should('be.exist');

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

      cy.get('[data-testid="isloading"]').should('not.exist');

      cy.get('#scheduler-card').should('not.exist');

      cy.get('#free-solo-demo').clear();

      // Check number of pagination.
      cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', 8);

      cy.get('#scheduler-card').children().should('have.length', 9);
    });

    it('try to delete scheduler using guest user', () => {
      cy.guestSignin();

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/schedulers/51',
        },
        (req) => {
          req.reply({
            statusCode: 401,
            body: { message: 'permission deny' },
          });
        },
      ).as('delete');

      cy.get('#card-hostname-scheduler-51').should('be.visible').and('contain', 'scheduler-51');

      cy.get('#operation-51').click();
      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .schedulers_menu__mxj5m > #delete-51').click();
      cy.get('#deleteScheduler').click();
      cy.wait('@delete');

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'permission deny');
    });

    it('should handle API error response', () => {
      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/schedulers/51',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );
      cy.get('#table').click();

      cy.get('#hostname-scheduler-51').should('be.visible').and('contain', 'scheduler-51');

      cy.get('#operation-51').click();
      cy.get(
        ':nth-child(12) > .MuiPaper-root > .MuiList-root > .schedulers_menu__mxj5m > #delete-scheduler-51',
      ).click();

      cy.get('#deleteScheduler').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');

      cy.get('#cancelDeleteScheduler').click();

      cy.get('#card').click();

      cy.get('#operation-51').click();

      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .schedulers_menu__mxj5m > #delete-51').click();

      cy.get('#deleteScheduler').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });
  });

  describe('delete inactive instances', () => {
    it('there are no inactive schedulers to delete', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: schedulerActive,
          });
        },
      );
      cy.get('#delete-all-inactive-instances').click();
      // Close delete inactive schedulers.
      cy.get('#close-delete-icon').click();
      cy.get('#delete-all-inactive-instances').click();
      cy.get('#delete-inactive-instances-title').should('have.text', 'Delete inactive instances');
      cy.get('#schedulerTotal').should('have.text', '0 inactive');
      cy.get('#back-button').should('be.disabled');
      // Check next button.
      cy.get('#next-button').should('be.disabled');
    });

    it('deleting some inactive schedulers failed', () => {
      cy.intercept('DELETE', `/api/v1/schedulers/9`, (req) => {
        req.reply({
          statusCode: 404,
          delayMs: 100,
          body: { message: 'Not Found' },
        });
      });
      const schedulers = [
        43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 29, 30, 31, 28, 27, 26, 25, 23, 24, 10, 11, 12, 13, 14, 15, 21,
        8, 6, 4, 2,
      ];
      for (let i = 0; i < schedulers.length; i++) {
        cy.intercept('DELETE', `/api/v1/schedulers/${schedulers[i]}`, (req) => {
          req.reply({
            statusCode: 200,
            delayMs: 400,
          });
        });
      }
      cy.get('#delete-all-inactive-instances').click();
      cy.get('#back-button').should('be.disabled');
      cy.get('#next-button').should('not.be.disabled');
      cy.get('#next-button').click();
      cy.get('#back-button').click();
      cy.get('#next-button').click();
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deletedInactiveSchedulerError,
          });
        },
      );
      cy.get('#deleteAllInactive').type('DELET3{enter}');
      // Display verification failure prompt information.
      cy.get('#deleteAllInactive-helper-text').should('have.text', 'Please enter "DELETE"');
      cy.get('#deleteAllInactive').clear();
      cy.get('#deleteAllInactive').type('DELETE{enter}');
      cy.wait(6000);
      cy.get('#failure').should('exist');
      cy.get('#inactive-header').click();
      // Show error message.
      cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'Deletion of scheduler with ID 9 failed! Error : Not Found.');
      cy.get('#total').should('have.text', 9);
      cy.get('#inactive').should('have.text', 5);
    });

    it('can Delete inactive instances', () => {
      const schedulers = [
        43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 29, 30, 31, 28, 27, 26, 25, 23, 24, 10, 11, 12, 13, 14, 15, 21,
        9, 8, 6, 4, 2, 22,
      ];

      for (let i = 0; i < schedulers.length; i++) {
        cy.intercept('DELETE', `/api/v1/schedulers/${schedulers[i]}`, (req) => {
          req.reply({
            statusCode: 200,
            delayMs: 400,
          });
        });
      }

      cy.get('#delete-all-inactive-instances').click();
      cy.get('#delete-inactive-instances-title').should('have.text', 'Delete inactive instances');
      cy.get('#schedulerTotal').should('have.text', '34 inactive');
      cy.get('#back-button').should('be.disabled');
      cy.get('#next-button').should('not.be.disabled');
      cy.get('#next-button').click();

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deletedInactiveScheduler,
          });
        },
      );

      cy.get('#deleteAllInactive').type('DELETE');
      cy.get('#deleteAllInactive-helper-text').should('not.exist');
      cy.get('#save-delete').click();

      // Show delete loading page.
      cy.get('.MuiLinearProgress-root').should('be.visible');

      // Unable to display delete cancel button and delete cancel icon button.
      cy.get('#close-delete-icon').should('not.exist');
      cy.get('#cancel-button').should('not.exist');
      cy.get('body').click('topLeft');
      cy.get('.css-xmqx0h').should('be.visible');
      cy.get('#failure').should('not.exist');

      cy.wait(400 * schedulers.length);

      // Show number of deleted schedulers.
      cy.get('.MuiAlert-message').should('have.text', 'You have successfully removed 34 inactive schedulers!');

      // Check the total number of schedulers.
      cy.get('#total').should('have.text', '4');
    });

    it('cannot delete inactive instances', () => {
      cy.intercept('DELETE', `/api/v1/schedulers/43`, (req) => {
        req.reply({
          statusCode: 404,
          delayMs: 100,
          body: { message: 'Not Found' },
        });
      });
      cy.get('#delete-all-inactive-instances').click();
      cy.get('#back-button').should('be.disabled');
      cy.get('#next-button').should('not.be.disabled');
      cy.get('#next-button').click();
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deletedInactiveScheduler,
          });
        },
      );
      cy.get('#deleteAllInactive').type('DELETE{enter}');
      cy.get('#failure').should('exist');
      cy.get('#inactive-header').click();
      // Show error message.
      cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'Deletion of scheduler with ID 43 failed! Error : Not Found.');
    });

    it('should handle delete scheduler API error response', () => {
      cy.intercept('DELETE', `/api/v1/schedulers/43`, (req) => {
        req.reply({
          forceNetworkError: true,
        });
      });
      cy.get('#delete-all-inactive-instances').click();
      cy.get('#back-button').should('be.disabled');
      cy.get('#next-button').should('not.be.disabled');
      cy.get('#next-button').click();
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
      cy.get('#deleteAllInactive').type('DELETE{enter}');
      cy.get('#failure').should('exist');
      cy.get('#inactive-header').click();
      // Show error message.
      cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'Deletion of scheduler with ID 43 failed! Error : Failed to fetch.');
      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });

    it('try to delete inactive scheduler using guest user', () => {
      cy.guestSignin();
      cy.intercept('DELETE', `/api/v1/schedulers/43`, (req) => {
        req.reply({
          statusCode: 401,
          body: { message: 'permission deny' },
        });
      });
      cy.get('#delete-all-inactive-instances').click();
      cy.get('#back-button').should('be.disabled');
      cy.get('#next-button').should('not.be.disabled');
      cy.get('#next-button').click();
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deletedInactiveScheduler,
          });
        },
      );
      cy.get('#deleteAllInactive').type('DELETE{enter}');
      cy.get('#failure').should('exist');
      cy.get('#inactive-header').click();
      // Show error message.
      cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'Deletion of scheduler with ID 43 failed! Error : permission deny.');
    });
  });

  describe('change scheduler features', () => {
    it('can update features', () => {
      // Show scheduler-7 no Preheat
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
      cy.get('#table').click();
      cy.get('#features-7').should('be.visible').and('contain', 'Schedule').and('not.contain', 'Preheat');

      cy.get('#operation-7').click();

      cy.get('body').click('topLeft');

      cy.get('#operation-7').click();

      // Display the edit features dialog.
      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .schedulers_menu__mxj5m > #edit-scheduler-7').click();

      cy.get('#close-delete-icon').click();
      cy.get('#operation-7').click();

      // Display the edit features dialog.
      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .schedulers_menu__mxj5m > #edit-scheduler-7').click();

      // Check that the Schedule checkbox.
      cy.get('#Schedule-Checkbox').should('have.prop', 'checked', true);

      // Check that the Preheat checkbox.
      cy.get('#Preheat-Checkbox').should('have.prop', 'checked', false);

      cy.get('#Schedule-Checkbox').click();

      cy.get('#Preheat-Checkbox').click();

      cy.intercept({ method: 'PATCH', url: '/api/v1/schedulers/7' }, (req) => {
        (req.body = ''),
          req.reply({
            statusCode: 200,
            body: {},
          });
      });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply((res) => {
            res.setDelay(2000);
            res.send({
              statusCode: 200,
              body: updateSchedulerFeature,
            });
          });
        },
      );

      cy.get('#editFeatures').click();

      cy.get('[data-testid="isloading"]').should('be.exist');

      cy.get('#features-7').should('be.visible').and('not.contain', 'Schedule').and('contain', 'Preheat');
    });

    it('scheduler card can update features', () => {
      // Show scheduler-7 no Preheat
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('#card-features-7').should('be.visible').and('contain', 'Schedule').and('not.contain', 'Preheat');
      cy.get('#operation-7').click();

      //  Display the edit features dialog.
      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .schedulers_menu__mxj5m > #edit-7').click();

      // Check that the Schedule checkbox.
      cy.get('#Schedule-Checkbox').should('have.prop', 'checked', true);

      // Check that the Preheat checkbox.
      cy.get('#Preheat-Checkbox').should('have.prop', 'checked', false);

      cy.get('#Schedule-Checkbox').click();

      cy.get('#Preheat-Checkbox').click();

      cy.intercept({ method: 'PATCH', url: '/api/v1/schedulers/7' }, (req) => {
        (req.body = ''),
          req.reply({
            statusCode: 200,
            body: {},
          });
      });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply((res) => {
            res.setDelay(2000);
            res.send({
              statusCode: 200,
              body: updateSchedulerFeature,
            });
          });
        },
      );

      cy.get('#editFeatures').click();

      cy.get('[data-testid="isloading"]').should('be.exist');

      cy.get('#card-features-7').should('be.visible').and('not.contain', 'Schedule').and('contain', 'Preheat');
    });

    it('try to update features with guest user', () => {
      cy.guestSignin();

      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Show scheduler-7 no Preheat.
      cy.get('#card-features-7').should('be.visible').and('contain', 'Schedule').and('not.contain', 'Preheat');
      cy.get('#operation-7').click();

      // Display the edit features dialog.
      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .schedulers_menu__mxj5m > #edit-7').click();

      // Check that the Schedule checkbox.
      cy.get('#Schedule-Checkbox').should('have.prop', 'checked', true);

      //  Check that the Preheat checkbox.
      cy.get('#Preheat-Checkbox').should('have.prop', 'checked', false);

      // Check all checkboxes.
      cy.get('[type="checkbox"]').check();
      cy.intercept({ method: 'PATCH', url: '/api/v1/schedulers/7' }, (req) => {
        (req.body = ''),
          req.reply({
            statusCode: 401,
            body: { message: 'permission deny' },
          });
      });

      cy.get('#editFeatures').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'permission deny');
      cy.get('#cancelEditFeatures').click();
    });

    it('update scheduler features API error response', () => {
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('#card-features-7').should('be.visible').and('contain', 'Schedule').and('not.contain', 'Preheat');
      cy.get('#operation-7').click();

      // Display the edit features dialog.
      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .schedulers_menu__mxj5m > #edit-7').click();

      // Check that the Schedule checkbox.
      cy.get('#Schedule-Checkbox').should('have.prop', 'checked', true);

      //  Check that the Preheat checkbox.
      cy.get('#Preheat-Checkbox').should('have.prop', 'checked', false);

      // Check all checkboxes.
      cy.get('[type="checkbox"]').check();
      cy.intercept({ method: 'PATCH', url: '/api/v1/schedulers/7' }, (req) => {
        (req.body = ''),
          req.reply({
            forceNetworkError: true,
          });
      });
      cy.get('#editFeatures').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    });

    it('get scheduler features API error response', () => {
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
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      cy.get('#operation-7').click();
    });
  });
});
