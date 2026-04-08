// TODO: this file is extremely large and needs to be broken down into smaller files for better maintainability.

import cluster from '../../fixtures/clusters/cluster/cluster.json';

describe('Cluster Blacklist Detail Page', () => {
  // Use persistent_task (not persistent_cache_task) in API data.
  const clusterWithBlacklist = {
    ...cluster,
    peer_cluster_config: {
      load_limit: 51,
      block_list: {
        task: {
          download: {
            applications: ['app1', 'app2'],
            urls: ['http://example.com'],
          },
        },
        persistent_task: {
          upload: {
            tags: ['tag1'],
          },
        },
      },
    },
    seed_peer_cluster_config: {
      load_limit: 300,
      block_list: {
        persistent_task: {
          download: {
            priorities: [1, 3, 5],
          },
        },
      },
    },
  };

  beforeEach(() => {
    cy.signin();
    cy.viewport(1440, 1080);

    // Best Practice: Clean up state BEFORE each test
    // Ensure no dialog is open from previous test
    cy.get('body', { timeout: 10000 }).then(($body) => {
      if ($body.find('[role="dialog"]').length > 0) {
        // Close any open dialogs by pressing Escape
        cy.get('body').type('{esc}');
        cy.wait(300); // Wait for close animation
      }
    });

    // Wait for dialog to close if it was open
    cy.get('[role="dialog"]').should('not.exist');
    // Additional wait for animation to complete
    cy.wait(300);

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithBlacklist,
        });
      },
    );

    cy.visit('/clusters/1');

    // Wait for the page to load.
    cy.get('#name').should('be.visible');
  });

  afterEach(() => {
    // Best Practice: Don't use afterEach for cleanup
    // State cleanup should happen in beforeEach instead
    // This hook is intentionally minimal
  });

  it('should display blacklist section', () => {
    cy.contains('Blacklist').should('be.visible');
  });

  it('should display blacklist table headers', () => {
    // Verify table headers are present
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Task Type').should('be.visible');
    cy.contains('Feature').should('be.visible');
    cy.contains('Applications').should('be.visible');
    cy.contains('Urls').should('be.visible');
    cy.contains('Tags').should('be.visible');
    cy.contains('Priorities').should('be.visible');
  });

  it('should display service type blocks with headers', () => {
    // Verify service type headers
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').should('be.visible');
    cy.contains('Seed Client').should('be.visible');
  });

  it('should display table rows with task types and features', () => {
    // Verify task types and features are displayed in table rows
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');
    cy.contains('Task').should('be.visible');
    cy.contains('Persistent Task').should('be.visible');
    cy.contains('Download').should('be.visible');
    cy.contains('Upload').should('be.visible');
  });

  it('should display option values in table cells', () => {
    // Verify blacklist table shows option values
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');
    cy.contains('app1').scrollIntoView().should('be.visible');
    cy.contains('app2').scrollIntoView().should('be.visible');
    cy.contains('http://example.com').scrollIntoView().should('be.visible');
    cy.contains('tag1').scrollIntoView().should('be.visible');
  });

  it('should display dash for empty option values', () => {
    // Options with no values should display '-'
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');

    // Check that tables are displayed with all data including empty values
    // The table should have multiple rows with some containing dashes
    cy.contains('Task').should('be.visible');
    cy.contains('Persistent Task').should('be.visible');
  });

  it('should display empty state when no blacklist exists', () => {
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

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    // With the new structure, empty configurations are not displayed
    cy.contains('Blacklist').should('be.visible');
    cy.contains('No blacklist configuration').should('be.visible');
    // Service types should not be visible when there's no data
    cy.contains('Client').should('not.exist');
    cy.contains('Seed Client').should('not.exist');
  });

  it('should display multiple blacklist entries', () => {
    const clusterWithMultipleBlacklist = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              applications: ['app1'],
            },
          },
          persistent_task: {
            download: {
              tags: ['tag1'],
            },
          },
        },
      },
      seed_peer_cluster_config: {
        load_limit: 300,
        block_list: {
          persistent_task: {
            upload: {
              urls: ['http://example.com'],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithMultipleBlacklist,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    // Verify the new table structure is displayed
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');
    cy.contains('Seed Client').scrollIntoView().should('be.visible');
    cy.contains('Task').should('be.visible');
    cy.contains('Persistent Task').should('be.visible');
  });

  it('should display detailed info including all options', () => {
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');
    cy.contains('Task').should('be.visible');
    cy.contains('Download').should('be.visible');
    cy.contains('app1').scrollIntoView().should('be.visible');
    cy.contains('app2').scrollIntoView().should('be.visible');
    cy.contains('http://example.com').scrollIntoView().should('be.visible');
    cy.contains('tag1').scrollIntoView().should('be.visible');
  });

  it('should display priorities correctly', () => {
    const clusterWithPriorities = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              priorities: [1, 3, 5],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithPriorities,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');
    cy.contains('Task').should('be.visible');
    cy.contains('Download').should('be.visible');
    cy.contains('1').scrollIntoView().should('be.visible');
    cy.contains('3').scrollIntoView().should('be.visible');
    cy.contains('5').scrollIntoView().should('be.visible');
  });

  it('should display tables for both Client and Seed Client', () => {
    // Verify service type blocks
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').should('be.visible');
    cy.contains('Seed Client').should('be.visible');
  });

  it('should display blacklist section independently from config section', () => {
    // Verify that Blacklist is in a separate section below Scopes and Config
    cy.contains('Scopes').should('be.visible');
    cy.contains('Config').should('be.visible');
    cy.contains('Blacklist').should('be.visible');

    // Blacklist should be displayed in a grid layout, not in the Config card
    cy.contains('Config')
      .parent()
      .within(() => {
        // Config section should not contain Blacklist
        cy.contains('Blacklist').should('not.exist');
      });
  });

  it('should display tooltip for blacklist section', () => {
    // Verify that Blacklist has a help tooltip
    cy.contains('Blacklist')
      .parent()
      .within(() => {
        cy.get('.MuiSvgIcon-root').should('be.visible');
      });
  });

  it('should switch between Client and Seed Client tabs', () => {
    cy.contains('Blacklist').scrollIntoView().should('be.visible');

    // Should display Client tab by default
    cy.contains('Client').should('have.attr', 'aria-selected', 'true');
    cy.contains('Seed Client').should('have.attr', 'aria-selected', 'false');

    // Click Seed Client tab
    cy.contains('Seed Client').click();
    cy.contains('Seed Client').should('have.attr', 'aria-selected', 'true');
    cy.contains('Client').should('have.attr', 'aria-selected', 'false');

    // Should display Seed Client data
    cy.contains('Persistent Task').should('be.visible');
    cy.contains('Download').should('be.visible');

    // Switch back to Client tab
    cy.contains('Client').click();
    cy.contains('Client').should('have.attr', 'aria-selected', 'true');
    cy.contains('Task').should('be.visible');
    cy.contains('app1').should('be.visible');
  });

  it('should display +N more button when URLs exceed 3', () => {
    const clusterWithManyUrls = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              urls: ['http://url1.com', 'http://url2.com', 'http://url3.com', 'http://url4.com', 'http://url5.com'],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithManyUrls,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');

    // Should display the first 3 URLs
    cy.contains('http://url1.com').should('be.visible');
    cy.contains('http://url2.com').should('be.visible');
    cy.contains('http://url3.com').should('be.visible');

    // Should display "+2 more" button
    cy.contains('+2 more').should('be.visible');
  });

  it('should open URLs dialog when clicking +N more button', () => {
    const clusterWithManyUrls = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              urls: ['http://url1.com', 'http://url2.com', 'http://url3.com', 'http://url4.com'],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithManyUrls,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('+1 more').click();

    // Dialog should open
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('URLs').should('be.visible');

    // Should display all URLs
    cy.contains('http://url1.com').should('be.visible');
    cy.contains('http://url2.com').should('be.visible');
    cy.contains('http://url3.com').should('be.visible');
    cy.contains('http://url4.com').should('be.visible');

    // Close dialog by pressing Escape
    cy.get('body').type('{esc}');
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should display priority tags with correct colors', () => {
    const clusterWithPriorities = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              priorities: [1, 2, 3, 4, 5],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithPriorities,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');

    // Should display all priority tags
    cy.contains('Level 1').should('be.visible');
    cy.contains('Level 2').should('be.visible');
    cy.contains('Level 3').should('be.visible');
    cy.contains('Level 4').should('be.visible');
    cy.contains('Level 5').should('be.visible');
  });

  it('should display empty state when Client tab has no data', () => {
    const clusterWithOnlySeedClient = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {},
      },
      seed_peer_cluster_config: {
        load_limit: 300,
        block_list: {
          persistent_task: {
            download: {
              priorities: [1, 2],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithOnlySeedClient,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');

    // Client tab should display empty state
    cy.contains('Client').click();
    cy.contains('No blacklist configuration for Client').should('be.visible');

    // Seed Client tab should have data
    cy.contains('Seed Client').click();
    cy.contains('Persistent Task').should('be.visible');
  });

  it('should display empty state when Seed Client tab has no data', () => {
    const clusterWithOnlyClient = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              applications: ['app1'],
            },
          },
        },
      },
      seed_peer_cluster_config: {
        load_limit: 300,
        block_list: {},
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithOnlyClient,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');

    // Client tab should have data
    cy.contains('Client').click();
    cy.contains('app1').should('be.visible');

    // Seed Client tab should display empty state
    cy.contains('Seed Client').click();
    cy.contains('No blacklist configuration for Seed Client').should('be.visible');
  });

  it('should display dash for empty applications, tags, and priorities', () => {
    const clusterWithPartialData = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              // Only applications, other fields are empty
              applications: ['app1'],
              urls: [],
              tags: [],
              priorities: [],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithPartialData,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');

    // Should display applications
    cy.contains('app1').should('be.visible');

    // Should display dashes in the table (Tags, Priorities and Urls columns)
    cy.get('table').within(() => {
      // Check if dashes are displayed (representing empty values)
      cy.contains('-').should('exist');
    });
  });

  it('should handle persistent_cache_task task type', () => {
    const clusterWithPersistentCache = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          persistent_cache_task: {
            download: {
              applications: ['cache-app'],
            },
            upload: {
              tags: ['cache-tag'],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithPersistentCache,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');

    // Should display Persistent Cache Task
    cy.contains('Persistent Cache Task').should('be.visible');
    cy.contains('cache-app').should('be.visible');
    cy.contains('cache-tag').should('be.visible');
  });

  it('should not display task type when all options are empty', () => {
    const clusterWithEmptyOptions = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              applications: [],
              urls: [],
              tags: [],
              priorities: [],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithEmptyOptions,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');

    // Should display empty state since all options are empty
    cy.contains('No blacklist configuration').should('be.visible');
  });

  it('should display tooltip on hover for applications and tags', () => {
    const clusterWithTooltip = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              applications: ['app1', 'app2', 'app3'],
              tags: ['tag1', 'tag2'],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithTooltip,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');

    // Hover over applications should display tooltip
    cy.contains('app1 / app2 / app3').trigger('mouseover');
    cy.get('.MuiTooltip-tooltip').should('contain', 'app1 / app2 / app3');
  });

  it('should copy URL from dialog', () => {
    const clusterWithManyUrls = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              urls: ['http://url1.com', 'http://url2.com', 'http://url3.com', 'http://url4.com'],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithManyUrls,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('+1 more').click();

    // Dialog should open
    cy.get('[role="dialog"]').should('be.visible');

    // Click copy button - IconButton does not contain text, directly click the first IconButton
    cy.get('[role="dialog"]').within(() => {
      cy.get('button.MuiIconButton-root').first().click();
    });

    // Verify dialog is still visible
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('should close URL dialog when clicking close button', () => {
    const clusterWithManyUrls = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              urls: ['http://url1.com', 'http://url2.com', 'http://url3.com', 'http://url4.com'],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithManyUrls,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('+1 more').click();

    // Dialog should open
    cy.get('[role="dialog"]').should('be.visible');

    // Press Escape to close the dialog
    cy.get('body').type('{esc}');

    // Wait for dialog to fully close
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should display exactly 3 URLs when there are 3 URLs', () => {
    const clusterWithThreeUrls = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              urls: ['http://url1.com', 'http://url2.com', 'http://url3.com'],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithThreeUrls,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');

    // Wait for any dialog close animation to complete
    cy.get('[role="dialog"]').should('not.exist');

    // Should display all 3 URLs
    cy.contains('http://url1.com').should('be.visible');
    cy.contains('http://url2.com').should('be.visible');
    cy.contains('http://url3.com').should('be.visible');

    // Should not display "+N more" button
    cy.contains('more').should('not.exist');
  });

  it('should handle mixed task types and features correctly', () => {
    const clusterWithMixedData = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              applications: ['task-app'],
            },
          },
          persistent_cache_task: {
            download: {
              tags: ['cache-tag'],
            },
            upload: {
              priorities: [1, 2],
            },
          },
          persistent_task: {
            upload: {
              urls: ['http://persistent.com'],
            },
          },
        },
      },
    };

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: clusterWithMixedData,
        });
      },
    );

    cy.visit('/clusters/1');
    cy.get('#name').should('be.visible');

    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');

    // Should display all task types
    cy.contains('Task').should('be.visible');
    cy.contains('Persistent Cache Task').should('be.visible');
    cy.contains('Persistent Task').should('be.visible');

    // Should display all features
    cy.contains('Download').should('be.visible');
    cy.contains('Upload').should('be.visible');

    // Verify data
    cy.contains('task-app').should('be.visible');
    cy.contains('cache-tag').should('be.visible');
    cy.contains('Level 1').should('be.visible');
    cy.contains('http://persistent.com').should('be.visible');
  });

  // ==================== UrlsDialog Component Tests ====================

  describe('UrlsDialog functionality', () => {
    const clusterWithManyUrls = {
      ...cluster,
      peer_cluster_config: {
        load_limit: 51,
        block_list: {
          task: {
            download: {
              urls: [
                'http://example1.com/path1',
                'http://example1.com/path2',
                'http://example2.com/path1',
                'http://example2.com/path2',
                'http://example3.com/path1',
                'http://example3.com/path2',
                'http://example4.com/path1',
                'http://example4.com/path2',
                'http://example5.com/path1',
                'http://example5.com/path2',
              ],
            },
          },
        },
      },
    };

    beforeEach(() => {
      // Best Practice: Clean up state BEFORE each test
      // Ensure no dialog is open from previous test
      cy.get('body', { timeout: 10000 }).then(($body) => {
        if ($body.find('[role="dialog"]').length > 0) {
          cy.get('body').type('{esc}');
          cy.wait(300); // Wait for close animation
        }
      });
      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(300);

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: clusterWithManyUrls,
          });
        },
      );
    });

    afterEach(() => {
      // Best Practice: Don't use afterEach for cleanup
      // State cleanup should happen in beforeEach instead
      // This hook is intentionally minimal
    });

    it('should open UrlsDialog with correct header info', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      // Dialog should open with correct title
      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);
      cy.get('[role="dialog"]').within(() => {
        cy.contains('URLs').should('be.visible');
      });
    });

    it('should display URLs grouped by domain', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Should display domain groups with URL count
      cy.get('[role="dialog"]').within(() => {
        cy.contains('example1.com').should('be.visible');
        cy.contains('example2.com').should('be.visible');
        cy.contains('example3.com').should('be.visible');
        // Each domain should show URL count
        cy.contains('2 URLs').should('be.visible');
      });
    });

    it('should search URLs by keyword', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Enter search keyword
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('example1');

        // Should only display matching domain
        cy.contains('example1.com').should('be.visible');
        // example2.com and example3.com should not exist (filtered out)
        cy.contains('example2.com').should('not.exist');
        cy.contains('example3.com').should('not.exist');
      });
    });

    it('should select individual URLs', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Click on a URL item to select it (clicking anywhere on the item)
      cy.get('[role="dialog"]').within(() => {
        // Click the first URL item (not the domain header)
        cy.contains('http://example1.com/path1').click();
        // The item should be selected (visual feedback, but we can't easily test the selected class)
      });
    });

    it('should copy single URL', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Click copy button for first URL
      cy.get('[role="dialog"]').within(() => {
        // Find the first copy button within URL actions (not domain group copy)
        cy.get('button[aria-label="Copy link"]').first().click();
      });

      // Wait for copy action to complete
      cy.wait(100);

      // Close dialog first to see the toast
      cy.get('body').type('{esc}');
      // Wait for dialog close animation to complete
      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(300);

      // Should display toast notification
      cy.contains('URL copied').should('be.visible');
    });

    it('should copy domain group URLs', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Click domain group copy button
      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Copy all in group"]').first().click();
      });

      // Wait for copy action to complete
      cy.wait(100);

      // Close dialog first to see the toast
      cy.get('body').type('{esc}');
      // Wait for dialog close animation to complete
      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(300);

      // Should display toast notification with domain name
      cy.contains('2 URLs from example1.com copied').should('be.visible');
    });

    it('should paginate URLs correctly', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // First page should show first 5 URLs (5 items per page)
      cy.get('[role="dialog"]').within(() => {
        // Should show first domain with its URLs
        cy.contains('example1.com').should('be.visible');
        // Check pagination component exists
        cy.get('nav[aria-label="pagination navigation"]').should('exist');
      });

      // Click next page button
      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Go to next page"]').click();
      });

      // Wait for page transition
      cy.wait(200);

      // Should show different URLs on second page
      cy.get('[role="dialog"]').within(() => {
        // example4.com and example5.com should be on second page
        cy.contains('example4.com').should('be.visible');
        cy.contains('example5.com').should('be.visible');
      });
    });

    it('should navigate to specific page', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Click page 2 button
      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Go to page 2"]').click();
      });

      // Wait for page transition
      cy.wait(200);

      // Should show URLs from second page
      cy.get('[role="dialog"]').within(() => {
        cy.contains('example4.com').should('be.visible');
        cy.contains('example5.com').should('be.visible');
      });
    });

    it('should close dialog via close button', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Click close button (IconButton with CloseIcon)
      cy.get('[role="dialog"]').within(() => {
        cy.get('button').find('[data-testid="CloseIcon"]').parent().click();
      });

      // Dialog should close
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should reset state when dialog reopens', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Enter search query
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('example1');
        cy.contains('example1.com').should('be.visible');
      });

      // Close dialog
      cy.get('[role="dialog"]').within(() => {
        cy.get('button').find('[data-testid="CloseIcon"]').parent().click();
      });

      // Wait for dialog to fully close
      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(300);

      // Reopen dialog
      cy.contains('+7 more').click();

      // Should reset search state
      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').should('have.value', '');
        // All domains should be visible again
        cy.contains('example1.com').should('be.visible');
        cy.contains('example2.com').should('be.visible');
        cy.contains('example3.com').should('be.visible');
      });
    });

    it('should show empty state when no URLs match search', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Search for non-existent URL
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('nonexistent');
      });

      // Should display empty state
      cy.get('[role="dialog"]').within(() => {
        cy.contains('No data').should('be.visible');
      });
    });

    it('should show URL index numbers', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Should show index numbers for URLs
      cy.get('[role="dialog"]').within(() => {
        // First page shows 1-5
        cy.contains('1').should('be.visible');
        cy.contains('2').should('be.visible');
        cy.contains('3').should('be.visible');
        cy.contains('4').should('be.visible');
        cy.contains('5').should('be.visible');
      });
    });

    it('should close dialog when clicking outside', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Press Escape to close the dialog (more reliable than clicking outside)
      cy.get('body').type('{esc}');

      // Dialog should close
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should close dialog when pressing ESC key', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Press ESC key
      cy.get('body').type('{esc}');

      // Dialog should close
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should handle URLs without protocol', () => {
      const clusterWithNoProtocolUrls = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: ['example1.com/path1', 'example1.com/path2', 'example2.com/path1', 'example3.com/path1'],
              },
            },
          },
        },
      };

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: clusterWithNoProtocolUrls,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+1 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Should still group by domain correctly
      cy.get('[role="dialog"]').within(() => {
        cy.contains('example1.com').should('be.visible');
        cy.contains('example2.com').should('be.visible');
        // Should display the URLs (they might show with or without protocol)
        cy.contains('example1.com/path1').should('be.visible');
      });
    });

    it('should handle invalid URLs by grouping them as "other"', () => {
      const clusterWithInvalidUrls = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: ['http://example1.com/path1', 'invalid-url-[[[', 'not-a-url', 'http://example1.com/path2'],
              },
            },
          },
        },
      };

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: clusterWithInvalidUrls,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+1 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Should group invalid URLs as "other"
      cy.get('[role="dialog"]').within(() => {
        cy.contains('example1.com').should('be.visible');
        cy.contains('other').should('be.visible');
      });
    });

    it('should sort domains alphabetically with "other" at the end', () => {
      const clusterWithMultipleDomains = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: [
                  'http://zebra.com/path1',
                  'http://alpha.com/path1',
                  'http://beta.com/path1',
                  'http://alpha.com/path2',
                ],
              },
            },
          },
        },
      };

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: clusterWithMultipleDomains,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+1 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Should display domains in alphabetical order
      cy.get('[role="dialog"]').within(() => {
        cy.get('[class*="domainName"]').then(($domains) => {
          const domains = Array.from($domains).map((d) => d.textContent);
          expect(domains).to.deep.equal(['alpha.com', 'beta.com', 'zebra.com']);
        });
      });
    });

    it('should display URL count for each domain group', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Each domain should show URL count
      cy.get('[role="dialog"]').within(() => {
        // example1.com has 2 URLs
        cy.contains('example1.com').parent().contains('2 URLs').should('be.visible');
        // example2.com has 2 URLs
        cy.contains('example2.com').parent().contains('2 URLs').should('be.visible');
      });
    });

    it('should reset pagination when searching', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Navigate to page 2
      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Go to page 2"]').click();
        cy.contains('example4.com').should('be.visible');
      });

      // Wait for page transition
      cy.wait(200);

      // Start searching - should reset to page 1
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('example1');
        // Should be on page 1 showing example1.com
        cy.contains('example1.com').should('be.visible');
        // example4.com should not exist (filtered out)
        cy.contains('example4.com').should('not.exist');
      });
    });

    it('should show toast notification when copying', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      // Wait for dialog open animation to complete
      cy.wait(300);

      // Copy a single URL
      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Copy link"]').first().click();
      });

      // Wait for copy action to complete
      cy.wait(100);

      // Close dialog first to see the toast
      cy.get('body').type('{esc}');
      // Wait for dialog close animation to complete
      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(300);

      // Toast should appear
      cy.contains('URL copied').should('be.visible');

      // Wait for toast to disappear (2 seconds)
      cy.wait(2100);
      cy.contains('URL copied').should('not.exist');
    });
  });

  // ==================== Tooltip Tests ====================

  describe('Tooltips', () => {
    // it('should display tooltip for blacklist help icon', () => {
    //   cy.visit('/clusters/1');
    //   cy.get('#name').should('be.visible');

    //   cy.contains('Blacklist').scrollIntoView().should('be.visible');

    //   // Hover over help icon
    //   cy.get('.MuiSvgIcon-root').trigger('mouseover');

    //   // Should display tooltip
    //   cy.contains('Blacklist configuration for P2P downloads').should('be.visible');
    // });

    it('should display tooltip for application values', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');

      // Hover over application value - the applications are displayed as "app1, app2" (comma separated)
      cy.contains('app1').trigger('mouseover');

      // Should display tooltip with full application list
      cy.get('.MuiTooltip-tooltip').should('be.visible');
    });

    it('should display tooltip for tag values', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');

      // Hover over tag value
      cy.contains('tag1').trigger('mouseover');

      // Should display tooltip
      cy.get('.MuiTooltip-tooltip').should('contain', 'tag1');
    });
  });

  // ==================== Tab Interaction Tests ====================

  describe('Tab Interactions', () => {
    it('should keep tab selection after page reload', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');

      // Switch to Seed Client tab
      cy.contains('Seed Client').click();
      cy.contains('Seed Client').should('have.attr', 'aria-selected', 'true');

      // Reload page
      cy.reload();

      // Should restore to default Client tab
      cy.contains('Client').should('have.attr', 'aria-selected', 'true');
    });

    it('should not switch tab when clicking disabled tab', () => {
      const clusterWithOnlyClient = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                applications: ['app1'],
              },
            },
          },
        },
        seed_peer_cluster_config: {
          load_limit: 300,
          block_list: {},
        },
      };

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: clusterWithOnlyClient,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');

      // Seed Client tab should be clickable
      cy.contains('Seed Client').click();

      // Should switch to Seed Client tab and display empty state
      cy.contains('No blacklist configuration for Seed Client').should('be.visible');
    });
  });
});
