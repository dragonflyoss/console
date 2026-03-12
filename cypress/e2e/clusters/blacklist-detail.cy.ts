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

  it('should display blacklist card titles', () => {
    // Verify the new nested structure with service type and task type titles
    cy.contains('Client').should('be.visible');
    cy.contains('Task').should('be.visible');
    cy.contains('Download').should('be.visible');
  });

  it('should display all blacklist cards in grid layout', () => {
    // Verify service type sections
    cy.contains('Client').should('be.visible');
    cy.contains('Seed Client').should('be.visible');

    // Verify task type sections
    cy.contains('Task').should('be.visible');
    cy.contains('Persistent Cache Task').should('be.visible');
    cy.contains('Persistent Task').should('be.visible');
  });

  it('should display option values in blacklist cards', () => {
    // Verify blacklist cards show option names and values.
    // Scroll to the blacklist section first to ensure elements are in viewport
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');
    cy.contains('Task').scrollIntoView().should('be.visible');
    cy.contains('Download').scrollIntoView().should('be.visible');
    cy.contains('Applications').scrollIntoView().should('be.visible');
    cy.contains('app1').scrollIntoView().should('be.visible');
    cy.contains('app2').scrollIntoView().should('be.visible');
    cy.contains('Urls').scrollIntoView().should('be.visible');
    cy.contains('http://example.com').scrollIntoView().should('be.visible');
  });

  it('should display all option types for each blacklist entry', () => {
    // Each blacklist card should show all option types: Applications, Urls, Tags, Priorities
    // Even if some options have no values, they should be displayed with '-'
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');
    cy.contains('Task').scrollIntoView().should('be.visible');
    cy.contains('Download').scrollIntoView().should('be.visible');
    cy.contains('Applications').scrollIntoView().should('be.visible');
    cy.contains('Urls').scrollIntoView().should('be.visible');
    cy.contains('Tags').scrollIntoView().should('be.visible');
    cy.contains('Priorities').scrollIntoView().should('be.visible');
  });

  it('should display dash for empty option values', () => {
    // Options with no values should display '-'
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');
    cy.contains('Task').scrollIntoView().should('be.visible');
    cy.contains('Download').scrollIntoView().should('be.visible');

    // Find the Download card and check its content
    cy.contains('Download')
      .closest('.blacklistCard')
      .within(() => {
        // Scroll within the card to ensure elements are in viewport
        cy.contains('Tags').scrollIntoView().should('be.visible');
        cy.contains('Priorities').scrollIntoView().should('be.visible');
        // These should display '-' for empty values
        cy.contains('-').should('be.visible');
      });
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
    // Service types and task types should not be visible when there's no data
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
          task: {
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

    // Verify the new nested structure is displayed
    cy.contains('Client').should('be.visible');
    cy.contains('Seed Client').should('be.visible');
    cy.contains('Task').should('be.visible');
    cy.contains('Persistent Cache Task').should('be.visible');
  });

  it('should display detailed info including all options', () => {
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');
    cy.contains('Task').scrollIntoView().should('be.visible');
    cy.contains('Download').scrollIntoView().should('be.visible');
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
    cy.contains('Task').scrollIntoView().should('be.visible');
    cy.contains('Download').scrollIntoView().should('be.visible');
    cy.contains('Priorities').scrollIntoView().should('be.visible');
    cy.contains('1').scrollIntoView().should('be.visible');
    cy.contains('3').scrollIntoView().should('be.visible');
    cy.contains('5').scrollIntoView().should('be.visible');
  });

  it('should display cards for both Client and Seed Client', () => {
    // Verify service type sections
    cy.contains('Client').should('be.visible');
    cy.contains('Seed Client').should('be.visible');
    // Verify task type sections
    cy.contains('Task').should('be.visible');
    cy.contains('Persistent Cache Task').should('be.visible');
    cy.contains('Persistent Task').should('be.visible');
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
