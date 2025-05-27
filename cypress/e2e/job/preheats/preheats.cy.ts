import preheats from '../../../fixtures/job/preheats/preheats.json';
import paginationPreheats from '../../../fixtures/job/preheats/pagination-preheats.json';
import successPreheats from '../../../fixtures/job/preheats/success-preheats.json';
import failurePreheats from '../../../fixtures/job/preheats/failure-preheats.json';
import pendingPreheats from '../../../fixtures/job/preheats/pending-preheats.json';
import failurePreheat from '../../../fixtures/job/preheats/failure-preheat.json';
import successPreheat from '../../../fixtures/job/preheats/success-preheat.json';
import pendingPreheat from '../../../fixtures/job/preheats/pending-preheat.json';

declare const expect: Chai.ExpectStatic;

describe('Preheats', () => {
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
            Link: '</api/v1/jobs?page=1&per_page=10>;rel=prev,</api/v1/jobs?page=2&per_page=10>;rel=next,</api/v1/jobs?page=1&per_page=10>;rel=first,</api/v1/jobs?page=2&per_page=10>;rel=last',
          };
          res.send(200, preheats, responseHeaders);
        });
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=2&per_page=10&type=preheat',
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
          url: '/api/v1/jobs?page=1&per_page=10&type=preheat',
        },
        (req) => {
          req.reply((res: any) => {
            res.setDelay(2000);
            const responseHeaders = {
              ...res.headers,
              Link: '</api/v1/jobs?page=1&per_page=10>;rel=prev,</api/v1/jobs?page=2&per_page=10>;rel=next,</api/v1/jobs?page=1&per_page=10>;rel=first,</api/v1/jobs?page=2&per_page=10>;rel=last',
            };
            res.send(200, preheats, responseHeaders);
          });
          interceptCount++;
        },
      ).as('preheats');
      cy.get('[data-testid="isloading"]').should('be.exist');

      cy.wait(60000);

      // Executed every 3 seconds, it should be executed 2 times after 6 seconds.
      cy.get('@preheats').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(2, 0);
      });

      cy.get('[data-testid="isloading"]').should('not.exist');
      cy.get('.MuiList-root > :nth-child(3) > .MuiButtonBase-root').click();

      // The preheating status is displayed as PENDING.
      cy.get('#PENDING-11').should('exist');
      cy.get('#id-11').should('have.text', 11);

      // cy.get('#created_at-11').should('have.text', '2023-03-23 16:29:18');
      cy.get('#description-11').should('have.text', 'This is a preheat task with status pending');

      // The preheating status is displayed as FAILURE.
      cy.get('#FAILURE-10').should('exist');
      cy.get('#description-10').should('have.text', 'This is a preheat task with status failure');

      // The preheating status is displayed as SUCCESS.
      cy.get('#list-8 > .css-1mlhis1').should('exist').find('#SUCCESS-8').should('exist');
      cy.get('#description-8').should('have.text', 'This is a preheat task with status success');
    });

    it('should display preheat success list', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs?page=1&per_page=10&state=SUCCESS&type=preheat',
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
          url: '/api/v1/jobs?page=1&per_page=10&state=FAILURE&type=preheat',
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
          url: '/api/v1/jobs?page=1&per_page=10&state=PENDING&type=preheat',
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

      cy.wait(60000);

      // The API should poll.
      cy.get('@preheats').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(2, 0);
      });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs?page=1&per_page=10&state=PENDING&type=preheat',
        },
        (req) => {
          req.reply({
            statusCode: 401,
            body: { message: 'Unauthorized' },
          });
        },
      );

      cy.wait(60000);

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    });
  });

  it('when no data is loaded', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10&type=preheat',
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
    cy.get('#no-preheat').should('be.visible').and('contain', `You don't have any preheat tasks.`);
  });

  it('should handle API error response', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10&type=preheat',
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
    cy.get('#no-preheat').should('be.visible').and('contain', `You don't have any preheat tasks.`);
  });

  describe('pagination', () => {
    it('pagination updates results and page number', () => {
      // Check number of pagination.
      cy.get('#preheat-pagination > .MuiPagination-ul').children().should('have.length', 4);

      cy.get('#preheat-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');

      // The preheating status is displayed as PENDING.
      cy.get('#PENDING-11').should('exist');
      cy.get('#id-11').should('have.text', 11);
    });

    it('when pagination changes, different page results are rendered', () => {
      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#preheat-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#preheats-list').children().should('have.length', 1);

      cy.get('#SUCCESS-1').should('exist');
      cy.get('#id-1').should('have.text', 1);
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
      cy.get('#preheat-1').click();

      // Then I see that the current page is the show update personal-access-tokens.
      cy.url().should('include', '/jobs/preheats/1');

      // Go back to the last page。
      cy.go('back');

      // Check the current page number.
      cy.get('#preheat-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#list-1').should('exist').find('#SUCCESS-1').should('exist');
    });
  });

  describe('search', () => {
    it('should search for successful preheat', () => {
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

      // Check the list.
      cy.get('#preheats-list').children().should('have.length', 10);

      // should search for preheat ID.
      cy.get('#search').type('8');

      // Check the number of preheat lists is 1.
      cy.get('#preheats-list').children().should('have.length', 1);

      cy.get('#id-8').should('have.text', 8);

      cy.get('#search').clear();
      cy.get('#preheats-list').children().should('have.length', 10);
    });

    it('should search for failure preheat', () => {
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

      // Check the list.
      cy.get('#preheats-list').children().should('have.length', 10);

      // should search for preheat ID.
      cy.get('#search').type('10');

      // Check the number of preheat lists is 1.
      cy.get('#preheats-list').children().should('have.length', 1);

      cy.get('#id-10').should('have.text', 10);
    });

    it('should search for pending preheat', () => {
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

      // should search for preheat ID.
      cy.get('#search').type('11');

      cy.wait(60000);

      // Check how many times the API should be executed after six seconds.
      cy.get('@preheat').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(1, 0);
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

      cy.get('#FAILURE-10').should('exist');
    });

    it('should handle API error response', () => {
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

      // should search for preheat ID.
      cy.get('#search').type('6');

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    });
  });
});
