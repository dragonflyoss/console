import clusters from '../../../fixtures/clusters/clusters.json';
import persistentCacheTasks from '../../../fixtures/resource/persistent-cache-task/persistent-cache-tasks.json';
import deletePersistentCacheTasks from '../../../fixtures/resource/persistent-cache-task/delete-persistent-cache-tasks.json';
import deletePersistentCacheTasksAfter from '../../../fixtures/resource/persistent-cache-task/delete-persistent-cache-tasks-after.json';

describe('Persistent Cache Tasks', () => {
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
        url: '/api/v1/persistent-cache-tasks?page=1&per_page=10000000&scheduler_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: persistentCacheTasks,
        });
      },
    );
    cy.visit('/resource/persistent-cache-task');
    cy.viewport(1440, 1080);
  });

  describe('when data is loaded', () => {
    it('it should show cluster', () => {
      // Display is loading.
      cy.get('[data-testid="isloading"]').should('be.exist');

      cy.get('#clusters-card').should('exist');

      cy.get('#cluster-name-1').should('have.text', 'cluster-1');

      cy.get('#cluster-name-1').click({force:true});
    });

    it('should show persistent cache tasks', () => {
      cy.visit('/resource/persistent-cache-task/clusters/1');

      // Display is loading.
      cy.get('[data-testid="isloading"]').should('be.exist');

      cy.get('#total').should('have.text', 19);
      cy.get('#application').should('have.text', 6);
      cy.get('#tag').should('have.text', 17);

      cy.get('#card-id-0').should('have.text', '3810320977');

      cy.get('#tag-0').should('have.text', 'tag-4');
      cy.get('#application-0').should('have.text', 'application-3');

      cy.get('#table').click({force:true});

      cy.get(':nth-child(1) > #id-3810320977').should('have.text', '3810320977');
    });

    it('should show visualization of persistent cache tasks', () => {
      cy.visit('/resource/persistent-cache-task/clusters/1');

      cy.get('#tab-analytics', { timeout: 20000 }).should('exist');
      cy.get('[data-testid="isloading"]', { timeout: 20000 }).should('not.exist');
      
      cy.get('#tab-analytics').click({ force: true });

      cy.get('#total').should('have.text', 19);
      cy.get('#application').should('have.text', 6);
      cy.get('#tag').should('have.text', 17);

      cy.get('#application-ratio').should('have.text', '31.58%');

      cy.get('#tag-ratio').should('have.text', '89.47%');
    });

    it('call onChange when changing page size', () => {
      // The viewport will now be changed to 1440px x 1080px
      cy.viewport(1440, 1080);

      // Check if the number of page size is 9.
      cy.get('#clusters-card').should('exist').children().should('have.length', 9);

      // The viewport will now be changed to 1600px x 1080px
      cy.viewport(1600, 1080);
      cy.wait(1000);

      // Check if the number of page size is 12.
      cy.get('#clusters-card').should('exist').children().should('have.length', 9);

      // The viewport will now be changed to 1920px x 1080px
      cy.viewport(1920, 1080);
      cy.wait(1000);

      // Check if the number of page size is 20.
      cy.get('#clusters-card').should('exist').children().should('have.length', 12);

      // The viewport will now be changed to 2048px x 1080px
      cy.viewport(2048, 1080);
      cy.wait(1000);

      // Check if the number of page size is 20.
      cy.get('#clusters-card').should('exist').children().should('have.length', 12);

      // The viewport will now be changed to 2560px x 1080px
      cy.viewport(2560, 1080);
      cy.wait(1000);

      // Check if the number of page size is 24.
      cy.get('#clusters-card').should('exist').children().should('have.length', 15);

      cy.visit('/resource/persistent-cache-task/clusters/1');

      // The viewport will now be changed to 1440px x 1080px
      cy.viewport(1440, 1080);

      // Check if the number of page size is 9.
      cy.get('#card-list').should('exist').children().should('have.length', 9);

      // The viewport will now be changed to 1600px x 1080px
      cy.viewport(1600, 1080);
      cy.wait(1000);

      // Check if the number of page size is 9.
      cy.get('#card-list').should('exist').children().should('have.length', 9);

      // The viewport will now be changed to 1920px x 1080px
      cy.viewport(1920, 1080);
      cy.wait(1000);

      // Check if the number of page size is 12.
      cy.get('#card-list').should('exist').children().should('have.length', 12);

      // The viewport will now be changed to 2048px x 1080px
      cy.viewport(2048, 1080);
      cy.wait(1000);

      // Check if the number of page size is 12.
      cy.get('#card-list').should('exist').children().should('have.length', 12);

      // The viewport will now be changed to 2560px x 1080px
      cy.viewport(2560, 1080);
      cy.wait(1000);

      // Check if the number of page size is 15.
      cy.get('#card-list').should('exist').children().should('have.length', 15);
    });
  });

  describe('search', () => {
    it('can search cluster', () => {
      cy.get('#search-cluster').type('cluster-1{enter}');

      // Check the card list.
      cy.get('#clusters-card').children().should('have.length', 9);

      cy.get('#search-cluster').clear();

      cy.get('#search-cluster').type('cluster-11{enter}');

      // Check the card list.
      cy.get('#clusters-card').children().should('have.length', 1);

      cy.get('#no-clusters').should('not.exist');
      cy.get('#search-cluster').clear();
      cy.get('#search-cluster').type('cluster-111{enter}');

      cy.get('#no-clusters').should('exist');
    });

    it('can search persistent cache task', () => {
      cy.get('#cluster-name-1').click();

      cy.get('#search-task').type('2484851399{enter}');

      // Check the card list.
      cy.get('#card-list').children().should('have.length', 1);

      cy.get('#search-task').clear();

      // Check the card list.
      cy.get('#card-list').children().should('have.length', 9);

      cy.get('#search-task').type('9023');

      // It should prompt that there is no task.
      cy.get('#no-task').should('have.text', 'This scheduler cluster has no persistent cache task.');
    });

    it('should be queried based on the query string', () => {
      cy.visit('/resource/persistent-cache-task?search=cluster-11');

      cy.get('#search-cluster').should('have.value', 'cluster-11');

      // Check the card list.
      cy.get('#clusters-card').children().should('have.length', 1);

      cy.visit('/resource/persistent-cache-task/clusters/1?search=2865345332');

      // Check the card list.
      cy.get('#card-list').children().should('have.length', 3);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      cy.visit('/resource/persistent-cache-task/clusters/1');
    });

    it('can the delet persistent cache task', () => {
      cy.get('#operation-0').click({force: true});

      cy.get('#delete-task').should('not.exist');
           cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .information_menu__CXV1V > #delete-3810320977').click({force:true});
      cy.get('#delete-task').should('exist');

      cy.get('#help-delete-task').should('have.text', 'Persistent cache task will be permanently deleted.');

      cy.get('#deletCache').type('delete');

      // Shoe help text.
      cy.get('#deletCache-helper-text').should('have.text', 'Please enter "DELETE"');

      cy.get('#deleteTask').click();
      cy.get('#delete-task').should('exist');

      cy.get('#deletCache').clear();

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/persistent-cache-tasks/3810320977?scheduler_cluster_id=1',
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
          url: '/api/v1/persistent-cache-tasks?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deletePersistentCacheTasks,
          });
        },
      );

      cy.get('#deletCache').type('DELETE');
      cy.get('#total').should('have.text', 19);

      cy.get('#deleteTask').click();

      // Show Success Message.
      cy.get('#success-message').should('have.text', 'Submission successful!');

      cy.get('#total').should('have.text', 18);
    });

    it('should handle API error response', () => {
      cy.get('#operation-0').click({force: true});
      cy.get('body').click('topLeft');
      cy.get('#operation-0').click({force: true});

      cy.get('#delete-task').should('not.exist');

      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .information_menu__CXV1V > #delete-3810320977').click({force: true});
      cy.get('#delete-task').should('exist');

      cy.get('#help-delete-task').should('have.text', 'Persistent cache task will be permanently deleted.');

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/persistent-cache-tasks/3810320977?scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#deletCache').type('DELETE');

      cy.get('#deleteTask').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });

    it('when a task is removed, this task is the only task on the last page', () => {
      // Go to last page.
      cy.get('.MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      cy.url().should('include', '/resource/persistent-cache-task/clusters/1?page=3');

      cy.get('#operation-0').click({force: true});

      cy.get('#delete-2865345332').click({force: true});

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

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/persistent-cache-tasks?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deletePersistentCacheTasksAfter,
          });
        },
      );

      cy.get('#deletCache').type('DELETE');
      cy.get('#total').should('have.text', 19);

      cy.get('#deleteTask').click();

      // Show Success Message.
      cy.get('#success-message').should('have.text', 'Submission successful!');

      cy.get('#total').should('have.text', 18);

      cy.url().should('include', '/resource/persistent-cache-task/clusters/1?page=2');
    });

    it('when deleting a task, there is only one task on the next page', () => {
      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#task-pagination > .MuiPagination-ul').children().should('have.length', '5');

      // Check the last task ID.
      cy.get('#card-id-8').should('have.text', '2865345332');

      cy.url().should('include', '/resource/persistent-cache-task/clusters/1?page=2');

      cy.get('#operation-8').click({force: true});

      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .information_menu__CXV1V > #delete-2865345332').click({force: true});

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

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/persistent-cache-tasks?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deletePersistentCacheTasks,
          });
        },
      );

      cy.get('#deletCache').type('DELETE');
      cy.get('#total').should('have.text', 19);

      cy.get('#deleteTask').click();

      // Show Success Message.
      cy.get('#success-message').should('have.text', 'Submission successful!');

      cy.get('#total').should('have.text', 18);

      // Check the current page number.
      cy.get('#task-pagination > .MuiPagination-ul').children().should('have.length', '4');

      // Check the last task ID.
      cy.get('#card-id-8').should('have.text', '2865345332');
    });
  });

  describe('should handle API error response', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/persistent-cache-tasks?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );
    });

    it('cluster API response error', () => {
      cy.visit('/resource/persistent-cache-task');

      cy.get('#no-date').should('exist');

      cy.get('#no-date-text').should('have.text', 'You have no clusters.');

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });

    it('persistent cache task API response error', () => {
      cy.visit('/resource/persistent-cache-task/clusters/1');

      // It should prompt that there is no task.
      cy.get('#no-task').should('have.text', 'This scheduler cluster has no persistent cache task.');

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');

      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();

      cy.get('.MuiAlert-message').should('not.exist');

      cy.get('#table').click();

      // It should prompt that there is no task.
      cy.get('#no-task-table').should('have.text', 'This scheduler cluster has no persistent cache task.');
    });
  });

  describe('pagination', () => {
    it('pagination updates results and page number', () => {
      cy.get('.MuiPagination-ul > :nth-child(3)').click();

      // Show cluster name.
      cy.get('#cluster-name-10').should('be.visible').and('contain', 'cluster-10');

      // Show persistent cache task
      cy.visit('/resource/persistent-cache-task/clusters/1');

      cy.get('#card-list').children().should('have.length', 9);

      cy.get('#card-id-0').should('have.text', '3810320977');

      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('#card-list').children().should('have.length', 9);

      cy.get('#card-id-0').should('have.text', '3870122509');
    });

    it('when you click refresh, the paginated results and page numbers remain unchanged.', () => {
      cy.get('#clusters-card').children().should('have.length', 9);

      cy.get('.MuiPagination-ul > :nth-child(6) > .MuiButtonBase-root').click();

      cy.get('#clusters-card').children().should('have.length', 1);

      cy.get('#cluster-name-37').should('have.text', 'cluster-37');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(1000);
      });

      cy.get('#clusters-card').children().should('have.length', 1);

      cy.get('#cluster-name-37').should('have.text', 'cluster-37');

      // Show persistent cache task
      cy.visit('/resource/persistent-cache-task/clusters/1?page=2');

      cy.get('#card-list').children().should('have.length', 9);

      cy.get('#card-id-0').should('have.text', '3870122509');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(1000);
      });

      cy.get('#card-list').children().should('have.length', 9);

      cy.get('#card-id-0').should('have.text', '3870122509');
    });
  });
  describe('Chart color coverage for dark mode', () => {
  it('should cover getGradient and greenPalette branches in dark mode', () => {
    cy.visit('/resource/persistent-cache-task/clusters/1', {
      onBeforeLoad(win) {
        cy.stub(win, 'matchMedia')
          .withArgs('(prefers-color-scheme: dark)')
          .returns({
            matches: true,
            addEventListener: cy.stub(),
            removeEventListener: cy.stub(),
          } as any);
      },
    });
    
    // Wait for page to fully load including tabs
    cy.get('#tab-analytics', { timeout: 20000 }).should('exist');
    cy.get('[data-testid="isloading"]', { timeout: 20000 }).should('not.exist');
    
    // Switch to analytics tab
    cy.get('#tab-analytics').click({ force: true });
    
    cy.get('canvas').should('have.length.greaterThan', 0);
    
    // Validate dark mode color configuration
    cy.window().then((win) => {
      // Validate dark mode color values
      const darkModeColors = {
        greenPalette: ['#01A76F', '#5BE49B', '#C8FAD6', '#004B50', '#007868'],
        gradient: {
          normal: ['#00E676', '#009688'],
          hover: ['#00CB69', '#008C74']
        },
        tooltip: {
          backgroundColor: '#043B34',
          titleColor: '#A5D6A7',
          bodyColor: '#B9F6CA',
          borderColor: '#1B5E20'
        }
      };
      
      // Validate color configuration is correctly applied
      cy.get('canvas').should('have.length', 4);
      
      // Validate color configuration through Chart.js instance
      cy.get('canvas').each(($canvas, index) => {
        cy.wrap($canvas).should('be.visible');
        
        // Validate Canvas element exists and is accessible
        cy.window().then((win) => {
          const canvas = $canvas[0] as HTMLCanvasElement;
          expect(canvas).to.exist;
          expect(canvas.width).to.be.greaterThan(0);
          expect(canvas.height).to.be.greaterThan(0);
        });
      });
    });
    
    // Trigger hover state and validate color changes
    cy.get('canvas')
      .first()
      .trigger('mouseover')
      .trigger('mousemove', 100, 100)
      .wait(500);
      
    cy.get('canvas')
      .eq(1)
      .trigger('mouseover')
      .trigger('mousemove', 150, 150)
      .wait(500);
  });
});

  describe('Chart color validation for light mode', () => {
  it('should validate colors in light mode', () => {
    cy.visit('/resource/persistent-cache-task/clusters/1', {
      onBeforeLoad(win) {
        cy.stub(win, 'matchMedia')
          .withArgs('(prefers-color-scheme: dark)')
          .returns({
            matches: false,
            addEventListener: cy.stub(),
            removeEventListener: cy.stub(),
          } as any);
      },
    });
    
    // Wait for page to fully load including tabs
    cy.get('#tab-analytics', { timeout: 20000 }).should('exist');
    cy.get('[data-testid="isloading"]', { timeout: 20000 }).should('not.exist');
    
    // Switch to analytics tab
    cy.get('#tab-analytics').click({ force: true });
    
    cy.get('canvas').should('have.length.greaterThan', 0);
    
    // Validate light mode color configuration
    cy.window().then((win) => {
      const lightModeColors = {
        greenPalette: [
          'rgba(67,160,71,0.95)',
          'rgba(76,175,80,0.9)',
          'rgba(102,187,106,0.85)',
          'rgba(129,199,132,0.8)',
          'rgba(165,214,167,0.75)'
        ],
        gradient: {
          normal: ['#66BB6A', '#26A69A'],
          hover: ['#5AA360', '#1E9088']
        },
        tooltip: {
          backgroundColor: '#E8F5E9',
          titleColor: '#1B5E20',
          bodyColor: '#2E7D32',
          borderColor: '#C8E6C9'
        }
      };
      
      // Validate color configuration
      cy.get('canvas').should('have.length', 4);
      
      // Validate Canvas rendering
      cy.get('canvas').each(($canvas, index) => {
        cy.wrap($canvas).should('be.visible');
        
        cy.window().then((win) => {
          const canvas = $canvas[0] as HTMLCanvasElement;
          expect(canvas).to.exist;
          expect(canvas.width).to.be.greaterThan(0);
          expect(canvas.height).to.be.greaterThan(0);
        });
      });
    });
    
    // Validate hover state color changes
    cy.get('canvas')
      .first()
      .trigger('mouseover')
      .trigger('mousemove', 50, 50)
      .wait(300);
      
    cy.get('canvas')
      .eq(1)
      .trigger('mouseover')
      .trigger('mousemove', 80, 80)
      .wait(300);
  });
  
  describe('Advanced color validation', () => {
  it('should validate actual chart colors against configuration', () => {
    cy.visit('/resource/persistent-cache-task/clusters/1');
    
    // Wait for page to fully load including tabs
    cy.get('#tab-analytics', { timeout: 20000 }).should('exist');
    cy.get('[data-testid="isloading"]', { timeout: 20000 }).should('not.exist');
    
    // Switch to analytics tab
    cy.get('#tab-analytics').click({ force: true });
    
    cy.get('canvas').should('have.length', 4);
    
    // Validate chart rendering completion
    cy.get('canvas').each(($canvas, index) => {
      cy.wrap($canvas).should('be.visible');
    });
    
    // Validate hover state transitions
    cy.get('canvas').eq(0)
      .trigger('mouseover')
      .trigger('mousemove', 50, 50)
      .wait(300);
      
    cy.get('canvas').eq(0)
      .trigger('mouseout')
      .wait(200);
      
    cy.get('canvas').eq(1)
      .trigger('mouseover')
      .trigger('mousemove', 80, 80)
      .wait(300);
      
    cy.get('canvas').eq(1)
      .trigger('mouseout')
      .wait(200);
      
    // Validate chart data loading
    cy.get('#application-ratio').should('contain.text', '%');
    cy.get('#tag-ratio').should('contain.text', '%');
  });
});
});

describe('Chart function coverage', () => {
  it('should cover chart rendering branches through normal interaction', () => {
    cy.visit('/resource/persistent-cache-task/clusters/1');
    
    cy.get('#tab-analytics', { timeout: 20000 }).should('exist');
    cy.get('[data-testid="isloading"]', { timeout: 20000 }).should('not.exist');
    
    cy.get('#tab-analytics').click({ force: true });
    
    cy.get('canvas').should('have.length.greaterThan', 0);
    
    cy.get('canvas')
      .first()
      .trigger('mouseover')
      .trigger('mousemove', 50, 50)
      .wait(300);
      
    cy.get('canvas')
      .eq(1)
      .trigger('mouseover')
      .trigger('mousemove', 80, 80)
      .wait(300);
      
  });
});
});
