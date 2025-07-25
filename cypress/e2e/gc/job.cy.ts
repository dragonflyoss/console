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
    cy.visit('/gc/job');
  });

  it('when data is loaded', () => {
    // Displays the Job ttl.
    cy.get('#job-ttl').should('have.text', '13 days');

    // Displays the GC history.
    cy.get('#history').should('have.text', '13');
    cy.get('#pagination').should('exist');

    // Display gc history information.
    cy.get('#trigger-117').should('have.text', 'Manual');

    // Go to last page.
    cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

    // Display gc history information.
    cy.get('#id-101').should('have.text', 101);
    cy.get('#ttl-101').should('have.text', '13 days');
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

    cy.get('#job-ttl').should('have.text', '-');
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
    cy.get('.MuiAlert-message').should('have.text', 'You have successfully recycled 10 job!');

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
    cy.get('#job-ttl').should('have.text', '13 days');
    cy.get('#update').click();

    cy.get('#job-ttl-input').clear();
    cy.get('#job-ttl-input').type('100');

    cy.get('#ttl-error').should(
      'have.text',
      'Fill in the number, and the time value must be greater than 0 and less than 30 days.',
    );

    cy.get('#job-unit').click();
    cy.get('[data-value="hours"]').click();

    cy.get('#job-ttl-input').clear();
    cy.get('#job-ttl-input').type('2000');

    // Shou error.
    cy.get('#ttl-error').should('have.text', 'Fill in the number, the length is 1-1000.');

    cy.get('#job-ttl-input').clear();
    cy.get('#job-ttl-input').type('1');

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

    cy.get('#job-ttl').should('have.text', '21 days');
  });

  it('can no update ttl', () => {
    cy.get('#job-ttl').should('have.text', '13 days');
    cy.get('#update').click();

    cy.get('#job-ttl-input').clear();
    cy.get('#job-ttl-input').type('1');

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
