import preheats from '../../fixtures/preheats/preheats.json';
import failurePreheat from '../../fixtures/preheats/failure-preheat.json';
import successPreheat from '../../fixtures/preheats/success-preheat.json';
import pendingPreheat from '../../fixtures/preheats/pending-preheat.json';

declare const expect: Chai.ExpectStatic;

describe('Preheat', () => {
  beforeEach(() => {
    cy.signin();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10',
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

    cy.visit('/jobs/preheats');
    cy.viewport(1440, 1080);
  });

  it('click the breadcrumb', () => {
    cy.get(':nth-child(6) > .css-1mlhis1 > .css-1ozvesn > .MuiTypography-root > .MuiBox-root').click();

    cy.url().should('include', '/jobs/preheats/6');

    // Check for breadcrumb.
    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root').should('exist').and('contain', 'preheats');

    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root').click();

    // Then I see that the current page is the preheats page!
    cy.url().should('include', '/jobs/preheats');
  });

  describe('when data is loaded', () => {
    it('should display detailed preheat failure information', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/10',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: failurePreheat,
          });
        },
      );

      // Click the preheat details button.
      cy.get('#preheat-10').click();

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist');
      cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').should('have.text', 10);

      // Show preheat id.
      cy.get(':nth-child(1) > .show_informationContent__wKGxa').should('have.text', 10);

      // Show preheat description.
      cy.get(':nth-child(2) > .show_informationContent__wKGxa').should(
        'have.text',
        'This is a preheat task with status failure',
      );

      // Show preheat status.
      cy.get('#status')
        .should('have.text', 'FAILURE')
        .and('have.css', 'background-color', 'rgb(212, 37, 54)')
        .find('#error-log-icon')
        .and('exist');

      cy.get(':nth-child(4) > .show_informationContent__wKGxa').should('have.text', 'http://dock.io/preheat/test');

      // Show preheat filter.
      cy.get(':nth-child(5) > .show_informationContent__wKGxa').children().should('have.length', 2);

      cy.get(':nth-child(5) > .show_informationContent__wKGxa > :nth-child(1) > .MuiChip-label').should(
        'have.text',
        'Expires',
      );

      // Show preheat tag.
      cy.get(':nth-child(6) > .show_informationContent__wKGxa > .MuiChip-root').should('have.text', 'prheat tag');

      // Show preheat hearder.
      cy.get(':nth-child(7) > .MuiPaper-root').children().should('have.length', 1);

      cy.get('.css-172ywp3').should('have.text', 'Connection');
      cy.get('.css-ft9ciy').should('have.text', 'keep-alive');

      // Show preheat scheduler clusters ID.
      cy.get('.show_schedulerClustersID__iQd1s').should('have.text', 1);

      // Show preheat Created At.
      cy.get(':nth-child(9) > .MuiChip-root').should('have.text', '2023-12-13 11:58:53');

      // Click the show error log button.
      cy.get('#status > .MuiButtonBase-root').click();
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
      cy.get(':nth-child(1) > .show_informationContent__wKGxa').should('have.text', 8);

      // Show preheat status.
      cy.get('#status')
        .should('have.text', 'SUCCESS')
        .and('have.css', 'background-color', 'rgb(34, 139, 34)')
        .find('#error-log-icon')
        .and('not.exist');

      // Show preheat hearder.
      cy.get(':nth-child(7) > .MuiPaper-root').children().should('have.length', 2);
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

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist');
      cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').should('have.text', 11);

      // Show preheat id.
      cy.get(':nth-child(1) > .show_informationContent__wKGxa').should('have.text', 11);

      // Show preheat status.
      cy.get('#status')
        .should('have.text', 'PENDING')
        .and('have.css', 'background-color', 'rgb(219, 171, 10)')
        .find('#pending-icon')
        .and('exist')
        .find('#error-log-icon')
        .and('not.exist');

      // Show preheat hearder.
      cy.get(':nth-child(7) > .MuiPaper-root').children().should('have.length', 1);

      cy.wait(6000);

      // Check how many times the API should be executed after six seconds.
      cy.get('@preheat').then(() => {
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
            body: failurePreheat,
          });
        },
      );

      // Preheat fails after three seconds.
      cy.wait(3000);

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
      cy.get('.MuiBreadcrumbs-ol').should('be.visible').and('contain', 'preheats');

      cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').should('have.text', '-');
    });

    it('preheat information should appear empty', () => {
      // Show preheat id.
      cy.get(':nth-child(1) > .show_informationContent__wKGxa').should('have.text', 0);

      // Show preheat description.
      cy.get('.MuiPaper-root > :nth-child(2) > .show_informationContent__wKGxa').should('have.text', '-');

      // Show preheat status.
      cy.get('#status').should('not.exist');

      // Show preheat url.
      cy.get(':nth-child(4) > .show_informationContent__wKGxa').should('have.text', '-');

      // Show preheat filter.

      cy.get('.css-2imjyh > .MuiTypography-root').should('have.text', '-');

      // Show preheat tag.
      cy.get(':nth-child(6) > .show_informationContent__wKGxa.MuiBox-root > .MuiTypography-root').should(
        'have.text',
        '-',
      );

      // Show preheat hearder.
      cy.get(':nth-child(7) > .show_informationContent__wKGxa').should('have.text', '-');

      // Show preheat scheduler clusters ID.
      cy.get('.show_schedulerClustersID__iQd1s').should('have.text', '-');

      // Show preheat Created At.
      cy.get(':nth-child(9) > .show_informationContent__wKGxa').should('have.text', '-');
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
      cy.get('.MuiBreadcrumbs-ol').should('be.visible').and('contain', 'preheats');

      cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').should('have.text', '-');
    });

    it('preheat information should appear empty', () => {
      // Show preheat id.
      cy.get(':nth-child(1) > .show_informationContent__wKGxa').should('have.text', 0);

      // Show preheat description.
      cy.get('.MuiPaper-root > :nth-child(2) > .show_informationContent__wKGxa').should('have.text', '-');

      // Show preheat status.
      cy.get('#status').should('not.exist');

      // Show preheat url.
      cy.get(':nth-child(4) > .show_informationContent__wKGxa').should('have.text', '-');

      // Show preheat filter.

      cy.get('.css-2imjyh > .MuiTypography-root').should('have.text', '-');

      // Show preheat tag.
      cy.get(':nth-child(6) > .show_informationContent__wKGxa.MuiBox-root > .MuiTypography-root').should(
        'have.text',
        '-',
      );

      // Show preheat hearder.
      cy.get(':nth-child(7) > .show_informationContent__wKGxa').should('have.text', '-');

      // Show preheat scheduler clusters ID.
      cy.get('.show_schedulerClustersID__iQd1s').should('have.text', '-');

      // Show preheat Created At.
      cy.get(':nth-child(9) > .show_informationContent__wKGxa').should('have.text', '-');
    });

    it('when the status is pending, preheat API error response', () => {
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

      cy.visit('/jobs/preheats/11');

      // Check for breadcrumb.
      cy.get('.MuiBreadcrumbs-ol').should('exist');
      cy.get('.MuiBreadcrumbs-ol > :nth-child(5) > .MuiTypography-root').should('have.text', 11);

      // Show preheat id.
      cy.get(':nth-child(1) > .show_informationContent__wKGxa').should('have.text', 11);

      // Show preheat status.
      cy.get('#status')
        .should('have.text', 'PENDING')
        .and('have.css', 'background-color', 'rgb(219, 171, 10)')
        .find('#pending-icon')
        .and('exist')
        .find('#error-log-icon')
        .and('not.exist');

      // Show preheat hearder.
      cy.get(':nth-child(7) > .MuiPaper-root').children().should('have.length', 1);

      cy.wait(6000);

      // Check how many times the API should be executed after six seconds.
      cy.get('@preheat').then(() => {
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

      // Preheat API error response after three seconds.
      cy.wait(3000);

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    });
  });
});
