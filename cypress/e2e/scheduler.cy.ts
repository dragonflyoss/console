import root from '../fixtures/api/role-root.json';
import user from '../fixtures/api/user.json';
import cluster from '../fixtures/api/clusters/cluster/cluster.json';
import schedulers from '../fixtures/api/clusters/cluster/scheduler.json';
import scheduler from '../fixtures/api/scheduler.json';

describe('Scheduler', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: user,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/1/roles',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: root,
        });
      },
    );
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
    cy.visit('/clusters/1');

    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    ).should('have.text', 'scheduler-7');

    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > :nth-child(1) > :nth-child(2) > .MuiTypography-root',
    ).click();

    // Then I see that the current page is the clusters/1/schedulers/7!
    cy.url().should('include', '/clusters/1/schedulers/7');
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
      cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
        .should('be.visible')
        .and('contain', 'scheduler-cluster-1');

      cy.get(':nth-child(7) > .MuiTypography-root').should('be.visible').and('contain', 'scheduler-7');
    });

    it('can display active scheduler', () => {
      // Show id.
      cy.get('.show_container__qetel > :nth-child(1) > .css-1n0qe7k-MuiTypography-root')
        .should('be.visible')
        .and('contain', '7');

      // Show hostname.
      cy.get(':nth-child(2) > .css-1n0qe7k-MuiTypography-root').should('be.visible').and('contain', 'scheduler-7');

      // Show ip.
      cy.get(':nth-child(3) > .css-1n0qe7k-MuiTypography-root').should('be.visible').and('contain', '30.44.98.202');

      // Show cluster id.
      cy.get('.show_clusterIDContaine__Gvk7F > .css-1n0qe7k-MuiTypography-root')
        .should('be.visible')
        .and('contain', '1');

      // Show port.
      cy.get('.show_schedulerContainer__euX4O > :nth-child(1) > .css-1n0qe7k-MuiTypography-root')
        .should('be.visible')
        .and('contain', '8002');

      // Show Active background color.
      cy.get(':nth-child(2) > .MuiChip-root')
        .should('be.visible')
        .and('contain', 'Active')
        .and('have.css', 'background-color', 'rgb(46, 143, 121)');

      // Show features.
      cy.get('.show_schedulerContainer__euX4O > :nth-child(3)')
        .should('be.visible')
        .and('contain', 'Schedule')
        .and('contain', 'Preheat');

      // Show created at.
      cy.get(':nth-child(4) > .MuiChip-root').should('have.text', '2023-11-09-15:09');

      // Show updated at.
      cy.get(':nth-child(5) > .MuiChip-root').should('have.text', '2023-11-09-15:09');
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
      cy.get('.show_container__qetel > :nth-child(1) > .css-1n0qe7k-MuiTypography-root').should('contain', '-');

      // Show Hostname.
      cy.get(':nth-child(2) > .css-1n0qe7k-MuiTypography-root').should('contain', '-');

      // Show IP.
      cy.get(':nth-child(3) > .css-1n0qe7k-MuiTypography-root').should('contain', '-');

      // Show Cluster ID.
      cy.get('.show_clusterIDContaine__Gvk7F > .css-1n0qe7k-MuiTypography-root').should('contain', '-');

      // Show Port.
      cy.get('.show_schedulerContainer__euX4O > :nth-child(1) > .css-1n0qe7k-MuiTypography-root').should(
        'contain',
        '-',
      );

      // Show Start.
      cy.get('.show_schedulerContainer__euX4O > :nth-child(2)').should('contain', '-');

      // Show Features.
      cy.get('.show_schedulerContainer__euX4O > :nth-child(3)').should('contain', '-');

      // Show Created At.
      cy.get(':nth-child(4) > .MuiChip-root').should('not.exist');

      // Show Updated At.
      cy.get(':nth-child(5) > .MuiChip-root').should('not.exist');
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
      // Show error message
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
      cy.get('.show_container__qetel > :nth-child(1) > .css-1n0qe7k-MuiTypography-root').should('contain', '-');

      // Show Hostname.
      cy.get(':nth-child(2) > .css-1n0qe7k-MuiTypography-root').should('contain', '-');

      // Show IP.
      cy.get(':nth-child(3) > .css-1n0qe7k-MuiTypography-root').should('contain', '-');

      // Show Cluster ID.
      cy.get('.show_clusterIDContaine__Gvk7F > .css-1n0qe7k-MuiTypography-root').should('contain', '-');

      // Show Port.
      cy.get('.show_schedulerContainer__euX4O > :nth-child(1) > .css-1n0qe7k-MuiTypography-root').should(
        'contain',
        '-',
      );

      // Show Start.
      cy.get('.show_schedulerContainer__euX4O > :nth-child(2)').should('contain', '-');

      // Show Features.
      cy.get('.show_schedulerContainer__euX4O > :nth-child(3)').should('contain', '-');

      // Show Created At.
      cy.get(':nth-child(4) > .MuiChip-root').should('not.exist');

      // Show Updated At.
      cy.get(':nth-child(5) > .MuiChip-root').should('not.exist');
    });
  });
});
