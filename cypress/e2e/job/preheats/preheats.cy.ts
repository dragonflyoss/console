import preheats from '../../../fixtures/job/preheats/preheats.json';
import paginationPreheats from '../../../fixtures/job/preheats/pagination-preheats.json';
import successPreheats from '../../../fixtures/job/preheats/success-preheats.json';
import failurePreheats from '../../../fixtures/job/preheats/failure-preheats.json';
import pendingPreheats from '../../../fixtures/job/preheats/pending-preheats.json';

declare const expect: Chai.ExpectStatic;

describe('Preheats', () => {
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
            Link: '</api/v1/jobs?page=1&per_page=10>;rel=prev,</api/v1/jobs?page=2&per_page=10>;rel=next,</api/v1/jobs?page=1&per_page=10>;rel=first,</api/v1/jobs?page=2&per_page=10>;rel=last',
          };
          res.send(200, preheats, responseHeaders);
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=2&per_page=10',
      },
      (req) => {
        req.reply((res: any) => {
          const responseHeaders = {
            ...res.headers,
            Link: '</api/v1/jobs?page=1&per_page=10>;rel=prev,</api/v1/jobs?page=2&per_page=10>;rel=next,</api/v1/jobs?page=1&per_page=10>;rel=first,</api/v1/jobs?page=2&per_page=10>;rel=last',
          };
          res.send(200, paginationPreheats, responseHeaders);
        });
      },
    );

    cy.visit('/jobs/preheats');
    cy.viewport(1440, 1080);
  });

  describe('when data is loaded', () => {
    it('should display preheat all list', () => {
      let interceptCount = 0;

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs?page=1&per_page=10',
        },
        (req) => {
          req.reply((res: any) => {
            const responseHeaders = {
              ...res.headers,
              Link: '</api/v1/jobs?page=1&per_page=10>;rel=prev,</api/v1/jobs?page=2&per_page=10>;rel=next,</api/v1/jobs?page=1&per_page=10>;rel=first,</api/v1/jobs?page=2&per_page=10>;rel=last',
            };
            res.send(200, preheats, responseHeaders);
          });
          interceptCount++;
        },
      ).as('preheats');

      cy.wait(6000);

      // Executed every 3 seconds, it should be executed 2 times after 6 seconds.
      cy.get('@preheats').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(2, 1);
      });

      cy.get(':nth-child(3) > .css-ibh903-MuiButtonBase-root-MuiListItemButton-root').click();

      // Whether the style selected by menu is Preheat.
      cy.get(
        ':nth-child(3) > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root',
      ).should('have.class', 'Mui-selected');
      cy.get('.css-1g5t85q > .MuiTypography-root').should('be.visible').and('have.text', 'Preheats');

      // The preheating status is displayed as PENDING.
      cy.get('#list-11 > .css-1mlhis1').should('exist').find('#PENDING-11').should('exist');
      cy.get('#list-11 > .css-1mlhis1 > .css-ux5pj > .css-mu8687 > .MuiTypography-body1').should('have.text', 11);
      cy.get('#list-11 > .css-1mlhis1 > .css-18467a > .MuiChip-root').should('have.text', '2023-03-23 16:29:18');
      cy.get('#list-11 > .css-1mlhis1 > .css-ux5pj > .css-mu8687 > .MuiTypography-body2').should(
        'have.text',
        'This is a preheat task with status pending',
      );

      // The preheating status is displayed as FAILURE.
      cy.get('#list-10 > .css-1mlhis1').should('exist').find('#FAILURE-10').should('exist');
      cy.get('#list-10 > .css-1mlhis1 > .css-ux5pj > .css-mu8687 > .MuiTypography-body2').should(
        'have.text',
        'This is a preheat task with status failure',
      );

      // The preheating status is displayed as SUCCESS.
      cy.get('#list-8 > .css-1mlhis1').should('exist').find('#SUCCESS-8').should('exist');
      cy.get('#list-8 > .css-1mlhis1 > .css-ux5pj > .css-mu8687 > .MuiTypography-body2').should(
        'have.text',
        'This is a preheat task with status success',
      );
    });

    it('should display preheat success list', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs?page=1&per_page=10&state=SUCCESS',
        },
        (req) => {
          req.reply((res: any) => {
            const responseHeaders = {
              ...res.headers,
              Link: '</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=prev,</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=next,</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=first,</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=last',
            };
            res.send(200, successPreheats, responseHeaders);
          });
        },
      );

      cy.get('.MuiInputBase-root > #states-select').click();
      cy.get('[data-value="SUCCESS"]').click();

      // Check how many preheat tasks are in success status.
      cy.get('#preheats-list').children().should('have.length', 6);

      cy.get('#preheat-pagination').should('not.exist');
    });

    it('should display preheat failure list', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs?page=1&per_page=10&state=FAILURE',
        },
        (req) => {
          req.reply((res: any) => {
            const responseHeaders = {
              ...res.headers,
              Link: '</api/v1/jobs?page=1&per_page=10&state=FAILURE>;rel=prev,</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=next,</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=first,</api/v1/jobs?page=1&per_page=10&state=SUCCESS>;rel=last',
            };
            res.send(200, failurePreheats, responseHeaders);
          });
        },
      );

      cy.get('.MuiInputBase-root > #states-select').click();
      cy.get('[data-value="FAILURE"]').click();

      // Check how many preheat tasks are in success failure.
      cy.get('#preheats-list').children().should('have.length', 4);
    });

    it('should display preheat pending list', () => {
      let interceptCount = 0;

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs?page=1&per_page=10&state=PENDING',
        },
        (req) => {
          req.reply((res: any) => {
            const responseHeaders = {
              ...res.headers,
              Link: '</api/v1/jobs?page=1&per_page=10&state=PENDING>;rel=prev,</api/v1/jobs?page=2&per_page=10&state=PENDING>;rel=next,</api/v1/jobs?page=1&per_page=10&state=PENDING>;rel=first,</api/v1/jobs?page=0&per_page=10&state=PENDING>;rel=last',
            };

            res.send(200, pendingPreheats, responseHeaders);
          }),
            interceptCount++;
        },
      ).as('preheats');

      cy.get('.MuiInputBase-root > #states-select').click();
      cy.get('[data-value="PENDING"]').click();

      // Check how many preheat tasks are in pending failure.
      cy.get('#preheats-list').children().should('have.length', 1);

      cy.wait(6000);

      // The API should poll.
      cy.get('@preheats').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(3, 1);
      });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs?page=1&per_page=10&state=PENDING',
        },
        (req) => {
          req.reply({
            statusCode: 401,
            body: { message: 'Unauthorized' },
          });
        },
      );

      cy.wait(3000);

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    });
  });

  it('when no data is loaded', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10',
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

    // No preheats list exists.
    cy.get('#preheats-list').should('not.exist');

    // Show You don't have any preheat tasks.
    cy.get('.css-e76tiu').should('be.visible').and('contain', `You don't have any preheat tasks.`);
  });

  it('should handle API error response', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10',
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

    // No preheats list exists.
    cy.get('#preheats-list').should('not.exist');

    // Show You don't have any preheat tasks.
    cy.get('.css-e76tiu').should('be.visible').and('contain', `You don't have any preheat tasks.`);
  });

  describe('pagination', () => {
    it('pagination updates results and page number', () => {
      // Check number of pagination.
      cy.get('#preheat-pagination > .MuiPagination-ul').children().should('have.length', 4);

      cy.get('#preheat-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');

      // The preheating status is displayed as PENDING.
      cy.get('#list-11 > .css-1mlhis1').should('exist').find('#PENDING-11').should('exist');
      cy.get('#list-11 > .css-1mlhis1 > .css-ux5pj > .css-mu8687 > .MuiTypography-body1').should('have.text', 11);
    });

    it('when pagination changes, different page results are rendered', () => {
      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#preheat-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#preheats-list').children().should('have.length', 1);

      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');
      cy.get('.css-mu8687 > .MuiTypography-body1').should('have.text', 1);
    });

    it('when you click refresh, the paginated results and page numbers remain unchanged.', () => {
      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#preheat-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(2000);
      });

      // Check the current page number.
      cy.get('#preheat-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Show page 1 preheat task.
      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');
    });

    it('when returning to the previous page, pagination and results remain unchanged.', () => {
      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#preheat-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');

      // Go to show preheat page.
      cy.get('#preheat-1 > .MuiBox-root').click();

      // Then I see that the current page is the show update personal-access-tokens.
      cy.url().should('include', '/jobs/preheats/1');

      // Go back to the last page。
      cy.go('back');

      // Check the current page number.
      cy.get('#preheat-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');
    });
  });
});
