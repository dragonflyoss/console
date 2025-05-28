import preheats from '../../../fixtures/job/preheats/preheats.json';
import failurePreheat from '../../../fixtures/job/preheats/failure-preheat.json';
import successPreheat from '../../../fixtures/job/preheats/success-preheat.json';
import pendingPreheat from '../../../fixtures/job/preheats/pending-preheat.json';

declare const expect: Chai.ExpectStatic;

describe('Preheat', () => {
  beforeEach(() => {
    cy.signin();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10&type=preheat',
      },
      (req) => {
        req.reply((res: any) => {
          const responseHeaders = {
            ...res.headers,
            Link: '</api/v1/jobs?page=1&per_page=10&state=FAILURE>;rel=prev,</api/v1/jobs?page=2&per_page=10&state=FAILURE>;rel=next,</api/v1/jobs?page=1&per_page=10&state=FAILURE>;rel=first,</api/v1/jobs?page=2&per_page=10&state=FAILURE>;rel=last',
          };
          res.send(200, preheats, responseHeaders);
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs/8',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: successPreheat,
        });
      },
    );

    cy.viewport(1440, 1080);
  });

  it('click the breadcrumb', () => {
    cy.visit('/jobs/preheats');

    cy.get('[data-testid="isloading"]').should('be.exist');

    cy.get('#preheat-6').click();

    cy.url().should('include', '/jobs/preheats/6');

    // Check for breadcrumb.
    cy.get(':nth-child(3) > .MuiTypography-root').should('exist').and('contain', 'Preheat');

    cy.get(':nth-child(3) > .MuiTypography-root').click();

    cy.get('[data-testid="isloading"]').should('not.exist');

    // Then I see that the current page is the preheats page!
    cy.url().should('include', '/jobs/preheats');
  });

  describe('when data is loaded', () => {
    beforeEach(() => {
      cy.visit('/jobs/preheats');
    });

    it('should display detailed preheat failure information', () => {
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
              body: failurePreheat,
            });
          });
        },
      );

      // Click the preheat details button.
      cy.get('#preheat-10').click();
      cy.get('[data-testid="preheat-isloading"]').should('be.exist');

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist');
      cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').should('have.text', 10);

      // Show preheat id.
      cy.get('#id').should('have.text', 10);

      // Show preheat description.
      cy.get('#description').should('have.text', 'This is a preheat task with status failure');
      cy.get('[data-testid="preheat-isloading"]').should('not.exist');

      // Show preheat scope.
      cy.get('#scope').should('have.text', 'All Peers');

      // Show preheat status.
      cy.get('#status')
        .should('have.text', 'FAILURE')
        .and('have.css', 'background-color', 'rgb(212, 37, 54)')
        .find('#error-log-icon')
        .and('exist');

      cy.get('#url-0').should('have.text', 'https://example.com/path/to/file');
      cy.get('#url-1').should('have.text', 'https://example.com/path/to/file/url-1');
      cy.get('#url-2').should('have.text', 'https://example.com/path/to/file/url-2');

      cy.get('#piece-length').should('have.text', '4 MiB');

      // Show preheat tag.
      cy.get('#tag').should('have.text', 'prheat tag');

      cy.get('#application').should('have.text', 'application-1');

      // Show preheat headers.
      cy.get('#header-key-0').should('have.text', 'Connection');
      cy.get('#header-value-0').should('have.text', 'keep-alive');

      // Show preheat scheduler clusters ID.
      cy.get('#scheduler-lusters-id').should('have.text', 1);

      // Show preheat Created At.
      // cy.get('#created-at').should('have.text', '2023-12-13 11:58:53');

      // Click the show error log button.
      cy.get('#view-error-log').click();
      cy.get('.css-avhns > .MuiTypography-h6').should('have.text', 'Error log');
      cy.get('#panel1d-header').click();

      // Check error log.
      cy.get('.MuiAccordionDetails-root')
        .should('be.visible')
        .and('have.text', 'rpc error: code = Aborted desc = source response 401/401 Unauthorized is not valid');
    });

    it('should display detailed preheat success information', () => {
      cy.get('#preheat-8').click();

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist');
      cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').should('have.text', 8);

      // Show preheat id.
      cy.get('#id').should('have.text', 8);

      // Show preheat scope.
      cy.get('#scope').should('have.text', 'Single Seed Peer');

      // Show preheat status.
      cy.get('#status')
        .should('have.text', 'SUCCESS')
        .and('have.css', 'background-color', 'rgb(34, 139, 34)')
        .find('#error-log-icon')
        .and('not.exist');

      // Show preheat headers.
      cy.get('#header-key-0').should('have.text', 'Authorization');
      cy.get('#header-key-1').should('have.text', 'Connection');

      // Show preheat piece length.
      cy.get('#piece-length').should('have.text', '4 MiB');
    });

    it('should display detailed preheat pending information', () => {
      let interceptCount = 0;

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/11',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: pendingPreheat,
          });
          interceptCount++;
        },
      ).as('preheat');

      cy.get('#preheat-11').click();

      cy.wait(100);

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist');
      cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').should('have.text', 11);

      // Show preheat id.
      cy.get('#id').should('have.text', 11);

      // Show preheat status.
      cy.get('#status')
        .should('have.text', 'PENDING')
        .and('have.css', 'background-color', 'rgb(219, 171, 10)')
        .find('#pending-icon')
        .and('exist')
        .find('#error-log-icon')
        .and('not.exist');

      // Show preheat scope.
      cy.get('#scope').should('have.text', 'All Seed Peers');

      // Show preheat piece length.
      cy.get('#piece-length').should('have.text', '-');

      // Show preheat headers.
      cy.get('#header-value-0').should('have.text', 'Bearer yJhbGciOiJSUzI1NiIsImtpZCI6IjNEWT');

      cy.wait(60000);

      // Check how many times the API should be executed after six seconds.
      cy.get('@preheat').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(3, 0);
      });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/11',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: failurePreheat,
          });
        },
      );

      // Preheat fails after three seconds.
      cy.wait(60000);

      // Show preheat status.
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

      cy.visit('/jobs/preheats/6');
    });

    it('unable to display breadcrumb', () => {
      cy.get('.MuiBreadcrumbs-ol').should('be.visible').and('contain', 'Preheat');

      cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').should('have.text', '-');
    });

    it('preheat information should appear empty', () => {
      // Show preheat id.
      cy.get('#id').should('have.text', 0);

      // Show preheat description.
      cy.get('#description').should('have.text', '-');

      // Show preheat status.
      cy.get('#status').should('not.exist');

      // Show preheat url.
      cy.get('#url').should('have.text', '-');

      // Show preheat piece length.
      cy.get('#piece-length').should('have.text', '-');

      // Show preheat scope.
      cy.get('#scope').should('have.text', '-');

      // Show preheat tag.
      cy.get('#tag').should('have.text', '-');

      // Show preheat application.
      cy.get('#application').should('have.text', '-');

      // Show preheat headers.
      cy.get('#headers').should('have.text', '-');

      // Show preheat scheduler clusters ID.
      cy.get('#scheduler-lusters-id').should('have.text', '-');

      // Show preheat Created At.
      cy.get('#created-at').should('have.text', '-');
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

      cy.visit('/jobs/preheats/6');
    });

    it('show error message', () => {
      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiAlert-message').should('not.exist');
    });

    it('unable to display breadcrumb', () => {
      cy.get('.MuiBreadcrumbs-ol').should('be.visible').and('contain', 'Preheat');

      cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').should('have.text', '-');
    });

    it('preheat information should appear empty', () => {
      // Show preheat id.
      cy.get('#id').should('have.text', 0);

      // Show preheat description.
      cy.get('#description').should('have.text', '-');

      // Show preheat status.
      cy.get('#status').should('not.exist');

      // Show preheat url.
      cy.get('#url').should('have.text', '-');

      // Show preheat piece length.
      cy.get('#piece-length').should('have.text', '-');

      // Show preheat tag.
      cy.get('#tag').should('have.text', '-').should('have.text', '-');

      // Show preheat headers.
      cy.get('#headers').should('have.text', '-');

      // Show preheat scheduler clusters ID.
      cy.get('#scheduler-lusters-id').should('have.text', '-');

      // Show preheat Created At.
      cy.get('#created-at').should('have.text', '-');
    });

    it('when the status is pending, preheat API error response', () => {
      cy.visit('/jobs/preheats/11');

      let interceptCount = 0;

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/11',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: pendingPreheat,
          });
          interceptCount++;
        },
      ).as('preheat');

      cy.wait(100);

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist');
      cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').should('have.text', 11);

      // Show preheat id.
      cy.get('#id').should('have.text', 11);

      // Show preheat status.
      cy.get('#status')
        .should('have.text', 'PENDING')
        .and('have.css', 'background-color', 'rgb(219, 171, 10)')
        .find('#pending-icon')
        .and('exist')
        .find('#error-log-icon')
        .and('not.exist');

      // Show preheat headers.
      cy.get('#header-key-0').should('have.text', 'Authorization');

      // Show preheat piece length.
      cy.get('#piece-length').should('have.text', '-');

      cy.wait(60000);

      // Check how many times the API should be executed after six seconds.
      cy.get('@preheat').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(3, 0);
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

      // Preheat API error response after three seconds.
      cy.wait(60000);

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    });
  });
});
