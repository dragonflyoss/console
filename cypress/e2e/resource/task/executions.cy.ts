import executions from '../../../fixtures/resource/task/executions.json';
import paginationExecutions from '../../../fixtures/resource/task/pagination-executions.json';
import successExecutions from '../../../fixtures/resource/task/success-executions.json';
import failureExecutions from '../../../fixtures/resource/task/failure-executions.json';
import pendingExecutions from '../../../fixtures/resource/task/pending-executions.json';

describe('Executions', () => {
  beforeEach(() => {
    cy.signin();

    cy.visit('/resource/task/executions');
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

  describe('when data is loaded', () => {
    it('should display executions all list', () => {
      cy.get('[data-testid="isloading"]').should('be.exist');

      cy.get('.MuiTabs-flexContainer > .Mui-selected').should('be.visible').and('have.text', 'Executions');

      cy.get('[data-testid="isloading"]').should('not.exist');

      cy.get('#execution-11').should('exist').find('#PENDING-11').should('exist');

      cy.get('.MuiList-root > :nth-child(3) > .MuiButtonBase-root').click();

      // The executions status is displayed as PENDING.
      cy.get('#execution-11').should('exist').find('#PENDING-11').should('exist');
      cy.get('#id-11').should('have.text', 11);
      cy.get('#task-id-11').should('have.text', 'fe0c4a611d35e338efd342c346a2c671c358c5187c483a5fc7cd66c6685ce916');

      // The executions status is displayed as FAILURE.
      cy.get('#execution-10').should('exist').find('#FAILURE-10').should('exist');
      cy.get('#task-id-10').should('have.text', 'fe0c4a611d35e338efd342c346a2c671c358c5187c483a5fc7cd66c6685ce916');

      cy.get('#tab-clear').click();

      // Then I see that the current page is the clear page!
      cy.url().should('include', '/resource/task/clear');

      cy.get('#tab-executions').click();

      // Then I see that the current page is the executions page!
      cy.url().should('include', '/resource/task/executions');
    });

    it('should display executions success list', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs?page=1&per_page=10&state=SUCCESS&type=delete_task',
        },
        (req) => {
          req.reply((res: any) => {
            const responseHeaders = {
              ...res.headers,
              Link: '</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=prev,</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=next,</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=first,</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=last',
            };
            res.send(200, successExecutions, responseHeaders);
          });
        },
      );

      cy.get('.MuiInputBase-root > #states-select').click();
      cy.get('[data-value="SUCCESS"]').click();

      // Check how many executions are in success status.
      cy.get('#executions-list').children().should('have.length', 9);

      cy.get('#executions-pagination').should('not.exist');
    });

    it('should display executions failure list', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs?page=1&per_page=10&state=FAILURE&type=delete_task',
        },
        (req) => {
          req.reply((res: any) => {
            const responseHeaders = {
              ...res.headers,
              Link: '</api/v1/jobs?page=1&per_page=10&state=FAILURE>;rel=prev,</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=next,</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=first,</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=last',
            };
            res.send(200, failureExecutions, responseHeaders);
          });
        },
      );

      cy.get('.MuiInputBase-root > #states-select').click();
      cy.get('[data-value="FAILURE"]').click();

      // Check how many executions are in success failure.
      cy.get('#executions-list').children().should('have.length', 1);
    });

    it('should display executions pending list', () => {
      let interceptCount = 0;

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs?page=1&per_page=10&state=PENDING&type=delete_task',
        },
        (req) => {
          req.reply((res: any) => {
            const responseHeaders = {
              ...res.headers,
              Link: '</api/v1/jobs?page=1&per_page=10&state=PENDING>;rel=prev,</api/v1/jobs?page=2&per_page=10&state=PENDING>;rel=next,</api/v1/jobs?page=1&per_page=10&state=PENDING>;rel=first,</api/v1/jobs?page=0&per_page=10&state=PENDING>;rel=last',
            };

            res.send(200, pendingExecutions, responseHeaders);
          }),
            interceptCount++;
        },
      ).as('executions');

      cy.get('.MuiInputBase-root > #states-select').click();
      cy.get('[data-value="PENDING"]').click();

      // Check how many executions are in pending failure.
      cy.get('#executions-list').children().should('have.length', 1);

      cy.wait(59000);

      // The API should poll.
      cy.get('@executions').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(1, 0);
      });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs?page=1&per_page=10&state=PENDING&type=delete_task',
        },
        (req) => {
          req.reply({
            statusCode: 401,
            body: { message: 'Unauthorized' },
          });
        },
      );

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    });
  });

  it('when no data is loaded', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10&type=delete_task',
      },
      (req) => {
        req.reply((res: any) => {
          const responseHeaders = {
            ...res.headers,
            Link: `
                  </api/v1/jobs?page=1&per_page=10>;rel=prev,</api/v1/jobs?page=1&per_page=10>;rel=next,</api/v1/jobs?page=1&per_page=10>;rel=first,</api/v1/jobs?page=1&per_page=10>;rel=last`,
          };
          res.send(200, [], responseHeaders);
        });
      },
    );

    // No executions list exists.
    cy.get('#executions-list').should('not.exist');

    // Show You don't have any executions tasks.
    cy.get('#no-executions').should('be.visible').and('contain', `You don't have any executions.`);
  });

  it('should handle API error response', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10&type=delete_task',
      },
      (req) => {
        req.reply({
          forceNetworkError: true,
        });
      },
    );

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

    // Close error message.
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiAlert-message').should('not.exist');
  });

  describe('pagination', () => {
    it('pagination updates results and page number', () => {
      // Check number of pagination.
      cy.get('#executions-pagination > .MuiPagination-ul').children().should('have.length', 4);

      cy.get('#executions-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');

      // The executions status is displayed as PENDING.
      cy.get('#execution-11').should('exist').find('#PENDING-11').should('exist');
      cy.get('#id-11').should('have.text', 11);
    });

    it('when pagination changes, different page results are rendered', () => {
      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#executions-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#executions-list').children().should('have.length', 1);

      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');
      cy.get('.css-mu8687 > .MuiTypography-body1').should('have.text', 1);
    });

    it('when you click refresh, the paginated results and page numbers remain unchanged.', () => {
      // Go to next page.

      cy.get('.MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();
      // Check the current page number.
      cy.get('#executions-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(1000);
      });

      // Check the current page number.
      cy.get('#executions-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Show page 1 executions task.
      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');
    });

    it('when returning to the previous page, pagination and results remain unchanged.', () => {
      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#executions-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');

      // Go to show executions page.
      cy.get('#detail-1').click();

      // Then I see that the current page is the show update personal-access-tokens.
      cy.url().should('include', '/resource/task/executions/1');

      // Go back to the last page.
      cy.go('back');

      // Check the current page number.
      cy.get('#executions-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');
    });
  });
});
