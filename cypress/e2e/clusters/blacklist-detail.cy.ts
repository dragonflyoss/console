import cluster from '../../fixtures/clusters/cluster/cluster.json';

describe('Cluster Blacklist Detail Page', () => {
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

    cy.get('#name').should('be.visible');
  });

  it('should display blacklist section', () => {
    cy.contains('Blacklist').should('be.visible');
  });

  it('should display blacklist table headers', () => {
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Task Type').should('be.visible');
    cy.contains('Feature').should('be.visible');
    cy.contains('Applications').should('be.visible');
    cy.contains('Urls').should('be.visible');
    cy.contains('Tags').should('be.visible');
    cy.contains('Priorities').should('be.visible');
  });

  it('should display service type blocks with headers', () => {
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').should('be.visible');
    cy.contains('Seed Client').should('be.visible');
  });

  it('should display table rows with task types and features', () => {
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');
    cy.contains('Task').should('be.visible');
    cy.contains('Persistent Task').should('be.visible');
    cy.contains('Download').should('be.visible');
    cy.contains('Upload').should('be.visible');
  });

  it('should display option values in table cells', () => {
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');
    cy.contains('app1').scrollIntoView().should('be.visible');
    cy.contains('app2').scrollIntoView().should('be.visible');
    cy.contains('http://example.com').scrollIntoView().should('be.visible');
    cy.contains('tag1').scrollIntoView().should('be.visible');
  });

  it('should display dash for empty option values', () => {
    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');

    cy.contains('Task').should('be.visible');
    cy.contains('Persistent Task').should('be.visible');

    cy.get('table').within(() => {
      cy.contains('-').should('exist');
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

    cy.contains('Blacklist').should('be.visible');
    cy.contains('No blacklist configuration').should('be.visible');
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

    cy.contains('Blacklist').scrollIntoView().should('be.visible');
    cy.contains('Client').scrollIntoView().should('be.visible');
    cy.contains('Seed Client').scrollIntoView().should('be.visible');
    cy.contains('Task').should('be.visible');
    cy.contains('Persistent Task').should('be.visible');
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

  it('should display blacklist section independently from config section', () => {
    cy.contains('Scopes').should('be.visible');
    cy.contains('Config').should('be.visible');
    cy.contains('Blacklist').should('be.visible');

    cy.contains('Config')
      .parent()
      .within(() => {
        cy.contains('Blacklist').should('not.exist');
      });
  });

  it('should display tooltip for blacklist section', () => {
    cy.contains('Blacklist')
      .parent()
      .within(() => {
        cy.get('.MuiSvgIcon-root').should('be.visible');
      });
  });

  it('should switch between Client and Seed Client tabs', () => {
    cy.contains('Blacklist').scrollIntoView().should('be.visible');

    cy.contains('Client').should('have.attr', 'aria-selected', 'true');
    cy.contains('Seed Client').should('have.attr', 'aria-selected', 'false');

    cy.contains('Seed Client').click();
    cy.contains('Seed Client').should('have.attr', 'aria-selected', 'true');
    cy.contains('Client').should('have.attr', 'aria-selected', 'false');

    cy.contains('Persistent Task').should('be.visible');
    cy.contains('Download').should('be.visible');

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

    cy.contains('http://url1.com').should('be.visible');
    cy.contains('http://url2.com').should('be.visible');
    cy.contains('http://url3.com').should('be.visible');

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

    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('URLs').should('be.visible');

    cy.contains('http://url1.com').should('be.visible');
    cy.contains('http://url2.com').should('be.visible');
    cy.contains('http://url3.com').should('be.visible');
    cy.contains('http://url4.com').should('be.visible');

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

    cy.contains('Client').click();
    cy.contains('No blacklist configuration for Client').should('be.visible');

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

    cy.contains('Client').click();
    cy.contains('app1').should('be.visible');

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

    cy.contains('app1').should('be.visible');

    cy.get('table').within(() => {
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

    cy.get('[role="dialog"]').should('be.visible');

    cy.get('[role="dialog"]').within(() => {
      cy.get('button.MuiIconButton-root').first().click();
    });

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

    cy.get('[role="dialog"]').should('be.visible');

    cy.get('[role="dialog"]').within(() => {
      cy.get('button').find('[data-testid="CloseIcon"]').parent().click();
    });

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

    cy.get('[role="dialog"]').should('not.exist');

    cy.contains('http://url1.com').should('be.visible');
    cy.contains('http://url2.com').should('be.visible');
    cy.contains('http://url3.com').should('be.visible');

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

    cy.contains('Task').should('be.visible');
    cy.contains('Persistent Cache Task').should('be.visible');
    cy.contains('Persistent Task').should('be.visible');

    cy.contains('Download').should('be.visible');
    cy.contains('Upload').should('be.visible');

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

    it('should open UrlsDialog with correct header info', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
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
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.contains('example1.com').should('be.visible');
        cy.contains('example2.com').should('be.visible');
        cy.contains('example3.com').should('be.visible');
        cy.contains('2 URLs').should('be.visible');
      });
    });

    it('should search URLs by keyword', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('example1');

        cy.contains('example1.com').should('be.visible');
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
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.contains('http://example1.com/path1').click();
      });
    });

    it('should copy single URL', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Copy link"]').first().click();
      });

      cy.wait(100);

      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(300);

      cy.contains('URL copied').should('be.visible');
    });

    it('should copy domain group URLs', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Copy all in group"]').first().click();
      });

      cy.wait(100);

      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(300);

      cy.contains('2 URLs from example1.com copied').should('be.visible');
    });

    it('should paginate URLs correctly', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.contains('example1.com').should('be.visible');
        cy.get('nav[aria-label="pagination navigation"]').should('exist');
      });

      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Go to next page"]').click();
      });

      cy.wait(200);

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
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('button').find('[data-testid="CloseIcon"]').parent().click();
      });

      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should reset state when dialog reopens', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('example1');
        cy.contains('example1.com').should('be.visible');
      });

      cy.get('[role="dialog"]').within(() => {
        cy.get('button').find('[data-testid="CloseIcon"]').parent().click();
      });

      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(300);

      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').should('have.value', '');
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
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('nonexistent');
      });

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
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.contains('1').should('be.visible');
        cy.contains('2').should('be.visible');
        cy.contains('3').should('be.visible');
        cy.contains('4').should('be.visible');
        cy.contains('5').should('be.visible');
      });
    });

    it('should close dialog when pressing ESC key', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('body').type('{esc}');

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
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.contains('example1.com').should('be.visible');
        cy.contains('example2.com').should('be.visible');
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
      cy.wait(300);

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
      cy.wait(300);

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
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.contains('example1.com').parent().contains('2 URLs').should('be.visible');
        cy.contains('example2.com').parent().contains('2 URLs').should('be.visible');
      });
    });

    it('should reset pagination when searching', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Go to page 2"]').click();
        cy.contains('example4.com').should('be.visible');
      });

      cy.wait(200);

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('example1');
        cy.contains('example1.com').should('be.visible');
        cy.contains('example4.com').should('not.exist');
      });
    });
  });

  // ==================== Tooltip Tests ====================

  describe('Tooltips', () => {
    it('should display tooltip for application values', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');

      cy.contains('app1').trigger('mouseover');

      cy.get('.MuiTooltip-tooltip').should('be.visible');
    });

    it('should display tooltip for tag values', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');

      cy.contains('tag1').trigger('mouseover');

      cy.get('.MuiTooltip-tooltip').should('contain', 'tag1');
    });
  });

  // ==================== Tab Interaction Tests ====================

  describe('Tab Interactions', () => {
    it('should keep tab selection after page reload', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');

      cy.contains('Seed Client').click();
      cy.contains('Seed Client').should('have.attr', 'aria-selected', 'true');

      cy.reload();

      cy.contains('Client').should('have.attr', 'aria-selected', 'true');
    });

    it('should display empty state when switching to Seed Client tab with no data', () => {
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

      cy.contains('Seed Client').click();

      cy.contains('No blacklist configuration for Seed Client').should('be.visible');
    });
  });

  // ==================== UrlsDialog Advanced Tests ====================

  describe('UrlsDialog advanced features', () => {
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

    it('should display different toast messages for different copy actions', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      // Test single URL copy (already tested in existing tests)
      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Copy link"]').first().click();
      });
      cy.wait(100);
      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(300);
      cy.contains('URL copied').should('be.visible');
      cy.wait(2100);

      // Reopen dialog and test domain group copy
      cy.contains('+7 more').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Copy all in group"]').first().click();
      });
      cy.wait(100);
      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(300);
      cy.contains('2 URLs from example1.com copied').should('be.visible');
    });

    it('should expand all domains when dialog opens', () => {
      const clusterWithFiveDomains = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: ['http://domain1.com/1', 'http://domain2.com/1', 'http://domain3.com/1', 'http://domain4.com/1'],
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
            body: clusterWithFiveDomains,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+1 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.contains('http://domain1.com/1').should('be.visible');
        cy.contains('http://domain2.com/1').should('be.visible');
        cy.contains('http://domain3.com/1').should('be.visible');
        cy.contains('http://domain4.com/1').should('be.visible');
      });
    });

    it('should handle keyboard navigation in dialog', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      // Press Tab key to navigate
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').focus();
        cy.focused().should('have.attr', 'placeholder', 'Search URL or domain...');
      });

      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should correctly group URLs with mixed protocols', () => {
      const clusterWithMixedProtocols = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: [
                  'http://example.com/path1',
                  'https://example.com/path2',
                  'http://example.com/path3',
                  'https://other.com/path1',
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
            body: clusterWithMixedProtocols,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+1 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.contains('example.com').should('be.visible');
        cy.contains('other.com').should('be.visible');
        cy.contains('example.com').parent().contains('3 URLs').should('be.visible');
      });
    });

    it('should display correct URL index after filtering', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      // Search to filter URLs
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('example1');
        cy.wait(200);

        cy.contains('1').should('be.visible');
        cy.contains('2').should('be.visible');
        cy.contains('5').should('not.exist');
      });
    });

    it('should handle pagination edge cases', () => {
      const clusterWithExactFiveUrls = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: [
                  'http://example1.com/1',
                  'http://example2.com/1',
                  'http://example3.com/1',
                  'http://example4.com/1',
                  'http://example5.com/1',
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
            body: clusterWithExactFiveUrls,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+2 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('nav[aria-label="pagination navigation"]').should('not.exist');
      });
    });

    it('should handle copy action error gracefully', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Copy link"]').first().click();
        cy.wait(50);
        cy.get('button[aria-label="Copy link"]').first().click();
      });

      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should maintain search query while typing', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        const searchInput = cy.get('input[placeholder="Search URL or domain..."]');
        searchInput.type('example1');

        searchInput.should('have.value', 'example1');
      });
    });

    // ==================== Domain Collapse/Expand Tests ====================

    // it('should collapse and expand domain groups', () => {
    //   // Override with fewer URLs to avoid pagination
    //   const clusterWithFewUrls = {
    //     ...cluster,
    //     peer_cluster_config: {
    //       load_limit: 51,
    //       block_list: {
    //         task: {
    //           download: {
    //             urls: [
    //               'http://example1.com/path1',
    //               'http://example1.com/path2',
    //               'http://example2.com/path1',
    //               'http://example2.com/path2',
    //             ],
    //           },
    //         },
    //       },
    //     },
    //   };

    //   cy.intercept(
    //     {
    //       method: 'GET',
    //       url: '/api/v1/clusters/1',
    //     },
    //     (req) => {
    //       req.reply({
    //         statusCode: 200,
    //         body: clusterWithFewUrls,
    //       });
    //     },
    //   );

    //   cy.visit('/clusters/1');
    //   cy.get('#name').should('be.visible');

    //   cy.contains('Blacklist').scrollIntoView().should('be.visible');
    //   cy.contains('+1 more').click();

    //   cy.get('[role="dialog"]').should('be.visible');
    //   cy.wait(500); // Increase wait time for dialog to fully render

    //   // Initially all domains should be expanded
    //   cy.get('[role="dialog"]').within(() => {
    //     cy.contains('example1.com').should('be.visible');
    //     cy.contains('http://example1.com/path1').should('be.visible');
    //     cy.contains('http://example1.com/path2').should('be.visible');
    //   });

    //   // Click on domain header to collapse - use contains instead of data attribute
    //   cy.get('[role="dialog"]').within(() => {
    //     cy.contains('example1.com').click();
    //     cy.wait(300);
    //   });

    //   // URLs should be hidden
    //   cy.get('[role="dialog"]').within(() => {
    //     cy.contains('http://example1.com/path1').should('not.exist');
    //     cy.contains('http://example1.com/path2').should('not.exist');
    //   });

    //   // Click again to expand
    //   cy.get('[role="dialog"]').within(() => {
    //     cy.contains('example1.com').click();
    //     cy.wait(300);
    //   });

    //   // URLs should be visible again
    //   cy.get('[role="dialog"]').within(() => {
    //     cy.contains('http://example1.com/path1').should('be.visible');
    //     cy.contains('http://example1.com/path2').should('be.visible');
    //   });
    // });

    it('should collapse multiple domain groups independently', () => {
      // Override with fewer URLs to avoid pagination
      const clusterWithFewUrls = {
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
            body: clusterWithFewUrls,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+1 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(500);

      cy.get('[role="dialog"]').within(() => {
        cy.contains('example1.com').click();
        cy.wait(300);
      });

      cy.get('[role="dialog"]').within(() => {
        cy.contains('http://example1.com/path1').should('not.exist');
        cy.contains('http://example2.com/path1').should('be.visible');
      });

      cy.get('[role="dialog"]').within(() => {
        cy.contains('example2.com').click();
        cy.wait(300);
      });

      cy.get('[role="dialog"]').within(() => {
        cy.contains('http://example1.com/path1').should('not.exist');
        cy.contains('http://example2.com/path1').should('not.exist');
      });
    });

    // ==================== Copy All URLs Tests ====================

    it('should not show pagination when URLs count is 5 or less', () => {
      const clusterWithFiveUrls = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: ['http://example1.com/1', 'http://example2.com/1', 'http://example3.com/1'],
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
            body: clusterWithFiveUrls,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('more').should('not.exist');
    });

    it('should show pagination when URLs count exceeds 5', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('nav[aria-label="pagination navigation"]').should('be.visible');
      });
    });

    // ==================== Toast Auto-Hide Tests ====================

    it('should auto-hide toast after 2 seconds', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('button[aria-label="Copy link"]').first().click();
      });

      cy.wait(100);

      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(300);

      cy.contains('URL copied').should('be.visible');

      cy.wait(2100);

      cy.contains('URL copied').should('not.exist');
    });

    // ==================== Search Reset Tests ====================

    it('should preserve expanded state when searching', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      // Collapse first domain
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="domain-header"][data-domain="example1.com"]').click();
        cy.wait(200);
      });

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('example');
        cy.wait(200);
      });

      cy.get('[role="dialog"]').within(() => {
        cy.contains('http://example1.com/path1').should('not.exist');
        cy.contains('http://example2.com/path1').should('be.visible');
      });
    });

    // ==================== Edge Cases ====================

    it('should handle URLs with special characters', () => {
      const clusterWithSpecialUrls = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: [
                  'http://example.com/path?query=1&key=value',
                  'http://example.com/path#fragment',
                  'http://example.com/path with spaces',
                  'http://example.com/路径',
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
            body: clusterWithSpecialUrls,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+1 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.contains('query=1').should('be.visible');
        cy.contains('fragment').should('be.visible');
      });
    });

    it('should handle very long URLs', () => {
      const longPath = 'a'.repeat(100);
      const clusterWithLongUrls = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: [`http://example.com/${longPath}`, 'http://example.com/short'],
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
            body: clusterWithLongUrls,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('example.com').should('be.visible');
    });

    it('should handle single URL', () => {
      const clusterWithSingleUrl = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: ['http://example.com/single'],
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
            body: clusterWithSingleUrl,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');

      cy.contains('http://example.com/single').should('be.visible');
      cy.contains('more').should('not.exist');
    });

    it('should handle exactly 4 URLs (show +1 more)', () => {
      const clusterWithFourUrls = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: [
                  'http://example1.com/1',
                  'http://example1.com/2',
                  'http://example1.com/3',
                  'http://example1.com/4',
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
            body: clusterWithFourUrls,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');

      cy.contains('http://example1.com/1').should('be.visible');
      cy.contains('http://example1.com/2').should('be.visible');
      cy.contains('http://example1.com/3').should('be.visible');
      cy.contains('+1 more').should('be.visible');
    });

    // ==================== Domain Sorting Tests ====================

    it('should sort domains case-insensitively', () => {
      const clusterWithMixedCaseDomains = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: [
                  'http://Zebra.com/path1',
                  'http://alpha.com/path1',
                  'http://Beta.com/path1',
                  'http://gamma.com/path1', // Add more URLs to show +N more button
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
            body: clusterWithMixedCaseDomains,
          });
        },
      );

      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+1 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="domain-header"]').then(($headers) => {
          const domains = Array.from($headers)
            .map((h) => h.getAttribute('data-domain'))
            .filter((d): d is string => d !== null);
          expect(domains[0].toLowerCase().localeCompare(domains[1].toLowerCase())).to.be.lessThan(0);
        });
      });
    });

    // ==================== Search Edge Cases ====================

    it('should handle search with case-insensitive matching', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('EXAMPLE1');
        cy.wait(200);

        cy.contains('example1.com').should('be.visible');
      });
    });

    it('should handle search with partial domain match', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('example');
        cy.wait(200);

        cy.contains('example1.com').should('be.visible');
        cy.contains('example2.com').should('be.visible');
        cy.contains('example3.com').should('be.visible');
      });
    });

    // ==================== Accessibility Tests ====================

    it('should have accessible dialog structure', () => {
      cy.visit('/clusters/1');
      cy.get('#name').should('be.visible');

      cy.contains('Blacklist').scrollIntoView().should('be.visible');
      cy.contains('+7 more').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').should('have.attr', 'role', 'dialog');

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').should('be.visible');
      });
    });

    // ==================== Performance Tests ====================

    it('should handle large number of URLs efficiently', () => {
      // Generate 50 URLs
      const manyUrls = Array.from({ length: 50 }, (_, i) => `http://example${Math.floor(i / 5)}.com/path${i}`);

      const clusterWithManyUrls = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                urls: manyUrls,
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
      cy.contains('+47 more').click();

      // Dialog should open within reasonable time
      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);

      cy.get('[role="dialog"]').within(() => {
        cy.get('nav[aria-label="pagination navigation"]').should('be.visible');
      });

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[placeholder="Search URL or domain..."]').type('example0');
        cy.wait(300);
        cy.contains('example0.com').should('be.visible');
      });
    });
  });
});
