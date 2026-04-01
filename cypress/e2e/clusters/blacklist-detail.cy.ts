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

  it('should switch between Client and Seed Client tabs', () => {
    cy.contains('Blacklist').scrollIntoView().should('be.visible');

    // 默认应该显示 Client tab
    cy.contains('Client').should('have.attr', 'aria-selected', 'true');
    cy.contains('Seed Client').should('have.attr', 'aria-selected', 'false');

    // 点击 Seed Client tab
    cy.contains('Seed Client').click();
    cy.contains('Seed Client').should('have.attr', 'aria-selected', 'true');
    cy.contains('Client').should('have.attr', 'aria-selected', 'false');

    // 应该显示 Seed Client 的数据
    cy.contains('Persistent Task').should('be.visible');
    cy.contains('Download').should('be.visible');

    // 切换回 Client tab
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

    // 应该显示前3个 URL
    cy.contains('http://url1.com').should('be.visible');
    cy.contains('http://url2.com').should('be.visible');
    cy.contains('http://url3.com').should('be.visible');

    // 应该显示 "+2 more" 按钮
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

    // 对话框应该打开
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('URLs').should('be.visible');
    cy.contains('4 URLs').should('be.visible');

    // 应该显示所有 URL
    cy.contains('http://url1.com').should('be.visible');
    cy.contains('http://url2.com').should('be.visible');
    cy.contains('http://url3.com').should('be.visible');
    cy.contains('http://url4.com').should('be.visible');

    // 按 Escape 关闭对话框
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

    // 应该显示所有优先级标签
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

    // Client tab 应该显示空状态
    cy.contains('Client').click();
    cy.contains('No blacklist configuration for Client').should('be.visible');

    // Seed Client tab 应该有数据
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

    // Client tab 应该有数据
    cy.contains('Client').click();
    cy.contains('app1').should('be.visible');

    // Seed Client tab 应该显示空状态
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
              // 只有 applications,其他字段为空
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

    // 应该显示 applications
    cy.contains('app1').should('be.visible');

    // 应该在表格中显示短横线 (Tags, Priorities 和 Urls 列)
    cy.get('table').within(() => {
      // 检查是否有短横线显示(表示空值)
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

    // 应该显示 Persistent Cache Task
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

    // 应该显示空状态，因为所有选项都为空
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

    // Hover over applications 应该显示 tooltip
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

    // 对话框应该打开
    cy.get('[role="dialog"]').should('be.visible');

    // 点击复制按钮 - IconButton 不包含文本,直接点击第一个 IconButton
    cy.get('[role="dialog"]').within(() => {
      cy.get('button.MuiIconButton-root').first().click();
    });

    // 验证对话框仍然可见
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

    // 对话框应该打开
    cy.get('[role="dialog"]').should('be.visible');

    // 点击对话框外部关闭
    cy.get('[role="dialog"]').click({ force: true });
  });

  it('should display URL count in dialog header', () => {
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
    cy.contains('+2 more').click();

    // 对话框应该显示正确的 URL 数量
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('5 URLs').should('be.visible');
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

    // 应该显示所有3个 URL
    cy.contains('http://url1.com').should('be.visible');
    cy.contains('http://url2.com').should('be.visible');
    cy.contains('http://url3.com').should('be.visible');

    // 不应该显示 "+N more" 按钮
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

    // 应该显示所有任务类型
    cy.contains('Task').should('be.visible');
    cy.contains('Persistent Cache Task').should('be.visible');
    cy.contains('Persistent Task').should('be.visible');

    // 应该显示所有 feature
    cy.contains('Download').should('be.visible');
    cy.contains('Upload').should('be.visible');

    // 验证数据
    cy.contains('task-app').should('be.visible');
    cy.contains('cache-tag').should('be.visible');
    cy.contains('Level 1').should('be.visible');
    cy.contains('http://persistent.com').should('be.visible');
  });
});
