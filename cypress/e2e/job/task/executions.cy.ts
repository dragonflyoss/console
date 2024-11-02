import executions from '../../../fixtures/job/task/executions.json';
import paginationExecutions from '../../../fixtures/job/task/pagination-executions.json';

describe('Executions', () => {
  beforeEach(() => {
    cy.signin();

    cy.visit('/jobs/task/executions');
    cy.viewport(1440, 1080);

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10&type=delete_task',
      },
      (req) => {
        req.reply((res: any) => {
          const responseHeaders = {
            ...res.headers,
            Link: '</api/v1/jobs?page=1&per_page=10&state=FAILURE>;rel=prev,</api/v1/jobs?page=2&per_page=10&state=FAILURE>;rel=next,</api/v1/jobs?page=1&per_page=10&state=FAILURE>;rel=first,</api/v1/jobs?page=2&per_page=10&state=FAILURE>;rel=last',
          };
          res.send(200, executions, responseHeaders);
        });
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=2&per_page=10&type=delete_task',
      },
      (req) => {
        req.reply((res: any) => {
          const responseHeaders = {
            ...res.headers,
            Link: '</api/v1/jobs?page=1&per_page=10>;rel=prev,</api/v1/jobs?page=2&per_page=10>;rel=next,</api/v1/jobs?page=1&per_page=10>;rel=first,</api/v1/jobs?page=2&per_page=10>;rel=last',
          };
          res.send(200, paginationExecutions, responseHeaders);
        });
      },
    );
  });

  //   describe('when data is loaded', () => {
  //     it('should display preheat all list', () => {
  //       let interceptCount = 0;
  //       cy.intercept(
  //         {
  //           method: 'GET',
  //           url: '/api/v1/jobs?page=1&per_page=10&type=preheat',
  //         },
  //         (req) => {
  //           req.reply((res: any) => {
  //             res.setDelay(2000);
  //             const responseHeaders = {
  //               ...res.headers,
  //               Link: '</api/v1/jobs?page=1&per_page=10>;rel=prev,</api/v1/jobs?page=2&per_page=10>;rel=next,</api/v1/jobs?page=1&per_page=10>;rel=first,</api/v1/jobs?page=2&per_page=10>;rel=last',
  //             };
  //             res.send(200, executions, responseHeaders);
  //           });
  //           interceptCount++;
  //         },
  //       ).as('preheats');

  //       cy.get('[data-testid="isloading"]').should('be.exist');

  //       cy.get('#list-11 > .css-1mlhis1').should('exist').find('#PENDING-11').should('exist');
  //     });
  //   });

  //   it('when no data is loaded', () => {
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/jobs?page=1&per_page=10&type=delete_task',
  //       },
  //       (req) => {
  //         req.reply((res: any) => {
  //           const responseHeaders = {
  //             ...res.headers,
  //             Link: `
  //             </api/v1/jobs?page=1&per_page=10>;rel=prev,</api/v1/jobs?page=1&per_page=10>;rel=next,</api/v1/jobs?page=1&per_page=10>;rel=first,</api/v1/jobs?page=1&per_page=10>;rel=last`,
  //           };
  //           res.send(200, [], responseHeaders);
  //         });
  //       },
  //     );

  //     // No preheats list exists.
  //     cy.get('#executions-list').should('not.exist');

  //     // Show You don't have any preheat tasks.
  //     cy.get('#no-executions').should('be.visible').and('contain', `You don't have any executions.`);
  //   });

  //   it('should handle API error response', () => {
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: '/api/v1/jobs?page=1&per_page=10&type=delete_task',
  //       },
  //       (req) => {
  //         req.reply({
  //           forceNetworkError: true,
  //         });
  //       },
  //     );

  //     // Show error message.
  //     cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

  //     // Close error message.
  //     cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
  //     cy.get('.MuiAlert-message').should('not.exist');

  //     // No executions list exists.
  //     cy.get('#executions-list').should('not.exist');

  //     // Show You don't have any executions.
  //     cy.get('#no-executions').should('be.visible').and('contain', `You don't have any executions.`);
  //   });

  describe('pagination', () => {
    // it('pagination updates results and page number', () => {
    //   // Check number of pagination.
    //   cy.get('#executions-pagination > .MuiPagination-ul').children().should('have.length', 4);

    //   cy.get('#executions-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');

    //   // The preheating status is displayed as PENDING.
    //   cy.get('#list-11 > .css-1mlhis1').should('exist').find('#PENDING-11').should('exist');
    //   cy.get('#list-11 > .css-1mlhis1 > .css-ux5pj > .css-mu8687 > .MuiTypography-body1').should('have.text', 11);
    // });

    // it('when pagination changes, different page results are rendered', () => {
    //   // Go to next page.
    //   cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

    //   // Check the current page number.
    //   cy.get('#executions-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

    //   cy.get('#executions-list').children().should('have.length', 1);

    //   cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');
    //   cy.get('.css-mu8687 > .MuiTypography-body1').should('have.text', 1);
    // });

    it('when you click refresh, the paginated results and page numbers remain unchanged.', () => {
      // Go to next page.

      cy.get('.MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();
      // Check the current page number.
      cy.get('#executions-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(2000);
      });

      // Check the current page number.
      cy.get('#executions-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Show page 1 executions task.
      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');
    });
  });
});
