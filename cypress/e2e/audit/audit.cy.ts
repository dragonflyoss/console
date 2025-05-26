import audit from '../../fixtures/audit/audits.json';
import paginationAudit from '../../fixtures/audit/pagination-audits.json';
import users from '../../fixtures/users/users.json';
import userAudit from '../../fixtures/audit/user.audits.json';
import operationGetAudit from '../../fixtures/audit/operation-get-audits.json';
import operationPostAudit from '../../fixtures/audit/operation-post-audits.json';
import operationPutAudit from '../../fixtures/audit/operation-put-audits.json';
import operationDeleteAudit from '../../fixtures/audit/operation-delete-audits.json';
import operationPatchAudit from '../../fixtures/audit/operation-patch-audits.json';
import actorTypeUserAudit from '../../fixtures/audit/actor-type-user-audits.json';
import actorTypeUnknownAudit from '../../fixtures/audit/actor-type-unknown-audits.json';
import actorTypePatAudit from '../../fixtures/audit/actor-type-pat-audits.json';
import failureAudit from '../../fixtures/audit/failure-audits.json';

describe('audit', () => {
  beforeEach(() => {
    cy.signin();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/audits?page=1&per_page=10',
      },
      (req) => {
        req.reply((res: any) => {
          const responseHeaders = {
            ...res.headers,
            Link: '</api/v1/audits?page=1&per_page=10>;rel=prev,</api/v1/audits?page=2&per_page=10>;rel=next,</api/v1/audits?page=1&per_page=10>;rel=first,</api/v1/audits?page=2&per_page=10>;rel=last',
          };
          res.send(200, audit, responseHeaders);
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/audits?page=2&per_page=10',
      },
      (req) => {
        req.reply((res: any) => {
          const responseHeaders = {
            ...res.headers,
            Link: '</api/v1/audits?page=1&per_page=10>;rel=prev,</api/v1/audits?page=3&per_page=10>;rel=next,</api/v1/audits?page=1&per_page=10>;rel=first,</api/v1/audits?page=2&per_page=10>;rel=last',
          };
          res.send(200, paginationAudit, responseHeaders);
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: users,
        });
      },
    );
    cy.visit('/audit');
    cy.viewport(1440, 1080);
  });

    it('when data is loaded', () => {
      // Go to last page.
      cy.get('.MuiPagination-ul > :nth-child(4)').click();

      // Can display user name.
      cy.get('#user-11').should('have.text', 'unknown');

      // Can display path.
      cy.get('#path-11').should('have.text', '/api/v1/users/signin');

      // Can display operation.
      cy.get('#operation-11').should('have.text', 'POST');

      // Can display actor type.
      cy.get('#actor-type-11').should('have.text', 'UNKNOWN');

      // Can display status code.
      cy.get('#status-code-11').should('have.text', '401');

      // Can display status.
      cy.get('#status-11').should('have.text', 'FAILURE');

      cy.get('#user-13').should('have.text', 'jack');

      // Can display different operation.
      cy.get('#operation-13').should('have.text', 'GET');
      cy.get('#operation-14').should('have.text', 'PATCH');
      cy.get('#operation-15').should('have.text', 'DELETE');
      cy.get('#operation-16').should('have.text', 'PUT');
    });

    describe('search', () => {
      it('should search user name', () => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v1/audits?actor_name=jack&page=1&per_page=10',
          },
          (req) => {
            req.reply((res: any) => {
              const responseHeaders = {
                ...res.headers,
                Link: '</api/v1/audits?actor_name=jack&page=1&per_page=10>;rel=prev,</api/v1/audits?actor_name=jack&page=2&per_page=10>;rel=next,</api/v1/audits?actor_name=jack&page=1&per_page=10>;rel=first,</api/v1/audits?actor_name=jack&page=1&per_page=10>;rel=last',
              };
              res.send(200, userAudit, responseHeaders);
            });
          },
        );

        cy.get('#actor-name').type('jack');
        cy.get('#audit-table-body').children().and('have.length', 3);
        cy.get('#user-5').should('have.text', 'jack');
      });

      it('should filter by operation', () => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v1/audits?operation=GET&page=1&per_page=10',
          },
          (req) => {
            req.reply((res: any) => {
              const responseHeaders = {
                ...res.headers,
                Link: '</api/v1/audits?operation=GET&page=1&per_page=10>;rel=prev,</api/v1/audits?operation=GET&page=2&per_page=10>;rel=next,</api/v1/audits?operation=GET&page=1&per_page=10>;rel=first,</api/v1/audits?operation=GET&page=1&per_page=10>;rel=last',
              };
              res.send(200, operationGetAudit, responseHeaders);
            });
          },
        );

        cy.get('#operation-select').click();

        // Select Get.
        cy.get('#GET').click();

        cy.get('#operation-13').should('have.text', 'GET');

        cy.intercept(
          {
            method: 'GET',
            url: '/api/v1/audits?operation=POST&page=1&per_page=10',
          },
          (req) => {
            req.reply((res: any) => {
              const responseHeaders = {
                ...res.headers,
                Link: '</api/v1/audits?operation=POST&page=1&per_page=10>;rel=prev,</api/v1/audits?operation=POST&page=2&per_page=10>;rel=next,</api/v1/audits?operation=POST&page=1&per_page=10>;rel=first,</api/v1/audits?operation=POST&page=1&per_page=10>;rel=last',
              };
              res.send(200, operationPostAudit, responseHeaders);
            });
          },
        );

        cy.get('#operation-select').click();

        // Select Post.
        cy.get('#POST').click();

        cy.get('#audit-table-body').children().and('have.length', 3);

        cy.get('#operation-10').should('have.text', 'POST');

        cy.intercept(
          {
            method: 'GET',
            url: '/api/v1/audits?operation=PATCH&page=1&per_page=10',
          },
          (req) => {
            req.reply((res: any) => {
              const responseHeaders = {
                ...res.headers,
                Link: '</api/v1/audits?operation=PATCH&page=1&per_page=10>;rel=prev,</api/v1/audits?operation=PATCH&page=2&per_page=10>;rel=next,</api/v1/audits?operation=PATCH&page=1&per_page=10>;rel=first,</api/v1/audits?operation=PATCH&page=1&per_page=10>;rel=last',
              };
              res.send(200, operationPatchAudit, responseHeaders);
            });
          },
        );

        cy.get('#operation-select').click();

        // Select Patch.
        cy.get('#PATCH').click();

        cy.get('#audit-table-body').children().and('have.length', 1);

        cy.get('#operation-14').should('have.text', 'PATCH');

        cy.intercept(
          {
            method: 'GET',
            url: '/api/v1/audits?operation=DELETE&page=1&per_page=10',
          },
          (req) => {
            req.reply((res: any) => {
              const responseHeaders = {
                ...res.headers,
                Link: '</api/v1/audits?operation=DELETE&page=1&per_page=10>;rel=prev,</api/v1/audits?operation=DELETE&page=2&per_page=10>;rel=next,</api/v1/audits?operation=DELETE&page=1&per_page=10>;rel=first,</api/v1/audits?operation=DELETE&page=1&per_page=10>;rel=last',
              };
              res.send(200, operationDeleteAudit, responseHeaders);
            });
          },
        );

        cy.get('#operation-select').click();

        // Select Delete.
        cy.get('#DELETE').click();

        cy.get('#audit-table-body').children().and('have.length', 1);

        cy.get('#operation-15').should('have.text', 'DELETE');

        cy.intercept(
          {
            method: 'GET',
            url: '/api/v1/audits?operation=PUT&page=1&per_page=10',
          },
          (req) => {
            req.reply((res: any) => {
              const responseHeaders = {
                ...res.headers,
                Link: '</api/v1/audits?operation=PUT&page=1&per_page=10>;rel=prev,</api/v1/audits?operation=PUT&page=2&per_page=10>;rel=next,</api/v1/audits?operation=PUT&page=1&per_page=10>;rel=first,</api/v1/audits?operation=PUT&page=1&per_page=10>;rel=last',
              };
              res.send(200, operationPutAudit, responseHeaders);
            });
          },
        );

        cy.get('#operation-select').click();

        // Select Put.
        cy.get('#PUT').click();

        cy.get('#audit-table-body').children().and('have.length', 1);

        cy.get('#operation-16').should('have.text', 'PUT');
      });

      it('should filter by actor type', () => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v1/audits?actor_type=USER&page=1&per_page=10',
          },
          (req) => {
            req.reply((res: any) => {
              const responseHeaders = {
                ...res.headers,
                Link: '</api/v1/audits?actor_type=USER&page=1&per_page=10>;rel=prev,</api/v1/audits?actor_type=USER&page=2&per_page=10>;rel=next,</api/v1/audits?actor_type=USER&page=1&per_page=10>;rel=first,</api/v1/audits?actor_type=USER&page=1&per_page=10>;rel=last',
              };
              res.send(200, actorTypeUserAudit, responseHeaders);
            });
          },
        );

        cy.get('#actor-type-select').click();

        // Select User for Actor Type.
        cy.get('#USER').click();

        cy.get('#audit-table-body').children().and('have.length', 9);

        cy.intercept(
          {
            method: 'GET',
            url: '/api/v1/audits?actor_type=PAT&page=1&per_page=10',
          },
          (req) => {
            req.reply((res: any) => {
              const responseHeaders = {
                ...res.headers,
                Link: '</api/v1/audits?actor_type=PAT&page=1&per_page=10>;rel=prev,</api/v1/audits?actor_type=PAT&page=2&per_page=10>;rel=next,</api/v1/audits?actor_type=PAT&page=1&per_page=10>;rel=first,</api/v1/audits?actor_type=PAT&page=1&per_page=10>;rel=last',
              };
              res.send(200, actorTypePatAudit, responseHeaders);
            });
          },
        );

        cy.get('#actor-type-select').click();

        // Select Pat for Actor Type.
        cy.get('#PAT').click();
        cy.get('#actor-type-12').should('have.text', 'PAT');

        cy.get('#audit-table-body').children().and('have.length', 1);

        cy.intercept(
          {
            method: 'GET',
            url: '/api/v1/audits?actor_type=UNKNOWN&page=1&per_page=10',
          },
          (req) => {
            req.reply((res: any) => {
              const responseHeaders = {
                ...res.headers,
                Link: '</api/v1/audits?actor_type=UNKNOWN&page=1&per_page=10>;rel=prev,</api/v1/audits?actor_type=UNKNOWN&page=2&per_page=10>;rel=next,</api/v1/audits?actor_type=UNKNOWN&page=1&per_page=10>;rel=first,</api/v1/audits?actor_type=UNKNOWN&page=1&per_page=10>;rel=last',
              };
              res.send(200, actorTypeUnknownAudit, responseHeaders);
            });
          },
        );

        cy.get('#actor-type-select').click();

        // Select Pat for Actor Type.
        cy.get('#UNKNOWN').click();
        cy.get('#actor-type-7').should('have.text', 'UNKNOWN');

        cy.get('#audit-table-body').children().and('have.length', 3);
      });

      it('should filter by status', () => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v1/audits?page=1&per_page=10&state=FAILURE',
          },
          (req) => {
            req.reply((res: any) => {
              const responseHeaders = {
                ...res.headers,
                Link: '</api/v1/audits?page=1&per_page=10&state=FAILURE>;rel=prev,</api/v1/audits?page=2&per_page=10&state=FAILURE>;rel=next,</api/v1/audits?page=1&per_page=10&state=FAILURE>;rel=first,</api/v1/audits?page=1&per_page=10&state=FAILURE>;rel=last',
              };
              res.send(200, failureAudit, responseHeaders);
            });
          },
        );

        cy.get('#states-select').click();
        cy.get('#FAILURE').click();

        cy.get('#audit-table-body').children().and('have.length', 2);
      });

      it('should filter by path', () => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v1/audits?page=1&path=%2Fapi%2Fv1%2Fclusters%2F1&per_page=10',
          },
          (req) => {
            req.reply((res: any) => {
              const responseHeaders = {
                ...res.headers,
                Link: '</api/v1/audits?page=1&path=%2Fapi%2Fv1%2Fclusters%2F1&per_page=10>;rel=prev,</api/v1/audits?page=1&path=%2Fapi%2Fv1%2Fclusters%2F1&per_page=10>;rel=next,</api/v1/audits?page=1&path=%2Fapi%2Fv1%2Fclusters%2F1&per_page=10>;rel=first,</api/v1/audits?page=1&path=%2Fapi%2Fv1%2Fclusters%2F1&per_page=10>;rel=last',
              };
              res.send(200, operationPatchAudit, responseHeaders);
            });
          },
        );

        cy.get('#search').type('/api/v1/clusters/1');
      });
    });

    it('when no data is loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/audits?page=1&per_page=10',
        },
        (req) => {
          req.reply((res: any) => {
            const responseHeaders = {
              ...res.headers,
              Link: '</api/v1/audits?page=1&per_page=10>;rel=prev,</api/v1/audits?page=3&per_page=10>;rel=next,</api/v1/audits?page=1&per_page=10>;rel=first,</api/v1/audits?page=2&per_page=10>;rel=last',
            };
            res.send(200, [], responseHeaders);
          });
        },
      );

      cy.get('#no-audit-table').should('have.text', `You don't have audit logs.`);
    });

  describe('should handle API error response', () => {
    it('should handle user API error response', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#error-message').should('have.text', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('#error-message').should('not.exist');
    });

    it('should handle audit API error response', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/audits?page=1&per_page=10',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#error-message').should('have.text', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('#error-message').should('not.exist');
    });
  });
});
