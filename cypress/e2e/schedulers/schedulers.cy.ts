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
      cy.get('#active').should('be.visible').and('contain', '9');
      cy.get('#inactive').should('be.visible').and('contain', '12');
      cy.get('#total').should('be.visible').and('contain', '21');
    });

    it('can display schedulers table', () => {
      // Show idloading.
      cy.get('[data-testid="isloading"]').should('be.exist');

      // Show hostname.
      cy.get('#hostname-scheduler-7').should('be.visible').and('contain', 'scheduler-7');

      // Show ip.
      cy.get('#ip-7').should('be.visible').and('contain', '30.44.98.202');

      // Show state.
      cy.get('#state-7')
        .should('be.visible')
        .and('contain', 'Active')
        .and('have.css', 'background-color', 'rgb(46, 143, 121)');

      // Show features.
      cy.get('#features-7').should('be.visible').and('contain', 'Schedule');
      
      // Show scheduler-5 information.
      cy.get('#hostname-scheduler-5').should('be.visible').and('contain', 'scheduler-5');
      cy.get('#ip-5').should('be.visible').and('contain', '20.14.28.202');
      cy.get('#hostname-scheduler-10').should('be.visible').and('contain', 'scheduler-10');
      cy.get('#state-10')
        .should('be.visible')
        .and('contain', 'Inactive')
        .and('have.css', 'background-color', 'rgb(28, 41, 58)');
    });

    it('can display schedulers card', () => {
      cy.get('#card').click();
      cy.get('#card-id-7').should('be.visible').and('have.text', '7');
      // Show hostname.
      cy.get('#card-hostname-scheduler-7').should('be.visible').and('contain', 'scheduler-7');
      // Show ip.
      cy.get('#card-ip-7').should('be.visible').and('contain', '30.44.98.202');
      // Show status.
      cy.get('#card-state-7')
        .should('be.visible')
        .and('have.text', 'Active')
        .and('have.css', 'background-color', 'rgba(0, 167, 111, 0.08)');

      cy.get(':nth-child(5) > .MuiButtonBase-root').click();

      cy.get('#card-hostname-scheduler-10').should('be.visible').and('have.text', 'scheduler-10');
      // Show status.
      cy.get('#card-state-10')
        .should('be.visible')
        .and('have.text', 'Inactive')
        .and('have.css', 'background-color', 'rgb(247, 247, 248)');
    });

    it('can display scheduler table and scheduler card', () => {
      // It can show that the scheduler table is 10.
      cy.get('#scheduler-table-body').children().should('have.length', 10);
      cy.get('#card').click();
      cy.get('#scheduler-card').should('exist');
      // It can show that the scheduler card is 10.
      cy.get('#scheduler-card').children().should('have.length', 9);
      cy.get('#operation-7').click();
      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .schedulers_menu__crwwA > #view-7').click();
      // Then I see that the current page is the scheduler 7.
      cy.url().should('include', 'clusters/1/schedulers/7');
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiBreadcrumbs-ol > :nth-child(5)').click();
      // It can show that the scheduler table is 10.
      cy.get('#scheduler-table-body').children().should('have.length', 10);
    });

    it('display the number of schedulers according to the status', () => {
      cy.get('#lock-button').click();

      // Display active scheduler.
      cy.get('[value="active"]').click();
      cy.get('#scheduler-table-body').children().should('have.length', 9);

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
      cy.get('[value="ALL"]').click();
      cy.viewport(2440, 1580);
      cy.get('#scheduler-card').children().should('have.length', 15);
    });

    it('view the number of schedulers cards when changing the page size', () => {
      cy.get('#card').click();
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
      // Show scheduler table.
      cy.get('#no-scheduler-table').should('be.visible').and('contain', `You don't have scheduler cluster.`);

      // Show scheduler card.
      cy.get('#card').click();

      cy.get('#no-scheduler').should('be.visible').and('contain', 'No data');
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
      // Show scheduler table.
      cy.get('#no-scheduler-table').should('be.visible').and('contain', `You don't have scheduler cluster.`);

      // Show scheduler card.
      cy.get('#card').click();

      cy.get('#no-scheduler').should('be.visible').and('contain', 'No data');
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
        .and('have.text', 'scheduler-16');

      // Go to next page.
      cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Show scheduler information.
      cy.get('#scheduler-table > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root')
        .should('be.visible')
        .and('contain', 'scheduler-11');

      cy.get(':nth-child(1) > :nth-child(5) > .MuiChip-root')
        .and('contain', 'Inactive')
        .and('have.css', 'background-color', 'rgb(28, 41, 58)');
    });

    it('when you click refresh, the paginated results and page numbers remain unchanged.', () => {
      // Go to last page.
      cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      cy.get('#hostname-scheduler-2').should('be.visible').and('contain', 'scheduler-2');

      cy.url().should('include', '/clusters/1/schedulers?page=3');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(2000);
      });

      cy.url().should('include', '/clusters/1/schedulers?page=3');

      // Check if the page number has been reset.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      cy.get('#scheduler-table > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'scheduler-2');
    });

    it('when returning to the previous page, pagination and results remain unchanged', () => {
      // Go to last page.
      cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      cy.get('#hostname-scheduler-2').should('be.visible').and('contain', 'scheduler-2');

      // Go to show scheduler page.
      cy.get('#scheduler-table-body > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root').click();

      // Then I see that the current page is the show update personal-access-tokens.
      cy.url().should('include', '/clusters/1/schedulers/2');

      // Go back to the last page。
      cy.go('back');

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      cy.get('#hostname-scheduler-2').should('be.visible').and('contain', 'scheduler-2');
    });
  });

  describe('search', () => {
    it('should search scheduler hostname', () => {
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
      cy.get('#free-solo-demo').type('scheduler-22');

      // No scheduler.
      cy.get('#no-scheduler-table').should('be.visible').and('contain', `You don't have scheduler cluster.`);

      // Pagination has been hidden.
      cy.get('#scheduler-pagination > .MuiPagination-ul').should('not.exist');

      // Show scheduler card.
      cy.get('#card').click();

      cy.get('#scheduler-card').should('exist').children().should('have.length', 1);
      cy.get('#no-scheduler').should('be.visible').and('contain', 'No data');
    });

    it('should be queried based on the query string', () => {
      cy.get('#scheduler-table-body').children().should('have.length', 10);
      cy.get('#free-solo-demo').type('scheduler');

      // Then I see that the current page is the clusters/1?search=scheduler-8!
      cy.url().should('include', '/clusters/1/schedulers?search=scheduler');
      cy.get('#scheduler-table-body').children().should('have.length', 10);

      cy.get('.MuiPagination-ul > :nth-child(4)').click();

      cy.url().should('include', '/clusters/1/schedulers?search=scheduler&page=3');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(2000);
      });

      cy.get('#card').click();

      cy.get('#table').click();

      cy.reload().then(() => {
        cy.wait(2000);
      });

      cy.get('#hostname-scheduler-2').should('exist').should('have.text', 'scheduler-2');
    });
  });

  describe('delete', () => {
    it('when a scheduler is removed, this scheduler is the only scheduler on the last page', () => {
      // Check the total number of schedulers.
      cy.get('#total').should('exist').and('contain', '21');

      // Go to last page.
      cy.get('#scheduler-pagination > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#scheduler-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      cy.get('#scheduler-table-body').children().should('have.length', 1);

      cy.url().should('include', '/clusters/1/schedulers?page=3');

      cy.get('#operation-2').click();
      cy.get('#delete-scheduler-2').click();
      cy.get('#cancelDeleteScheduler').click();
      cy.get('#operation-2').click();
      cy.get('#delete-scheduler-2').click();

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
      cy.get('#total').should('exist').and('contain', '20');

      cy.url().should('include', '/clusters/1/schedulers');

      // Check if the total number of pages is 4.
      cy.get('#scheduler-table-body').children().should('have.length', 10);
    });

    it('when deleting a scheduler, there is only one scheduler on the next page', () => {
      cy.get('#hostname-scheduler-10').should('be.visible').and('contain', 'scheduler-10');
      cy.get('#inactive').should('be.visible').and('contain', '12');
      cy.get('#total').should('be.visible').and('contain', '21');

      // Check if paging exists.
      cy.get('#pagination').should('exist');
      cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', '5');

      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

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

      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .schedulers_menu__crwwA > #delete-scheduler-4').click();
      cy.get('#deleteScheduler').click();

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

      cy.get('#inactive').should('be.visible').and('contain', '11');
      cy.get('#total').should('be.visible').and('contain', '20');

      // Check if paging does not exist.
      cy.get('#scheduler-pagination > .MuiPagination-ul').children().should('have.length', '4');
    });

    it('delete the scheduler when switching to the scheduler card', () => {
      cy.get('#total').should('be.visible').and('contain', '21');

      // Show scheduler card.
      cy.get('#card').click();

      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('#operation-10').click();

      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .schedulers_menu__crwwA > #delete-10').click();

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

      // Show idloading.
      cy.get('[data-testid="isloading"]').should('be.exist');

      cy.wait('@getScheduler');

      cy.get('#total').should('be.visible').and('contain', '20');
    });

    it('try to delete scheduler using guest user', () => {
      cy.guestSignin();

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

      cy.get('#hostname-scheduler-7').should('be.visible').and('contain', 'scheduler-7');

      cy.get('#operation-7').click();
      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .schedulers_menu__crwwA > #delete-scheduler-7').click();
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
      );

      cy.get('#hostname-scheduler-7').should('be.visible').and('contain', 'scheduler-7');

      cy.get('#operation-7').click();
      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .schedulers_menu__crwwA > #delete-scheduler-7').click();

      cy.get('#deleteScheduler').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');

      cy.get('#cancelDeleteScheduler').click();

      cy.get('#card').click();

      cy.get('#operation-7').click();

      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .schedulers_menu__crwwA > #delete-7').click();

      cy.get('#deleteScheduler').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });
  });

  describe('delete inactive schedulers', () => {
    it('There are no inactive schedulers to delete', () => {
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

      cy.get('.css-pbbh6n > .css-70qvj9 > .MuiTypography-root').should('have.text', 'Delete inactive schedulers');
      cy.get('#schedulerTotal').should('have.text', '0 inactive');
      cy.get('#back-button').should('be.disabled');

      // Check next button.
      cy.get('#next-button').should('be.disabled');
    });

    it('Deleting some inactive schedulers failed', () => {
      cy.intercept('DELETE', `/api/v1/schedulers/9`, (req) => {
        req.reply({
          statusCode: 404,
          delayMs: 100,
          body: { message: 'Not Found' },
        });
      });

      const schedulers = [10, 11, 12, 13, 14, 15, 21, 8, 6, 4, 2];

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
      cy.get('#failure').should('exist');
      cy.get('#inactive-header').click();

      // Show error message.
      cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'Deletion of scheduler with ID 9 failed! Error : Not Found.');

      cy.get('#total').should('have.text', 9);

      cy.get('#inactive').should('have.text', 5);
    });

    it('can Delete inactive schedulers', () => {
      const schedulers = [10, 11, 12, 13, 14, 15, 21, 9, 8, 6, 4, 2];

      for (let i = 0; i < schedulers.length; i++) {
        cy.intercept('DELETE', `/api/v1/schedulers/${schedulers[i]}`, (req) => {
          req.reply({
            statusCode: 200,
            delayMs: 400,
          });
        });
      }

      cy.get('#delete-all-inactive-instances').click();
      cy.get('.css-pbbh6n > .css-70qvj9 > .MuiTypography-root').should('have.text', 'Delete inactive schedulers');
      cy.get('#schedulerTotal').should('have.text', '12 inactive');
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

      cy.wait(2000);
      // Show number of deleted schedulers.
      cy.get('.MuiAlert-message').should('have.text', 'You have successfully removed 12 inactive schedulers!');

      // Check the total number of schedulers.
      cy.get('#total').should('have.text', '4');
    });

    it('cannot delete inactive schedulers', () => {
      cy.intercept('DELETE', `/api/v1/schedulers/10`, (req) => {
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
        .and('have.text', 'Deletion of scheduler with ID 10 failed! Error : Not Found.');
    });

    it('should handle delete scheduler API error response', () => {
      cy.intercept('DELETE', `/api/v1/schedulers/10`, (req) => {
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
        .and('have.text', 'Deletion of scheduler with ID 10 failed! Error : Failed to fetch.');

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });

    it('try to delete inactive scheduler using guest user', () => {
      cy.guestSignin();

      cy.intercept('DELETE', `/api/v1/schedulers/10`, (req) => {
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
        .and('have.text', 'Deletion of scheduler with ID 10 failed! Error : permission deny.');
    });
  });

  describe('change scheduler features', () => {
    it('can update features', () => {
      // Show scheduler-7 no Preheat
      cy.get('#features-7').should('be.visible').and('contain', 'Schedule').and('not.contain', 'Preheat');

      cy.get('#operation-7').click();

      cy.get('body').click('topLeft');

      cy.get('#operation-7').click();

      // Display the edit features dialog.
      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .schedulers_menu__crwwA > #edit-scheduler-7').click();

      cy.get('#close-delete-icon').click();
      cy.get('#operation-7').click();

      // Display the edit features dialog.
      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .schedulers_menu__crwwA > #edit-scheduler-7').click();

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
      cy.get('#card').click();

      // Show scheduler-7 no Preheat
      cy.get('#card-features-7').should('be.visible').and('contain', 'Schedule').and('not.contain', 'Preheat');
      cy.get('#operation-7').click();

      //  Display the edit features dialog.
      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .schedulers_menu__crwwA > #edit-7').click();

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

      // Show scheduler-7 no Preheat.
      cy.get('#features-7').should('be.visible').and('contain', 'Schedule').and('not.contain', 'Preheat');
      cy.get('#operation-7').click();

      // Display the edit features dialog.
      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .schedulers_menu__crwwA > #edit-scheduler-7').click();

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
      cy.get('#features-7').should('be.visible').and('contain', 'Schedule').and('not.contain', 'Preheat');
      cy.get('#operation-7').click();

      // Display the edit features dialog.
      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .schedulers_menu__crwwA > #edit-scheduler-7').click();

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

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      cy.get('#operation-7').click();
    });
  });
});
