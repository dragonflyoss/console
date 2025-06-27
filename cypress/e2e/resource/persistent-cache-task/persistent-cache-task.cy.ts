import persistentCacheTasks from '../../../fixtures/resource/persistent-cache-task/persistent-cache-tasks.json';
import persistentCacheTask from '../../../fixtures/resource/persistent-cache-task/persistent-cache-task.json';
import failedPersistentCacheTask from '../../../fixtures/resource/persistent-cache-task/failed-persistent-cache-task.json';

describe('Persistent Cache Tasks', () => {
  beforeEach(() => {
    cy.signin();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/persistent-cache-tasks?page=1&per_page=10000000&scheduler_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: persistentCacheTasks,
        });
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/persistent-cache-tasks/2865345332?scheduler_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: persistentCacheTask,
        });
      },
    );

    cy.visit('/resource/persistent-cache-task/clusters/1/2865345332');
    cy.viewport(1440, 1080);
  });

  describe('when data is loaded', () => {
    it('click the breadcrumb', () => {
      // Display is loading.
      cy.get('[data-testid="isloading"]').should('be.exist');

      // Check for breadcrumb.
      cy.get('#scheduler-cluster-1').should('be.visible').and('contain', 'scheduler-cluster-1');

      cy.get('#task-id-2865345332').should('have.text', 2865345332);
      cy.get('#scheduler-cluster-1').click();

      // Then I see that the current page is the clusters/1!
      cy.url().should('include', '/resource/persistent-cache-task/clusters/1');
    });

    it('can display success persistent cache task', () => {
      cy.get('#id').should('have.text', '2865345332');
      cy.get('#success-task').should('exist');
      cy.get('#persistent-replica-count').should('have.text', '2');
      cy.get('#ttl').should('have.text', '7 days');
      cy.get('#content-length').should('have.text', '1.59 KB');
      cy.get('#piece-length').should('have.text', '4 MiB');
      cy.get('#application').should('have.text', 'application-1');
      cy.get('#tag').should('have.text', 'tag-1');

      // Display peers.
      cy.get('#peers').should('exist');

      cy.get('#id-0').should('have.text', '2');
      cy.get('#hostname-0').should('have.text', 'hostname-2');
      cy.get('#os-0').should('have.text', 'ios');
      cy.get('#persistent-0').should('contain', 'Yes');
      cy.get('#type-0').should('have.text', 'Super');
      cy.get('#ip-0').should('have.text', '112.3325.44');
      cy.get('#port-0').should('have.text', '8001');
      cy.get('#download-port-0').should('have.text', '4001');

      // Go to last page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('#hostname-0').should('have.text', 'hostname-5');
    });

    it('can display failed persistent cache task', () => {
      cy.visit('/resource/persistent-cache-task/clusters/1');

      cy.get('.MuiPagination-ul > :nth-child(3)').click();

      cy.get('#failed-task-1').should('exist');

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/persistent-cache-tasks/3870122508?scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: failedPersistentCacheTask,
          });
        },
      );

      // Click the persistent cache task details button.
      cy.get('#card-id-1').click();

      cy.get('#peers').should('not.exist');

      cy.get('#failure-task').should('exist');

      cy.get('#scheduler-cluster-1').click();

      cy.get('#operation-0').click();
      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .information_menu__CXV1V > #view-3810320977').click();

      // Then I see that the current page is the persistent cache task details!
      cy.url().should('include', '/resource/persistent-cache-task/clusters/1/3810320977');

      // Then I see that the current page is the persistent cache tasks!
      cy.get('#scheduler-cluster-1').click();

      // Display a list of persistent cache tasks.
      cy.get('#table').click();

      cy.get('#operation-3810320977').click();

      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .information_menu__CXV1V > #view-3810320977').click();

      // Then I see that the current page is the persistent cache task details!
      cy.url().should('include', '/resource/persistent-cache-task/clusters/1/3810320977');
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/persistent-cache-tasks/2865345332?scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: {},
          });
        },
      );
    });

    it('unable to display breadcrumb', () => {
      cy.get('#task-id-2865345332').should('have.text', '2865345332');
    });

    it('persistent cache task render empty status', () => {
      cy.get('#id').should('have.text', '0');
      cy.get('#failure-task').should('exist');
      cy.get('#create-at').should('have.text', '-');
      cy.get('#persistent-replica-count').should('have.text', '-');
      cy.get('#ttl').should('have.text', '-');
      cy.get('#content-length').should('have.text', '-');
      cy.get('#piece-length').should('have.text', '-');
      cy.get('#application').should('have.text', '-');
      cy.get('#tag').should('have.text', '-');
      cy.get('#peers').should('not.exist');
    });
  });

  describe('should handle API error response', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/persistent-cache-tasks/3810320977?scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );
      cy.visit('/resource/persistent-cache-task/clusters/1/3810320977');
    });

    it('show error message', () => {
      // Show error message.
      cy.get('#error-message').should('be.visible').and('contain', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('#error-message').should('not.exist');
    });

    it('persistent cache task render empty status', () => {
      cy.get('#id').should('have.text', '0');
      cy.get('#failure-task').should('exist');
      cy.get('#create-at').should('have.text', '-');
      cy.get('#persistent-replica-count').should('have.text', '-');
      cy.get('#ttl').should('have.text', '-');
      cy.get('#content-length').should('have.text', '-');
      cy.get('#piece-length').should('have.text', '-');
      cy.get('#application').should('have.text', '-');
      cy.get('#tag').should('have.text', '-');
      cy.get('#peers').should('not.exist');
    });
  });

  describe('delete', () => {
    it('persistent cache tasks can be deleted', () => {
      cy.get('#open-dialog').should('not.exist');
      cy.get('#delete-task').click();

      cy.get('#open-dialog').should('exist');

      // Cancel delete task.
      cy.get('#cancel-delete-task').click();

      cy.get('#open-dialog').should('not.exist');

      cy.get('#delete-task').click();

      cy.get('#delete-task-input').type('delete');

      cy.get('#save-delete-task').click();

      // Shoe help text.
      cy.get('#delete-task-input-helper-text').should('have.text', 'Please enter "DELETE"');

      cy.get('#delete-task-input').clear();

      cy.get('#delete-task-input').type('DELETE');

      cy.get('#delete-task-input-helper-text').should('not.exist');

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/persistent-cache-tasks/2865345332?scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
          });
        },
      );

      cy.get('#save-delete-task').click();

      cy.url().should('include', '/resource/persistent-cache-task/clusters/1');
    });

    it('should handle API error response', () => {
      cy.get('#delete-task').click();

      cy.get('#delete-task-input').type('DELETE');

      cy.get('#delete-task-input-helper-text').should('not.exist');

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/persistent-cache-tasks/2865345332?scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#save-delete-task').click();

      // Show error message.
      cy.get('#error-message').should('be.visible').and('contain', 'Failed to fetch');
    });
  });
});
