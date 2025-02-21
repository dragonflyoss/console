import clusters from '../../fixtures/clusters/clusters.json';
import seedPeers from '../../fixtures/seed-peers/seed-peers.json';
import schedulers from '../../fixtures/schedulers/schedulers.json';
import cluster from '../../fixtures/clusters/cluster/cluster.json';
import deleteCluster from '../../fixtures/clusters/cluster/delete-cluster.json';
import deleteClusters from '../../fixtures/clusters/cluster/delete-clusters.json';

describe('Cluster', () => {
  beforeEach(() => {
    cy.signin();
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusters,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/schedulers?page=1&per_page=10000000',
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
        url: '/api/v1/seed-peers?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: seedPeers,
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

    cy.visit('clusters/1');
    cy.viewport(1440, 1080);
  });

  describe('when data is loaded', () => {
    it('can display breadcrumb', () => {
      // Show isloading.
      cy.get('[data-testid="cluster-loading"]').should('be.exist');
      cy.url().should('include', '/clusters/1');
      cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root')
        .should('be.visible')
        .and('contain', 'cluster-1');
      cy.get('.MuiBreadcrumbs-ol > :nth-child(1) > .MuiTypography-root').click();

      // Does not show isloading.
      cy.get('[data-testid="cluster-loading"]').should('not.exist');
      cy.url().should('include', '/clusters');
    });

    it('can display information', () => {
      // Show cluster name.
      cy.get('#name').should('be.visible').and('contain', 'cluster-1');

      // Show cluster description.
      cy.get('#description')
        .should('be.visible')
        .and(
          'contain',
          'Cluster-1 is a high-performance computing cluster located in China, specifically in Hangzhou and Beijing data centers.',
        );

      // Show whether it is the default cluster.
      cy.get('#default').should('be.visible').and('contain', 'Yes');

      // Show scheduler cluster id.
      cy.get('#scheduler-cluster-id').should('be.visible').and('contain', '1');

      // Show seed peer cluster id.
      cy.get('#seed-peer-cluster-id').should('be.visible').and('contain', '1');
    });

    it('can display scopes', () => {
      // Show location.
      cy.get('#location').should('be.visible').and('contain', 'China|Hang|Zhou');

      // Show idc.
      cy.get('#idc-1').should('be.visible').and('contain', 'Hangzhou');
      cy.get('#idc-2').should('be.visible').and('contain', 'Shanghai');

      // IDC is not visible.
      cy.get('#idc-3').should('not.be.visible', 'Beijing');

      // The number of idc is 2 and the button is no longer displayed.
      cy.get('#idc').should('exist').click();

      // Click the button to show more idc.
      cy.get('.MuiDialogContent-root > :nth-child(1)').should('be.visible').and('have.text', 'Hangzhou');
      cy.get('.MuiDialogContent-root > :nth-child(2)').should('be.visible').and('have.text', 'Shanghai');
      cy.get('.MuiDialogContent-root > :nth-child(3)').should('be.visible').and('have.text', 'Beijing');
      cy.get('.MuiDialogContent-root > :nth-child(4)').should('be.visible').and('have.text', 'Xiamen');
      cy.get('.MuiDialogContent-root').should('exist');
      cy.get('#idc-total').should('contain', 'Total: 5');
      cy.get('body').click('topLeft');

      // Show CIDRs
      cy.get('#cidrs-2').should('be.visible').and('contain', '192.168.0.0/16');
      cy.get('#cidrs-total').should('contain', 'Total: 5');

      // Click the button to show more cidrs.
      cy.get('#cidrs').should('exist').click();

      // Show idc dialog module.
      cy.get('.MuiDialogContent-root').should('exist');
      cy.get('.MuiDialogContent-root').should('be.visible').and('contain', '10.0.0.0/8');
      cy.get('body').click('topLeft');

      // The number of CIDRs displayed is 3.
      cy.get('.MuiDialogContent-root > :nth-child(1)').should('have.text', '10.0.0.0/8');
      cy.get('.MuiDialogContent-root > :nth-child(2)').should('have.text', '192.168.0.0/16');

      // CIDRs is not visible.
      cy.get('.MuiDialogContent-root > :nth-child(3)').should('not.be.visible', '172.16.0.0/12');

      // The number of hostnames displayed is 3.
      cy.get('#hostname-1').should('have.text', 'cluster-1');
      cy.get('#hostname-2').should('have.text', 'cluster-2');

      // Hostname is not visible.
      cy.get('#hostname-3').should('not.be.visible', 'cluster-3');
      cy.get('#hostname-4').and('not.be.visible', 'cluster-4');
      cy.get('#hostnames-total').should('contain', 'Total: 5');

      // Click the button to show more cidrs.
      cy.get('#hostnames').should('exist').click();

      // Show hostnames dialog module.
      cy.get('.MuiDialogContent-root').children().should('have.length', 4);
      cy.get('body').click('topLeft');
      cy.get('.MuiDialogContent-root').should('not.be.visible');
    });

    it('the visible width of the screen is 1920px. Display scopes', () => {
      cy.viewport(1920, 1080);

      // The number of idc displayed is 3.
      cy.get('#idc-1').should('be.visible').and('have.text', 'Hangzhou');
      cy.get('#idc-2').should('be.visible').and('have.text', 'Shanghai');
      cy.get('#idc-3').should('be.visible').and('have.text', 'Beijing');
      cy.get('#idc-4').should('not.be.visible');

      // The number of CIDRs displayed is 3.
      cy.get('#cidrs-1').should('be.visible').should('have.text', '10.0.0.0/8');
      cy.get('#cidrs-2').should('be.visible').should('have.text', '192.168.0.0/16');
      cy.get('#cidrs-3').should('be.visible').should('have.text', '172.16.0.0/12');
      cy.get('#cidrs-4').should('not.be.visible');

      // The number of hostnames displayed is 3.
      cy.get('#hostname-1').should('be.visible').should('have.text', 'cluster-1');
      cy.get('#hostname-2').should('be.visible').should('have.text', 'cluster-2');
      cy.get('#hostname-3').should('be.visible').should('have.text', 'cluster-3');
      cy.get('#hostname-4').should('not.be.visible');
    });

    it('the visible width of the screen is 1920px. Display scopes', () => {
      cy.viewport(2560, 1080);

      // The number of idc displayed is 3.
      cy.get('#idc-1').should('be.visible').and('have.text', 'Hangzhou');
      cy.get('#idc-2').should('be.visible').and('have.text', 'Shanghai');
      cy.get('#idc-3').should('be.visible').and('have.text', 'Beijing');
      cy.get('#idc-4').should('be.visible').and('have.text', 'Xiamen');

      // The number of CIDRs displayed is 3.
      cy.get('#cidrs-1').should('be.visible').and('have.text', '10.0.0.0/8');
      cy.get('#cidrs-2').should('be.visible').and('have.text', '192.168.0.0/16');
      cy.get('#cidrs-3').should('be.visible').and('have.text', '172.16.0.0/12');
      cy.get('#cidrs-4').should('be.visible').and('have.text', '173.16.0.1/11');

      // The number of hostnames displayed is 3.
      cy.get('#hostname-1').should('be.visible').and('have.text', 'cluster-1');
      cy.get('#hostname-2').should('be.visible').and('have.text', 'cluster-2');
      cy.get('#hostname-3').should('be.visible').and('have.text', 'cluster-3');
      cy.get('#hostname-4').should('be.visible').and('have.text', 'cluster-4');
    });

    it('can display config', () => {
      cy.get('#seed-peer-load-limit').should('be.visible').and('have.text', '300');
      cy.get('#peer-load-limit').should('be.visible').and('have.text', '51');
      cy.get('#candidate-parent-limit').should('be.visible').and('have.text', '4');
      cy.get('#filter-parent-limit').should('be.visible').and('have.text', '40');
      cy.get('#job-rate-limit').should('be.visible').and('have.text', '15');
    });

    it('copies text to clipboard', () => {
      // Click the copy scheduler cluster id icon.
      cy.get('#copy-scheduler-cluster-id').click();
      cy.get('#schedulerClusterIDCopyIcon').should('exist');
      cy.get('#schedulerClusterIDTooltip').should('not.exist');
      cy.wait(1000);

      // Display successful copy icon.
      cy.get('#schedulerClusterIDCopyIcon').should('exist');
      cy.get('#schedulerClusterIDTooltip').should('not.exist');

      // Let's check the copied text.
      cy.window()
        .its('navigator.clipboard')
        .then((clip) => clip.readText())
        .should('equal', '1');

      // Click the copy seed peer cluster id icon.
      cy.get('#copy-seed-peer-cluster-id').click();
      cy.get('#seedPeerClusterIDCopyIcon').should('exist');
      cy.get('#seedPeerClusterIDTooltip').should('not.exist');
      cy.wait(1000);

      // Display successful copy icon.
      cy.get('#seedPeerClusterIDCopyIcon').should('exist');
      cy.get('#seedPeerClusterIDTooltip').should('not.exist');

      // Let's check the copied text.
      cy.window()
        .its('navigator.clipboard')
        .then((clip) => clip.readText())
        .should('equal', '1');
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: {
              id: 1,
              name: 'cluster-1',
              bio: '',
              scopes: {
                idc: '',
                location: '',
                cidrs: null,
                hostnames: null,
              },
              scheduler_cluster_id: 1,
              seed_peer_cluster_id: 1,
              scheduler_cluster_config: {
                candidate_parent_limit: 4,
                filter_parent_limit: 15,
                job_rate_limit: 100,
              },
              seed_peer_cluster_config: {
                load_limit: 500,
              },
              peer_cluster_config: {
                load_limit: 200,
              },
              created_at: '2024-04-07T06:30:14Z',
              updated_at: '2024-04-07T06:30:14Z',
              is_default: true,
            },
          });
        },
      );
      cy.visit('clusters/1');
    });

    it('unable to display breadcrumb', () => {
      // Show isloading.
      cy.get('[data-testid="cluster-loading"]').should('be.exist');

      cy.url().should('include', '/clusters/1');

      cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root').should('be.visible').and('contain', '-');

      cy.get('.MuiBreadcrumbs-ol > :nth-child(1) > .MuiTypography-root').click();
      cy.url().should('include', '/clusters');
    });

    it('unable to display information', () => {
      cy.get('#name').should('have.text', 'cluster-1');
      cy.get('#description').should('have.text', '-');
      cy.get('#default').should('have.text', 'Yes');
      cy.get('#scheduler-cluster-id').should('have.text', '1');
      cy.get('#seed-peer-cluster-id').should('have.text', '1');
    });

    it('unable to display scopes', () => {
      // Show location.
      cy.get('#no-location').should('have.text', '-');

      // Show idc.
      cy.get('#idc').should('not.exist');
      cy.get('#no-idc').should('have.text', '-');
      cy.get('#idc-total').should('have.text', 'Total: 0');

      // Show cidrs.
      cy.get('#cidrs').should('not.exist');
      cy.get('#no-cidrs').should('have.text', '-');
      cy.get('#cidrs-total').should('have.text', 'Total: 0');

      // Show hostnames.
      cy.get('#hostnames').should('not.exist');
      cy.get('#no-hostnames').should('have.text', '-');
      cy.get('#hostnames-total').should('have.text', 'Total: 0');
    });

    it('unable to display config', () => {
      cy.get('#seed-peer-load-limit').should('have.text', 500);
      cy.get('#peer-load-limit').should('have.text', 200);
      cy.get('#candidate-parent-limit').should('have.text', 4);
      cy.get('#filter-parent-limit').should('be.visible').and('have.text', 15);
      cy.get('#job-rate-limit').should('have.text', 100);
    });
  });

  it('should handle API error response', () => {
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

    // Show isloading.
    cy.get('[data-testid="cluster-loading"]').should('be.exist');

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

    // Close error message.
    cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    cy.get('.MuiAlert-message').should('not.exist');
  });

  describe('delete', () => {
    beforeEach(() => {
      cy.visit('/clusters');
    });

    it('can delete the cluster', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/10',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deleteCluster,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=10',
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
          url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=10',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: [],
          });
        },
      );

      // Display the total number of clusters and the default number.
      cy.get('#total-clusters').should('be.visible').and('contain', 37);
      cy.get('#default-clusters').should('be.visible').and('contain', 13);

      // Choose a cluster without scheduler and seed peer.
      cy.get('#cluster-name-10').should('be.visible').and('contain', 'cluster-10');

      cy.get('#show-cluster-10').click();

      cy.get('#name').scrollIntoView();

      cy.get('#name').should('be.visible').and('contain', 'cluster-10');

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/clusters/10',
        },
        (req) => {
          req.reply({
            statusCode: 200,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deleteClusters,
          });
        },
      );

      cy.get('#delete-cluster').click();

      cy.get('#cancelDeleteCluster').click();

      cy.get('#delete-cluster').click();

      // Confirm delete.
      cy.get('#deleteCluster').click();

      // Then I see that the current page is the clusters!
      cy.url().should('include', '/clusters');
      cy.get('#cluster-name-10').should('not.exist');

      // Display the total number of clusters after deletion.
      cy.get('#total-clusters').should('be.visible').and('contain', 36);

      // Display the default number after deletion.
      cy.get('#default-clusters').should('be.visible').and('contain', 12);
    });

    it('cluster cannot be deleted if scheduler and seed nodes exist in the cluster', () => {
      cy.get('#cluster-id-1').should('be.visible').and('contain', '1');

      cy.get('#show-cluster-1').click();

      cy.get('#name').scrollIntoView().should('be.visible').and('contain', 'cluster-1');

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            statusCode: 500,
            body: { message: 'scheduler cluster exists scheduler' },
          });
        },
      );

      cy.get('#delete-cluster').click();

      cy.get('#deleteCluster').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'scheduler cluster exists scheduler');
    });

    it('should handle API error response', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/10',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deleteCluster,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=10',
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
          url: '/api/v1/schedulers?page=1&per_page=10000000&scheduler_cluster_id=10',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: [],
          });
        },
      );

      // Choose a cluster without scheduler and seed peer.
      cy.get('#cluster-name-10').should('be.visible').and('contain', 'cluster-10');

      cy.get('#show-cluster-10').click();

      cy.get('#name').scrollIntoView().should('be.visible').and('contain', 'cluster-10');

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/clusters/10',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#delete-cluster').click();

      // Confirm delete.
      cy.get('#deleteCluster').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });

    it('try to delete cluster with guest user', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/10',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deleteCluster,
          });
        },
      );

      cy.guestSignin();

      cy.get('#cluster-name-10').should('be.visible').and('contain', 'cluster-10');

      cy.get('#show-cluster-10').click();

      cy.get('#name').scrollIntoView().should('be.visible').and('contain', 'cluster-10');

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/clusters/10',
        },
        (req) => {
          req.reply({
            statusCode: 401,
            body: { message: 'permission deny' },
          });
        },
      );

      cy.get('#delete-cluster').click();

      // Confirm delete
      cy.get('#deleteCluster').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'permission deny');
    });
  });
});
