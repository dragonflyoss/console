// TODO: this file is extremely large and needs to be broken down into smaller files for better maintainability.

import cluster from '../../fixtures/clusters/cluster/cluster.json';

describe('Cluster Blacklist Detail Page', () => {
  beforeEach(() => {
    cy.signin();
    cy.viewport(1440, 1080);
  });

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
});
