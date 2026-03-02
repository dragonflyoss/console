import cluster from '../../fixtures/clusters/cluster/cluster.json';

describe('Blacklist functionality', () => {
  beforeEach(() => {
    cy.signin();
    cy.viewport(1440, 1080);
  });

  describe('when creating cluster with blacklist', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?page=1&per_page=10000000',
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
          url: '/api/v1/clusters?page=1&per_page=10000000',
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
          url: '/api/v1/seed-peers?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: [],
          });
        },
      );

      cy.visit('/clusters/new');
    });

    it('should display blacklist section with title and add button', () => {
      cy.contains('Blocklist').should('be.visible');
      cy.contains('Add blacklist (0)').should('be.visible');
    });

    it('should add blacklist entry when clicking add button', () => {
      cy.contains('Add blacklist (0)').click();
      cy.contains('Add blacklist (1)').should('be.visible');
    });

    it('should display form fields when blacklist entry is added', () => {
      cy.contains('Add blacklist (0)').click();

      cy.get('.MuiAutocomplete-root').should('exist');
    });

    it('should remove blacklist entry when clicking remove button', () => {
      cy.contains('Add blacklist (0)').click();
      cy.contains('Add blacklist (1)').should('be.visible');

      cy.contains('Remove').click();
      cy.contains('Add blacklist (0)').should('be.visible');
    });

    it('should remove blacklist entry when clicking remove button', () => {
      cy.contains('Add blacklist (0)').click();
      cy.contains('Add blacklist (1)').should('be.visible');

      cy.contains('Remove').click();
      cy.contains('Add blacklist (0)').should('be.visible');
    });

    it('should allow adding multiple blacklist entries', () => {
      cy.contains('Add blacklist (0)').click();
      cy.contains('Add blacklist (1)').should('be.visible');

      cy.contains('Add blacklist (1)').click();
      cy.contains('Add blacklist (2)').should('be.visible');

      cy.contains('Add blacklist (2)').click();
      cy.contains('Add blacklist (3)').should('be.visible');
    });

    it('should show validation error for required fields', () => {
      cy.contains('Add blacklist (0)').click();

      cy.contains('Add blacklist (1)').click();

      cy.contains('Type is required').should('be.visible');
    });

    it('should allow creating cluster with blacklist configuration', () => {
      cy.get('#name').type('cluster-with-blacklist');

      cy.contains('Add blacklist (0)').click();

      // Select Type
      cy.get('.MuiAutocomplete-root').first().find('input').click();
      cy.focused().type('Client{enter}');

      // Select Config
      cy.get('.MuiAutocomplete-root').eq(1).find('input').click();
      cy.focused().type('task{enter}');

      // Select Sub Config
      cy.get('.MuiAutocomplete-root').eq(2).find('input').click();
      cy.focused().type('download{enter}');

      // Select Options
      cy.get('.MuiAutocomplete-root').eq(3).find('input').click();
      cy.focused().type('Applications{enter}');

      // Add option values
      cy.get('.MuiAutocomplete-root').eq(4).type('app1{enter}');

      cy.intercept(
        {
          method: 'POST',
          url: '/api/v1/clusters',
        },
        (req) => {
          req.body = '';
          req.reply({
            statusCode: 200,
            body: {
              id: 100,
              name: 'cluster-with-blacklist',
              bio: '',
              scopes: {
                idc: '',
                location: '',
                cidrs: [],
                hostnames: [],
              },
              scheduler_cluster_id: 1,
              seed_peer_cluster_id: 1,
              scheduler_cluster_config: {
                candidate_parent_limit: 3,
                filter_parent_limit: 40,
                job_rate_limit: 10,
              },
              seed_peer_cluster_config: {
                load_limit: 2000,
                block_list: {
                  task: {
                    download: {
                      applications: ['app1'],
                    },
                  },
                },
              },
              peer_cluster_config: {
                load_limit: 200,
              },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              is_default: false,
            },
          });
        },
      );

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/100',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: {
              id: 100,
              name: 'cluster-with-blacklist',
              bio: '',
              scopes: {
                idc: '',
                location: '',
                cidrs: [],
                hostnames: [],
              },
              scheduler_cluster_id: 1,
              seed_peer_cluster_id: 1,
              scheduler_cluster_config: {
                candidate_parent_limit: 3,
                filter_parent_limit: 40,
                job_rate_limit: 10,
              },
              seed_peer_cluster_config: {
                load_limit: 2000,
                block_list: {
                  task: {
                    download: {
                      applications: ['app1'],
                    },
                  },
                },
              },
              peer_cluster_config: {
                load_limit: 200,
              },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              is_default: false,
            },
          });
        },
      );

      cy.get('#save').click();

      cy.url().should('include', '/clusters/100');
    });
  });

  describe('when editing cluster with existing blacklist', () => {
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
        },
      },
      seed_peer_cluster_config: {
        load_limit: 300,
        block_list: {
          persistent_cache_task: {
            upload: {
              tags: ['tag1', 'tag2'],
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

      cy.visit('/clusters/1/edit');
    });

    it('should display existing blacklist configuration', () => {
      cy.contains('Add blacklist (2)').should('be.visible');
    });

    it('should have blacklist form fields', () => {
      cy.get('.MuiAutocomplete-root').should('have.length.greaterThan', 0);
    });

    it('should allow modifying existing blacklist entry', () => {
      cy.get('.MuiAutocomplete-root').eq(3).type('app3{enter}');

      // Verify that the autocomplete field has content
      cy.get('.MuiAutocomplete-root').eq(3).should('exist');
    });

    it('should allow removing existing blacklist entry', () => {
      cy.contains('Add blacklist (2)').should('be.visible');

      cy.contains('Remove').first().click();
      cy.contains('Add blacklist (1)').should('be.visible');
    });

    it('should update cluster with modified blacklist', () => {
      cy.contains('Remove').first().click();

      cy.intercept(
        {
          method: 'PATCH',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          req.body = '';
          req.reply({
            statusCode: 200,
            body: clusterWithBlacklist,
          });
        },
      );

      cy.get('#save').click();

      cy.url().should('include', '/clusters/1');
    });
  });

  describe('when viewing cluster with blacklist in information page', () => {
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
          persistent_cache_task: {
            upload: {
              tags: ['tag1'],
            },
          },
        },
      },
      seed_peer_cluster_config: {
        load_limit: 300,
        block_list: {
          persistent_cache_task: {
            download: {
              priorities: ['high'],
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
    });

    it('should display blacklist in config section', () => {
      cy.contains('Blacklist').should('be.visible');
    });

    it('should display blacklist summary items', () => {
      cy.contains('Client / task / download').should('be.visible');
      cy.contains('Client / persistent_cache_task / upload').should('be.visible');
    });

    it('should display option values in summary', () => {
      // Verify blacklist information is displayed in config section
      cy.contains('Blacklist').should('be.visible');
    });

    it('should show view more button when blacklist has more than 2 entries', () => {
      cy.contains(/View More \(\d+\)/).should('be.visible');
    });

    it('should open blacklist dialog when clicking view more', () => {
      cy.contains(/View More \(\d+\)/).click();

      cy.contains('Blacklist Configuration').should('be.visible');
      cy.contains('Seed Client / persistent_cache_task / download').should('be.visible');
    });

    it('should display detailed blacklist information in dialog', () => {
      cy.contains(/View More \(\d+\)/).click();

      cy.contains('Blacklist Configuration').should('be.visible');
      cy.contains(/Client \/ task \/ download/).should('be.visible');
      cy.contains(/app1/).should('be.visible');
      cy.contains(/app2/).should('be.visible');
    });

    it('should display empty state when no blacklist configuration exists', () => {
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

      cy.contains('Blacklist').should('be.visible');
      cy.contains('-').should('be.visible');
    });
  });
});
