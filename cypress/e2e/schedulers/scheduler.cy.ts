import cluster from '../../fixtures/clusters/cluster/cluster.json';
import schedulers from '../../fixtures/clusters/cluster/scheduler.json';
import scheduler from '../../fixtures/schedulers/scheduler.json';
import schedulerInactive from '../../fixtures/schedulers/scheduler-inactive.json';

describe('Scheduler', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: cluster,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: schedulers,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/schedulers/7',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: scheduler,
        });
      },
    );

    cy.signin();
    cy.visit('/clusters/1/schedulers/7');

    cy.viewport(1440, 1080);
  });

  it('click the hostname', () => {
    cy.visit('/clusters/1/schedulers');

    cy.get('#table').click();

    cy.get('#hostname-scheduler-51').should('have.text', 'scheduler-51');

    cy.get('#hostname-scheduler-51').click();

    // Then I see that the current page is the clusters/1/schedulers/7!
    cy.url().should('include', '/clusters/1/schedulers/51');
  });

  it('click the breadcrumb', () => {
    // Check for breadcrumb.
    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
      .should('be.visible')
      .and('contain', 'scheduler-cluster-1');

    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root').click();

    // Then I see that the current page is the clusters/1!
    cy.url().should('include', '/clusters/1');
  });

  describe('when data is loaded', () => {
    it('can display breadcrumb', () => {
      // Show isloading.
      cy.get('[data-testid="isloading"]').should('be.exist');

      cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
        .should('be.visible')
        .and('contain', 'scheduler-cluster-1');

      cy.get(':nth-child(7) > .MuiTypography-root').should('be.visible').and('contain', 'scheduler-7');

      cy.get('[data-testid="isloading"]').should('not.exist');
    });

    it('can display active scheduler', () => {
      // Show id.
      cy.get('#id').should('be.visible').and('contain', '7');

      // Show hostname.
      cy.get('#hostname').should('be.visible').and('contain', 'scheduler-7');

      // Show ip.
      cy.get('#ip').should('be.visible').and('contain', '30.44.98.202');

      // Show cluster id.
      cy.get('#cluster-id').should('be.visible').and('contain', '1');

      // Show port.
      cy.get('#port').should('be.visible').and('contain', '8002');

      // Show Active background color.
      cy.get('#status')
        .should('be.visible')
        .and('contain', 'Active')
        .and('have.css', 'background-color', 'rgb(0, 129, 112)');

      // Show features.
      cy.get('#features').should('be.visible').and('contain', 'Schedule').and('contain', 'Preheat');

      // Show created at.
      cy.get('#created-at').should('have.text', '2023-11-09 07:09:06');

      // Show updated at.
      cy.get('#updated-at').should('have.text', '2023-11-09 07:09:11');
    });

    it('can display inactive scheduler', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers/2',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: schedulerInactive,
          });
        },
      );

      cy.visit('/clusters/1/schedulers/2');

      // Show hostname.
      cy.get('#hostname').should('be.visible').and('contain', 'scheduler-2');

      // Show Inactive background color.
      cy.get('#status')
        .should('be.visible')
        .and('contain', 'Inactive')
        .and('have.css', 'background-color', 'rgb(93, 95, 97)');
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
      cy.intercept({ method: 'GET', url: '/api/v1/schedulers/7' }, (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      });
    });

    it('unable to display breadcrumb', () => {
      cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
        .should('be.visible')
        .and('contain', 'scheduler-cluster-1');

      cy.get(':nth-child(7) > .MuiTypography-root').should('be.visible').and('contain', '-');
    });

    it('scheduler should render empty status', () => {
      // Show ID.
      cy.get('#id').should('contain', '-');

      // Show Hostname.
      cy.get('#hostname').should('contain', '-');

      // Show IP.
      cy.get('#ip').should('contain', '-');

      // Show Cluster ID.
      cy.get('#cluster-id').should('contain', '-');

      // Show Port.
      cy.get('#port').should('contain', '-');

      // Show Start.
      cy.get('#status').should('contain', '-');

      // Show Features.
      cy.get('#features').should('contain', '-');

      // Show Created At.
      cy.get('#created-at').should('contain', '-');

      // Show Updated At.
      cy.get('#updated-at').should('contain', '-');
    });
  });

  describe('should handle API error response', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers/1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );
      cy.visit('/clusters/1/schedulers/1');
    });

    it('show error message', () => {
      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiAlert-message').should('not.exist');
    });

    it('unable to display breadcrumb', () => {
      cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
        .should('be.visible')
        .and('contain', 'scheduler-cluster-1');

      cy.get(':nth-child(7) > .MuiTypography-root').should('be.visible').and('contain', '-');
    });

    it('scheduler should render empty status', () => {
      // Show ID.
      cy.get('#id').should('contain', '-');

      // Show Hostname.
      cy.get('#hostname').should('contain', '-');

      // Show IP.
      cy.get('#ip').should('contain', '-');

      // Show Cluster ID.
      cy.get('#cluster-id').should('contain', '-');

      // Show Port.
      cy.get('#port').should('contain', '-');

      // Show Start.
      cy.get('#status').should('contain', '-');

      // Show Features.
      cy.get('#features').should('contain', '-');

      // Show Created At.
      cy.get('#created-at').should('contain', '-');

      // Show Updated At.
      cy.get('#updated-at').should('contain', '-');
    });
  });
});
