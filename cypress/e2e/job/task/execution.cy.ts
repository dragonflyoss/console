import executions from '../../../fixtures/job/task/executions.json';
import execution from '../../../fixtures/job/task/execution.json';
import pendingExecution from '../../../fixtures/job/task/pending-execution.json';
import failureExecution from '../../../fixtures/job/task/failure-execution.json';

describe('Executions', () => {
  beforeEach(() => {
    cy.signin();

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
        url: '/api/v1/jobs/9',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: execution,
        });
      },
    );

    cy.visit('/jobs/task/executions');
    cy.viewport(1440, 1080);
  });

  it('click the breadcrumb', () => {
    // Show isloading.
    cy.get('[data-testid="isloading"]').should('be.exist');

    cy.get('#execution-9 > .MuiBox-root').click();

    cy.url().should('include', '/jobs/task/executions/9');

    // Check for breadcrumb.
    cy.get('.MuiBreadcrumbs-ol').should('exist').and('contain', 'executions').and('contain', '9');

    cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').click();

    cy.get('[data-testid="isloading"]').should('not.exist');

    // Then I see that the current page is the executions page!
    cy.url().should('include', '/jobs/task/executions');
  });

  describe('when data is loaded', () => {
    it('should display detailed execution failure information', () => {
      // Click the execution details button.

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/10',
        },
        (req) => {
          req.reply((res) => {
            res.setDelay(1000);
            res.send({
              statusCode: 200,
              body: failureExecution,
            });
          });
        },
      );

      cy.get('#execution-10').click();

      cy.get('[data-testid="execution-isloading"]').should('be.exist');

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist').and('contain', 10);

      // Show execution id.
      cy.get('.MuiPaper-root > :nth-child(1)').should('contain', 10);

      cy.get('[data-testid="execution-isloading"]').should('not.exist');

      // Show execution status.
      cy.get('#status')
        .should('have.text', 'FAILURE')
        .and('have.css', 'background-color', 'rgb(212, 37, 54)')
        .find('#error-log-icon')
        .and('exist');

      cy.get('.MuiPaper-root > :nth-child(3)').should(
        'contain',
        'fe0c4a611d35e338efd342c346a2c671c358c5187c483a5fc7cd66c6685ce916',
      );

      // Show execution tag.
      cy.get('.MuiPaper-root > :nth-child(5)').should('contain', 'execution-tag');

      // Show execution tag.
      cy.get('.MuiPaper-root > :nth-child(6)').should('contain', 'execution-application');

      // Show execution scheduler clusters ID.
      cy.get(':nth-child(7) > :nth-child(2)').should('have.text', 1);

      // Click the show error log button.
      cy.get('#status > .MuiButtonBase-root').click();
      cy.get('.css-sp3me4 > .MuiTypography-h6').should('have.text', 'Error log');
      cy.get('#panel1d-header').click();

      // Check error log.
      cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'rpc error: code = Aborted desc = source response 401/401 Unauthorized is not valid');
    });

    it('should display detailed execution success information', () => {
      cy.get('#execution-9').click();

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist').and('contain', 9);

      // Show execution id.
      cy.get('.MuiPaper-root > :nth-child(1)').should('contain', 9);

      cy.get('[data-testid="execution-isloading"]').should('not.exist');

      // Show execution status.
      cy.get('#status')
        .should('have.text', 'SUCCESS')
        .and('have.css', 'background-color', 'rgb(34, 139, 34)')
        .find('#error-log-icon')
        .and('not.exist');

      // Show execution URL.
      cy.get('.MuiPaper-root > :nth-child(4)').should('contain', 'https://example.com/path/to/file');

      // Show failure task.
      cy.get('#failure-tasks').should('exist');

      cy.get('#failure-tasks-list > :nth-child(1) > :nth-child(1)').should('contain', 'kind-worker');

      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#failure-tasks-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#failure-tasks-list').children().should('have.length', 1);

      cy.get('#failure-tasks-list > .MuiTableRow-root > :nth-child(1)').should('have.text', 'dragonfly-seed-client-5');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(1000);
      });

      // Check the current page number.
      cy.get('#failure-tasks-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#failure-tasks-list').children().should('have.length', 1);

      cy.get('#failure-tasks-list > .MuiTableRow-root > :nth-child(1)').should('have.text', 'dragonfly-seed-client-5');

      // Show error log.
      cy.get('#error-log-icon').click();

      cy.get('#panel1d-header').click();

      cy.get('.MuiAccordionDetails-root').should(
        'contain',
        'task a1e21fceseba95d4407a83b3fc767da6de2a2fe35736c2ba3b95473229de1894 failed: rpc error: code = Unavailable desc = connection error: desc = "transport: Error while dialing: dial tcp 172.18.0.3:4000: connect: connection refused"',
      );
    });

    it('should display detailed execution pending information', () => {
      let interceptCount = 0;

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/11',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: pendingExecution,
          });
          interceptCount++;
        },
      ).as('execution');

      cy.get('#execution-11').click();

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist').and('contain', 11);

      // Show execution id.
      cy.get('.MuiPaper-root > :nth-child(1)').should('contain', 11);

      // Show execution status.
      cy.get('#status')
        .should('have.text', 'PENDING')
        .and('have.css', 'background-color', 'rgb(219, 171, 10)')
        .find('#pending-icon')
        .and('exist')
        .find('#error-log-icon')
        .and('not.exist');

      cy.wait(120000);

      // Check how many times the API should be executed after six seconds.
      cy.get('@execution').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(4, 1);
      });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/11',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: failureExecution,
          });
        },
      );

      // Execution fails after three seconds.
      cy.wait(60000);

      // Show execution status.
      cy.get('#status')
        .should('have.text', 'FAILURE')
        .and('have.css', 'background-color', 'rgb(212, 37, 54)')
        .find('#error-log-icon')
        .and('exist');
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/6',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: {},
          });
        },
      );

      cy.visit('jobs/task/executions/6');
    });

    it('execution information should appear empty', () => {
      // Show execution id.
      cy.get(':nth-child(1) > .show_informationContent__KJR0m').should('have.text', 0);

      // Show execution status.
      cy.get('#status').should('not.exist');

      // Show execution task id.
      cy.get(':nth-child(3) > .show_informationContent__KJR0m').should('have.text', '-');

      // Show execution url.
      cy.get('.show_urlContent__GX54w').should('have.text', '-');

      // Show execution tag.
      cy.get(':nth-child(5) > .show_informationContent__KJR0m.MuiBox-root > .MuiTypography-root').should(
        'have.text',
        '-',
      );

      // Show execution scheduler clusters ID.
      cy.get(':nth-child(7) > :nth-child(2)').should('have.text', '-');

      // Show execution Created At.
      cy.get(':nth-child(8) > :nth-child(2) > .MuiTypography-root').should('have.text', '-');

      // Don't show failure tasks.
      cy.get('#failure-tasks').should('not.exist');
    });
  });

  describe('should handle API error response', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/6',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.visit('jobs/task/executions/6');
    });

    it('show error message', () => {
      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiAlert-message').should('not.exist');
    });

    it('execution information should appear empty', () => {
      // Show execution id.
      cy.get(':nth-child(1) > .show_informationContent__KJR0m').should('have.text', 0);
      // Show execution status.
      cy.get('#status').should('not.exist');
      // Show execution task id.
      cy.get(':nth-child(3) > .show_informationContent__KJR0m').should('have.text', '-');
      // Show execution url.
      cy.get('.show_urlContent__GX54w').should('have.text', '-');
      // Show execution tag.
      cy.get(':nth-child(5) > .show_informationContent__KJR0m.MuiBox-root > .MuiTypography-root').should(
        'have.text',
        '-',
      );
      // Show execution scheduler clusters ID.
      cy.get(':nth-child(7) > :nth-child(2)').should('have.text', '-');
      // Show execution Created At.
      cy.get(':nth-child(8) > :nth-child(2) > .MuiTypography-root').should('have.text', '-');
      // Don't show failure tasks.
      cy.get('#failure-tasks').should('not.exist');
    });

    it('when the status is pending, execution API error response', () => {
      let interceptCount = 0;

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/11',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: pendingExecution,
          });
          interceptCount++;
        },
      ).as('execution');

      cy.visit('jobs/task/executions/11');

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist').and('contain', 11);

      // Show execution id.
      cy.get(':nth-child(1) > .show_informationContent__KJR0m').should('contain', 11);

      // Show execution status.
      cy.get('#status')
        .should('have.text', 'PENDING')
        .and('have.css', 'background-color', 'rgb(219, 171, 10)')
        .find('#pending-icon')
        .and('exist')
        .find('#error-log-icon')
        .and('not.exist');

      // Show failure tasks.
      cy.get('#failure-tasks').should('exist');

      cy.get('#failure-tasks-list > :nth-child(1) > :nth-child(1)').should('have.text', 'kind-worker');

      cy.get('#failure-tasks-list > :nth-child(1) > :nth-child(2)').should('have.text', '172.18.0.3');

      cy.wait(120000);

      // Check how many times the API should be executed after six seconds.
      cy.get('@execution').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(4, 1);
      });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/11',
        },
        (req) => {
          req.reply({
            statusCode: 401,
            body: { message: 'Unauthorized' },
          });
        },
      );

      // Execution API error response after three seconds.
      cy.wait(60000);

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    });
  });
});
