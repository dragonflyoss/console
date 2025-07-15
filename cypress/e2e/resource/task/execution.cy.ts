import executions from '../../../fixtures/resource/task/executions.json';
import execution from '../../../fixtures/resource/task/execution.json';
import pendingExecution from '../../../fixtures/resource/task/pending-execution.json';
import failureExecution from '../../../fixtures/resource/task/failure-execution.json';

describe('Executions', () => {
  beforeEach(() => {
    cy.signin();

    cy.visit('/resource/task/executions/6');
    cy.viewport(1440, 1080);
  });

  describe('when data is loaded', () => {
    beforeEach(() => {
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

      cy.visit('/resource/task/executions');
    });

    it('click the breadcrumb', () => {
      // Show isloading.
      cy.get('[data-testid="isloading"]').should('be.exist');

      cy.get('#execution-9').click();

      cy.url().should('include', '/resource/task/executions/9');

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist').and('contain', 'Executions').and('contain', '9');

      cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').click();

      cy.get('[data-testid="isloading"]').should('not.exist');

      // Then I see that the current page is the executions page!
      cy.url().should('include', '/resource/task/executions');
    });

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
      cy.get('#id').should('contain', 10);

      // Show execution content for calculating task id.
      cy.get('#content-for-calculating-task-id').should('have.text', '-');

      cy.get('[data-testid="execution-isloading"]').should('not.exist');

      // Show execution piece length.
      cy.get('#piece-length').should('have.text', '4 MiB');

      // Show execution status.
      cy.get('#status')
        .should('have.text', 'FAILURE')
        .and('have.css', 'background-color', 'rgb(212, 37, 54)')
        .find('#error-log-icon')
        .and('exist');
      cy.get('#task-id').should('contain', 'fe0c4a611d35e338efd342c346a2c671c358c5187c483a5fc7cd66c6685ce916');

      // Show execution tag.
      cy.get('#tag').should('contain', 'execution-tag');

      // Show execution application.
      cy.get('#application').should('contain', 'execution-application');

      // Show execution scheduler clusters ID.
      cy.get('#scheduler-clusters-id').should('have.text', 1);

      // Click the show error log button.
      cy.get('#status > .MuiButtonBase-root').click();
      cy.get('#error-log').should('have.text', 'Error log');
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
      cy.get('#id').should('contain', 9);
      cy.get('[data-testid="execution-isloading"]').should('not.exist');

      // Show execution status.
      cy.get('#status')
        .should('have.text', 'SUCCESS')
        .and('have.css', 'background-color', 'rgb(34, 139, 34)')
        .find('#error-log-icon')
        .and('not.exist');

      // Show execution URL.
      cy.get('.MuiPaper-root > :nth-child(4)').should('contain', 'https://example.com/path/to/file');

      // Show execution piece length.
      cy.get('#piece-length').should('have.text', '-');

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
      cy.get('#id').should('contain', 11);

      // Show execution status.
      cy.get('#status')
        .should('have.text', 'PENDING')
        .and('have.css', 'background-color', 'rgb(219, 171, 10)')
        .find('#pending-icon')
        .and('exist')
        .find('#error-log-icon')
        .and('not.exist');
      cy.wait(59000);

      // Check how many times the API should be executed after six seconds.
      cy.get('@execution').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(2, 0);
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

      // Show execution status.
      cy.get('#status')
        .should('have.text', 'FAILURE')
        .and('have.css', 'background-color', 'rgb(212, 37, 54)')
        .find('#error-log-icon')
        .and('exist');

      // Show execution piece length.
      cy.get('#piece-length').should('have.text', '4 MiB');
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
    });

    it('execution information should appear empty', () => {
      // Show execution id.
      cy.get('#id').should('have.text', 0);

      // Show execution status.
      cy.get('#status').should('not.exist');

      // Show execution task id.
      cy.get('#task-id').should('have.text', '-');

      // Show execution content for calculating task id.
      cy.get('#content-for-calculating-task-id').should('have.text', '-');

      // Show execution url.
      cy.get('#url').should('have.text', '-');

      // Show execution piece length.
      cy.get('#piece-length').should('have.text', '-');

      // Show execution tag.
      cy.get('#tag').should('have.text', '-');

      // Show execution scheduler clusters ID.
      cy.get('#scheduler-clusters-id').should('have.text', '-');

      // Show execution Created At.
      cy.get('#created-at').should('have.text', '-');

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
      cy.get('#id').should('have.text', 0);

      // Show execution status.
      cy.get('#status').should('not.exist');

      // Show execution task id.
      cy.get('#task-id').should('have.text', '-');

      // Show execution content for calculating task id.
      cy.get('#content-for-calculating-task-id').should('have.text', '-');

      // Show execution url.
      cy.get('#url').should('have.text', '-');

      // Show execution piece length.
      cy.get('#piece-length').should('have.text', '-');

      // Show execution tag.
      cy.get('#tag').should('have.text', '-');

      // Show execution scheduler clusters ID.
      cy.get('#scheduler-clusters-id').should('have.text', '-');

      // Show execution Created At.
      cy.get('#created-at').should('have.text', '-');

      // Don't show failure tasks.
      cy.get('#failure-tasks').should('not.exist');
    });

    it('when the status is pending, execution API error response', () => {
      cy.visit('/resource/task/executions/11');

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

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist').and('contain', 11);

      // Show execution id.
      cy.get('#id').should('contain', 11);

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

      cy.wait(59000);

      // Check how many times the API should be executed after six seconds.
      cy.get('@execution').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(2, 0);
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

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    });
  });
});
