import config from '../../fixtures/gc/config.json';
import history from '../../fixtures/gc/history.json';
import executeGC from '../../fixtures/gc/execute-gc.json';
import updateConfig from '../../fixtures/gc/update-config.json';

describe('audit', () => {
  beforeEach(() => {
    cy.signin();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/configs?page=1&per_page=10000000',
      },
      (req) => {
        req.reply((res: any) => {
          res.send(200, config);
        });
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10000000&type=gc',
      },
      (req) => {
        req.reply((res: any) => {
          res.send(200, history);
        });
      },
    );

    cy.viewport(1440, 1080);
    cy.visit('/gc/audit');
  });

  it('when data is loaded', () => {
    cy.get('#audit-ttl').should('have.text', '3 Days');

    cy.get('#history').should('have.text', '11');
    cy.get('#pagination').should('exist');

    cy.get('#trigger-119').should('have.text', 'Manual');
  });

  it('when no data is loaded', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/configs?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({ statusCode: 200, body: [] });
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10000000&type=gc',
      },
      (req) => {
        req.reply({ statusCode: 200, body: [] });
      },
    );

    cy.get('#audit-ttl').should('have.text', '-');
    cy.get('#history').should('have.text', '0');
    cy.get('#last-completed').should('have.text', '-');

    cy.get('#pagination').should('not.exist');

    // no history.
    cy.get('#no-history').should('have.text', `You don't have GC history.`);
  });

  it('can execute GC', () => {
    cy.get('#execute-gc').click();
    cy.get('#execute').should('exist');

    // Click cancel button.
    cy.get('#cancel-execute').click();
    cy.get('#execute').should('not.exist');

    cy.get('#execute-gc').click();

    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/jobs',
      },
      async (req) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        req.reply({
          statusCode: 200,
          body: executeGC,
        });
      },
    );

    // Click execute button.
    cy.get('#save-execute').click();

    cy.get('#execute-loading').should('exist');

    cy.wait(1000);
    cy.get('#success-execute-gc').should('exist');

    // Show number of recycled audit log.
    cy.get('.MuiAlert-message').should('have.text', 'You have successfully recycled 10 audit logs!');

    cy.get('#close-execut-icon').click();

    cy.get('#execute').should('not.exist');
  });

  it('can not execute GC', () => {
    cy.get('#execute-gc').click();
    cy.get('#execute').should('exist');

    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/jobs',
      },
      async (req) => {
        req.reply({
          forceNetworkError: true,
        });
      },
    );

    // Click execute button.
    cy.get('#save-execute').click();

    cy.get('#execute-error').should('exist');
  });

  it('should handle API error response', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/configs?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({ forceNetworkError: true });
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs?page=1&per_page=10000000&type=gc',
      },
      (req) => {
        req.reply({ forceNetworkError: true });
      },
    );

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

    // Close error message.
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiAlert-message').should('not.exist');
  });

  it('can update ttl', () => {
    cy.get('#audit-ttl').should('have.text', '3 Days');
    cy.get('#update').click();

    cy.get('#audit-ttl-input').clear();
    cy.get('#audit-ttl-input').type('1');

    cy.intercept(
      {
        method: 'PATCH',
        url: '/api/v1/configs/1',
      },
      async (req) => {
        req.reply({
          statusCode: 200,
          body: {},
        });
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/configs?page=1&per_page=10000000',
      },
      (req) => {
        req.reply((res: any) => {
          res.send(200, updateConfig);
        });
      },
    );

    cy.get('#save-ttl').click();

    cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

    cy.get('#audit-ttl').should('have.text', '21 Days');
  });

  it('can no update ttl', () => {
    cy.get('#audit-ttl').should('have.text', '3 Days');
    cy.get('#update').click();

    cy.get('#audit-ttl-input').clear();
    cy.get('#audit-ttl-input').type('1');

    cy.intercept(
      {
        method: 'PATCH',
        url: '/api/v1/configs/1',
      },
      async (req) => {
        req.reply({
          forceNetworkError: true,
        });
      },
    );

    cy.get('#save-ttl').click();

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
  });
});
