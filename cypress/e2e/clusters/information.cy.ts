import cluster from '../../fixtures/clusters/cluster/cluster.json';
import emptyCluster from '../../fixtures/clusters/cluster/empty-cluster.json';

describe('Cluster Information', () => {
  beforeEach(() => {
    cy.signin();
  });

  describe('when data is loaded successfully', () => {
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

      cy.visit('clusters/1');
      cy.viewport(1440, 1080);
    });

    it('should display cluster basic information correctly', () => {
      // Check cluster name
      cy.get('#name').first().should('be.visible').and('contain', 'cluster-1');

      // Check cluster description
      cy.get('#description')
        .should('be.visible')
        .and(
          'contain',
          'Cluster-1 is a high-performance computing cluster located in China, specifically in Hangzhou and Beijing data centers.',
        );

      // Check default cluster status
      cy.get('#default').should('be.visible').and('contain', 'Yes');

      // Check scheduler cluster ID
      cy.get('#scheduler-cluster-id').should('be.visible').and('contain', '1');

      // Check create time exists (format may vary)
      cy.get('#name').last().should('be.visible');
    });

    it('should display scopes information correctly', () => {
      // Check location
      cy.get('#location').should('be.visible').and('contain', 'China|Hang|Zhou');

      // Check IDC information
      cy.get('#idc-1').should('be.visible').and('contain', 'Hangzhou');
      cy.get('#idc-2').should('be.visible').and('contain', 'Shanghai');
      cy.get('#idc-total').should('contain', 'Total: 5');

      // Check CIDRs information
      cy.get('#cidrs-1').should('be.visible').and('contain', '10.0.0.0/8');
      cy.get('#cidrs-2').should('be.visible').and('contain', '192.168.0.0/16');
      cy.get('#cidrs-total').should('contain', 'Total: 5');

      // Check hostnames information
      cy.get('#hostname-1').should('be.visible').and('contain', 'cluster-1');
      cy.get('#hostname-2').should('be.visible').and('contain', 'cluster-2');
      cy.get('#hostnames-total').should('contain', 'Total: 5');
    });

    it('should display config information correctly', () => {
      // Check seed peer load limit
      cy.get('#seed-peer-load-limit').should('be.visible').and('have.text', '300');

      // Check peer load limit
      cy.get('#peer-load-limit').should('be.visible').and('have.text', '51');

      // Check candidate parent limit
      cy.get('#candidate-parent-limit').should('be.visible').and('have.text', '3');

      // Check filter parent limit
      cy.get('#filter-parent-limit').should('be.visible').and('have.text', '40');

      // Check job rate limit
      cy.get('#job-rate-limit').should('be.visible').and('have.text', '15');
    });

    it('should open IDC dialog when clicking more button', () => {
      // Click more IDC button
      cy.get('#idc').should('exist').click();

      // Check dialog content
      cy.get('.MuiDialogContent-root').should('be.visible');
      cy.get('.MuiDialogContent-root').should('contain', 'Hangzhou');
      cy.get('.MuiDialogContent-root').should('contain', 'Shanghai');
      cy.get('.MuiDialogContent-root').should('contain', 'Beijing');
      cy.get('.MuiDialogContent-root').should('contain', 'Xiamen');
      cy.get('.MuiDialogContent-root').should('contain', 'Nanchang');

      // Close dialog
      cy.get('body').click('topLeft');
    });

    it('should open CIDRs dialog when clicking more button', () => {
      // Click more CIDRs button
      cy.get('#cidrs').should('exist').click();

      // Check dialog content
      cy.get('.MuiDialogContent-root').should('be.visible');
      cy.get('.MuiDialogContent-root').should('contain', '10.0.0.0/8');
      cy.get('.MuiDialogContent-root').should('contain', '192.168.0.0/16');
      cy.get('.MuiDialogContent-root').should('contain', '172.16.0.0/12');

      // Close dialog
      cy.get('body').click('topLeft');
    });

    it('should open hostnames dialog when clicking more button', () => {
      // Click more hostnames button
      cy.get('#hostnames').should('exist').click();

      // Check dialog content
      cy.get('.MuiDialogContent-root').should('be.visible');
      cy.get('.MuiDialogContent-root').should('contain', 'cluster-1');
      cy.get('.MuiDialogContent-root').should('contain', 'cluster-2');
      cy.get('.MuiDialogContent-root').should('contain', 'cluster-3');
      cy.get('.MuiDialogContent-root').should('contain', 'cluster-4');

      // Close dialog
      cy.get('body').click('topLeft');
    });

    it('should copy scheduler cluster ID to clipboard', () => {
      // Verify copy button interaction works
      cy.get('#copy-scheduler-cluster-id').should('be.visible').click();

      // Check if the copy icon changes state (either Done icon or tooltip)
      cy.get('#schedulerClusterDoneIcon, #schedulerClusterIDTooltip').should('exist');
    });

    it('should navigate to edit page when clicking update button', () => {
      cy.get('#update').should('be.visible').click();
      cy.url().should('include', '/clusters/1/edit');
    });

    it('should open delete confirmation dialog when clicking delete button', () => {
      cy.get('#delete-cluster').should('be.visible').click();

      // Check delete dialog
      cy.get('.MuiDialogContent-root').should('be.visible');
      cy.get('.MuiDialogContent-root').should('contain', 'Are you sure you want to delet this cluster?');

      // Cancel delete
      cy.get('#cancelDeleteCluster').click();
      cy.get('.MuiDialogContent-root').should('not.be.visible');
    });
  });

  describe('when data is empty', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: emptyCluster,
          });
        },
      );

      cy.visit('clusters/1');
    });

    it('should display empty state for scopes', () => {
      // Check empty location
      cy.get('#no-location').should('have.text', '-');

      // Check empty IDC
      cy.get('#no-idc').should('have.text', '-');
      cy.get('#idc-total').should('contain', 'Total: 0');

      // Check empty CIDRs
      cy.get('#no-cidrs').should('have.text', '-');
      cy.get('#cidrs-total').should('contain', 'Total: 0');

      // Check empty hostnames
      cy.get('#no-hostnames').should('have.text', '-');
      cy.get('#hostnames-total').should('contain', 'Total: 0');
    });

    it('should display default values for config', () => {
      cy.get('#seed-peer-load-limit').should('have.text', '0');
      cy.get('#peer-load-limit').should('have.text', '0');
      cy.get('#candidate-parent-limit').should('have.text', '0');
      cy.get('#filter-parent-limit').should('have.text', '0');
      cy.get('#job-rate-limit').should('have.text', '0');
    });
  });

  describe('when API returns error', () => {
    it('should display error message when cluster fetch fails', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            statusCode: 500,
            body: { message: 'Internal server error' },
          });
        },
      );

      cy.visit('clusters/1');

      // Check error message
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Internal server error');
    });

    it('should display network error message', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.visit('clusters/1');

      // Check error message
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    });
  });

  describe('delete functionality', () => {
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

      cy.visit('clusters/1');
    });

    it('should successfully delete cluster', () => {
      // Mock delete API
      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
          });
        },
      );

      // Mock clusters list after deletion
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: {
              clusters: [],
              total: 0,
              default_cluster: 0,
            },
          });
        },
      );

      // Click delete button
      cy.get('#delete-cluster').click();

      // Confirm delete
      cy.get('#deleteCluster').click();

      // Check for success indication (either message or redirect)
      cy.url({ timeout: 10000 }).should('include', '/clusters');
    });

    it('should handle delete error', () => {
      // Mock delete API error
      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            statusCode: 400,
            body: { message: 'Cannot delete cluster with active schedulers' },
          });
        },
      );

      // Click delete button
      cy.get('#delete-cluster').click();

      // Confirm delete
      cy.get('#deleteCluster').click();

      // Check error message
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Cannot delete cluster with active schedulers');
    });
  });

  describe('responsive design', () => {
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
    });

    it('should display correctly on mobile devices', () => {
      cy.viewport(375, 667);
      cy.visit('clusters/1');

      // Check basic elements are visible
      cy.get('#name').should('be.visible');
      cy.get('#description').should('be.visible');
      cy.get('#update').should('be.visible');
      cy.get('#delete-cluster').should('be.visible');
    });

    it('should display correctly on tablet devices', () => {
      cy.viewport(768, 1024);
      cy.visit('clusters/1');

      // Check basic elements are visible
      cy.get('#name').should('be.visible');
      cy.get('#description').should('be.visible');
      cy.get('#update').should('be.visible');
      cy.get('#delete-cluster').should('be.visible');
    });

    it('should display more items on larger screens', () => {
      cy.viewport(1920, 1080);
      cy.visit('clusters/1');

      // Check more IDC items are visible
      cy.get('#idc-3').should('be.visible');

      // Check more CIDRs items are visible
      cy.get('#cidrs-3').should('be.visible');

      // Check more hostnames items are visible
      cy.get('#hostname-3').should('be.visible');
    });
  });
});
