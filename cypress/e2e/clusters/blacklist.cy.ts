import cluster from '../../fixtures/clusters/cluster/cluster.json';

describe('Blacklist functionality', () => {
  beforeEach(() => {
    cy.signin();
    cy.viewport(1440, 1080);
  });

  // 辅助函数：更稳定地选择Autocomplete选项
  const selectAutocompleteOption = (labelText: any, optionText: any) => {
    cy.contains('label', labelText).parent().find('input').first().as('inputField');
    cy.get('@inputField').should('be.visible').click();
    cy.get('@inputField').type(optionText, { force: true });
    cy.get('.MuiAutocomplete-popper').should('be.visible');
    cy.get('.MuiAutocomplete-popper').contains(optionText).should('be.visible').click();
  };

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

      // Wait for the page to be fully loaded.
      cy.get('#name').should('be.visible');
      cy.contains('Blocklist').should('be.visible');
      cy.contains('Add blacklist').should('be.visible');
    });

    it('should display blacklist section with title and add button', () => {
      cy.contains('Blocklist').should('be.visible');
      cy.contains('Add blacklist').should('be.visible');
    });

    it('should add blacklist entry when clicking add button', () => {
      cy.contains('Add blacklist').click();

      // After clicking, form fields should appear.
      cy.contains('label', 'Service').should('be.visible');
    });

    it('should display form fields when blacklist entry is added', () => {
      cy.contains('Add blacklist').click();

      cy.get('.MuiAutocomplete-root').should('exist');
      cy.contains('label', 'Service').should('be.visible');
      cy.contains('label', 'Task Type').should('be.visible');
      cy.contains('label', 'Feature').should('be.visible');
    });

    it('should allow adding multiple blacklist entries', () => {
      // Add first entry.
      cy.contains('Add blacklist').click();
      cy.get('[data-testid="blacklist-item"]').should('have.length', 1);

      // Add second entry.
      cy.contains('Add blacklist').click();
      cy.get('[data-testid="blacklist-item"]').should('have.length', 2);
    });

    it('should show validation error for required fields', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Service field should show required error when empty.
      cy.contains('Service is required').should('be.visible');
    });

    it('should show Task Type field when Service is selected', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Service - use more precise selector to target the Service field in blacklist
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Task Type field should be enabled when Service is selected.
      cy.contains('label', 'Task Type').should('be.visible');
      cy.contains('label', 'Task Type')
        .closest('.MuiAutocomplete-root')
        .should('exist')
        .find('input')
        .should('not.be.disabled');
    });

    it('should show Feature field when Service and Task Type are selected', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Service.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Select Task Type.
      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Task', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Feature field should be enabled when Service and Task Type are selected.
      cy.contains('label', 'Feature').should('be.visible');
      cy.contains('label', 'Feature').closest('.MuiAutocomplete-root').find('input').should('not.be.disabled');
    });

    it('should disable Task Type when Service is not selected', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Task Type should be disabled when Service is not selected.
      // Check the input element's disabled attribute
      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').find('input').should('be.disabled');
    });

    it('should disable Feature when Task Type is not selected', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Service only.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Feature should be disabled when Task Type is not selected.
      cy.contains('label', 'Feature').closest('.MuiAutocomplete-root').find('input').should('be.disabled');
    });

    it('should disable option fields when type/config/subConfig not fully selected', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Applications, URLs, Tags should be disabled.
      cy.contains('label', 'Applications').parent().find('input').should('be.disabled');
      cy.contains('label', 'URLs').parent().find('input').should('be.disabled');
      cy.contains('label', 'Tags').parent().find('input').should('be.disabled');
    });

    it('should enable option fields when all selectors are filled', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Service.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Select Task Type.
      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Task', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Task type 'task' auto-sets Feature to 'download', so all selectors are filled.
      // Applications, URLs, Tags should now be enabled.
      cy.contains('label', 'Applications').parent().find('input').should('not.be.disabled');
      cy.contains('label', 'URLs').parent().find('input').should('not.be.disabled');
      cy.contains('label', 'Tags').parent().find('input').should('not.be.disabled');
    });

    it('should auto-set Feature to download when Task is selected', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Service - 使用更稳定的选择器策略
      cy.contains('label', 'Service').parent().find('input').first().as('serviceInput');
      cy.get('@serviceInput').should('be.visible').click();
      cy.get('@serviceInput').type('Client', { force: true });

      // 等待并选择下拉选项
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Client').should('be.visible').click();
      // Wait for Service selection to be processed and options to update
      cy.wait(1000);

      // Select Task Type
      cy.contains('label', 'Task Type').parent().find('input').first().as('taskInput');
      cy.get('@taskInput').should('be.visible').click();
      cy.get('@taskInput').type('Task', { force: true });

      // 等待并选择下拉选项
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Task').should('be.visible').click();

      // 验证Feature自动设置为download
      cy.contains('label', 'Feature').parent().find('input').first().should('have.value', 'download');
    });

    it('should reset Config and SubConfig when Service changes', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Client
      cy.contains('label', 'Service').parent().find('input').first().as('serviceInput');
      cy.get('@serviceInput').should('be.visible').click();
      cy.get('@serviceInput').type('Client', { force: true });
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Client').should('be.visible').click();
      // Wait for Service selection to be processed and options to update
      cy.wait(1000);

      // Select Task Type
      cy.contains('label', 'Task Type').parent().find('input').first().as('taskInput');
      cy.get('@taskInput').should('be.visible').click();
      cy.get('@taskInput').type('Task', { force: true });
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Task').should('be.visible').click();

      // Verify Task Type is set
      cy.get('@taskInput').should('have.value', 'Task');

      // Change Service to Seed Client - should reset Task Type and Feature
      cy.get('@serviceInput').clear();
      cy.get('@serviceInput').click();
      cy.get('@serviceInput').type('Seed Client', { force: true });
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Seed Client').should('be.visible').click();

      // Task Type and Feature should be reset
      cy.get('@taskInput').should('have.value', '');
      cy.contains('label', 'Feature').parent().find('input').first().should('have.value', '');
    });

    it('should prevent duplicate Service + Task Type + Feature combination', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Create first entry: Client / Task / download
      cy.contains('label', 'Service').parent().find('input').first().as('serviceInput1');
      cy.get('@serviceInput1').should('be.visible').click();
      cy.get('@serviceInput1').type('Client', { force: true });
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Client').should('be.visible').click();
      // Wait for Service selection to be processed and options to update
      cy.wait(1000);

      cy.contains('label', 'Task Type').parent().find('input').first().as('taskInput1');
      cy.get('@taskInput1').should('be.visible').click();
      cy.get('@taskInput1').type('Task', { force: true });
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Task').should('be.visible').click();
      // Wait for the popper to close after selection
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Feature auto-set to download
      cy.contains('label', 'Feature').parent().find('input').first().should('have.value', 'download');

      // Create second entry with same combination
      cy.contains('Add blacklist').scrollIntoView().click();
      // Wait for the new blacklist item to be fully rendered
      cy.get('[data-testid="blacklist-item"]').should('have.length', 2);

      // Select same Service for second entry
      cy.get('[data-testid="blacklist-item"]')
        .eq(1)
        .within(() => {
          cy.contains('label', 'Service').parent().find('input').first().as('serviceInput2');
          cy.get('@serviceInput2').should('be.visible').click();
          cy.get('@serviceInput2').type('Client', { force: true });
        });
      // Move out of .within() to find the popper which is rendered at body level
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Client').should('be.visible').click();
      // Wait for the popper to close after selection
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Wait for Service selection to be processed and options to update
      cy.get('[data-testid="blacklist-item"]')
        .eq(1)
        .within(() => {
          cy.contains('Service').parent().find('input').first().should('have.value', 'Client');
        });

      // Wait for React state to propagate and component to re-render
      // This ensures the Task Type options are updated based on the new Service selection
      cy.wait(500);

      // Try to select Task for the second entry
      // According to the component logic (getConfigOptions function):
      // - When a task type has no available subConfig combinations, it should NOT appear in dropdown
      // - For 'Task' type, the only Feature is 'download' which is already used by first entry
      // - So 'Task' should be filtered out from the dropdown options
      cy.get('[data-testid="blacklist-item"]')
        .eq(1)
        .within(() => {
          // Ensure Task Type field is enabled before clicking
          cy.contains('label', 'Task Type').parent().find('input').first().should('not.be.disabled').click();
        });
      // Move out of .within() to find the popper
      cy.get('.MuiAutocomplete-popper').should('be.visible');

      // Wait for dropdown options to be fully rendered
      cy.get('.MuiAutocomplete-popper [role="listbox"]').should('be.visible');

      // Wait for options to be filtered (Task should be hidden because it's already used)
      // Use a custom command or retry logic to verify Task is not in the available options
      cy.get('.MuiAutocomplete-popper [role="option"]').should('exist');

      // Verify that 'Task' option is NOT available in the dropdown
      // because its only Feature 'download' combination already exists
      // Use should('not.exist') with extended timeout to allow for filtering to complete
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).within(() => {
        cy.get('[role="option"]').should(($options) => {
          // Verify that none of the options contain 'Task'
          const optionTexts = $options.map((i, el) => Cypress.$(el).text()).get();
          expect(optionTexts).to.not.include('Task');
        });
      });

      // Verify that other options are still available
      // Persistent Cache Task and Persistent Task should have available combinations
      cy.get('.MuiAutocomplete-popper').contains('Persistent Cache Task').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Persistent Task').should('be.visible');

      // Close the dropdown by clicking outside or pressing escape
      cy.get('body').click(0, 0);

      // Verify that the Task Type field remains empty (no selection made)
      cy.get('[data-testid="blacklist-item"]')
        .eq(1)
        .within(() => {
          cy.contains('label', 'Task Type').parent().find('input').first().should('have.value', '');
        });
    });

    it('should show download and upload options for Persistent Cache Task', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Service
      cy.contains('label', 'Service').parent().find('input').first().as('serviceInput');
      cy.get('@serviceInput').should('be.visible').click();
      cy.get('@serviceInput').type('Client', { force: true });
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Client').should('be.visible').click();
      // Wait for Service selection to be processed and options to update
      cy.wait(1000);

      // Select Persistent Cache Task
      cy.contains('label', 'Task Type').parent().find('input').first().as('taskInput');
      cy.get('@taskInput').should('be.visible').click();
      cy.get('@taskInput').type('Persistent Cache Task', { force: true });
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Persistent Cache Task').should('be.visible').click();

      // Check Feature dropdown has both download and upload options
      cy.contains('label', 'Feature').parent().find('input').first().as('featureInput');
      cy.get('@featureInput').should('be.visible').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('download').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('upload').should('be.visible');
    });

    it('should show download and upload options for Persistent Task', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Service.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Client').should('be.visible').click();
      // Wait for Service selection to be processed and options to update
      cy.wait(1000);

      // Select Persistent Task.
      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Persistent Task').should('be.visible').click();

      // Check Feature dropdown has both download and upload options.
      cy.contains('label', 'Feature').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('download').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('upload').should('be.visible');
    });

    it('should only show download option for Task type', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Service.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Client').should('be.visible').click();
      // Wait for Service selection to be processed and options to update
      cy.wait(1000);

      // Select Task.
      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Task').should('be.visible').click();

      // Check Feature dropdown has only download option.
      cy.contains('label', 'Feature').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('download').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('upload').should('not.exist');
    });

    it('should filter out invalid URLs', () => {
      cy.contains('Add blacklist').click();

      // Fill required fields.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Client').click();

      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]').contains('Task', { timeout: 10000 }).click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Feature auto-set to download.

      // Try to add invalid URL - it will be filtered out.
      cy.contains('label', 'URLs').parent().find('input').type('invalid-url{enter}');

      // Invalid URL should not be added as a chip.
      cy.contains('label', 'URLs').parent().find('.MuiChip-root').should('not.exist');
    });

    it('should accept valid URLs', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Fill required fields.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Task', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Feature auto-set to download.

      // Add valid URLs.
      cy.contains('label', 'URLs').parent().find('input').type('http://example.com{enter}');
      cy.contains('label', 'URLs').parent().find('input').type('https://example.org/path{enter}');

      // URLs should be added as chips.
      cy.contains('.MuiChip-root', 'http://example.com').should('be.visible');
      cy.contains('.MuiChip-root', 'https://example.org/path').should('be.visible');
    });

    it('should show Priorities field only when Feature is download', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Fill required fields.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Persistent Cache Task').should('be.visible').click();

      // Select download - Priorities should be visible.
      cy.contains('label', 'Feature').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('download').should('be.visible').click();

      cy.contains('label', 'Priorities').should('be.visible');
    });

    it('should not show Priorities field when Feature is upload', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Fill required fields.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Persistent Cache Task').should('be.visible').click();

      // Select upload - Priorities should not be visible.
      cy.contains('label', 'Feature').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('upload').should('be.visible').click();

      cy.contains('label', 'Priorities').should('not.exist');
    });

    it('should allow selecting Priority levels', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Fill required fields with download feature.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Task', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Feature auto-set to download, Priorities should be visible.
      cy.contains('label', 'Priorities').parent().find('input').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Level 1').should('be.visible').click();

      cy.contains('label', 'Priorities').parent().find('input').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Level 3').should('be.visible').click();

      // Verify selected priorities are shown as chips.
      cy.contains('label', 'Priorities').parent().find('.MuiChip-root').should('have.length', 2);
    });

    it('should allow adding Seed Client blacklist entry', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Seed Client.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Seed Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Select Task Type.
      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Task', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Feature auto-set to download.
      cy.contains('label', 'Feature')
        .closest('.MuiAutocomplete-root')
        .within(() => {
          cy.get('input').should('have.value', 'download');
        });

      // Verify option fields are enabled.
      cy.contains('label', 'Applications').parent().find('input').should('not.be.disabled');
    });

    it('should handle Persistent Task type with correct mapping (persistent_cache_task to persistent_task)', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Client Service.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Select Persistent Task.
      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Persistent Task', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Select Feature.
      cy.contains('label', 'Feature').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('download').should('be.visible').click();

      // Add options.
      cy.contains('label', 'Applications').parent().find('input').type('app1{enter}');
      cy.contains('label', 'URLs').parent().find('input').type('http://example.com{enter}');
      cy.contains('label', 'Tags').parent().find('input').type('tag1{enter}');

      // Create cluster.
      cy.get('#name').type('cluster-persistent-task');

      cy.intercept(
        {
          method: 'POST',
          url: '/api/v1/clusters',
        },
        (req) => {
          // Client type should use peer_cluster_config (not seed_peer_cluster_config).
          expect(req.body.peer_cluster_config?.block_list?.persistent_task).to.exist;
          expect(req.body.peer_cluster_config?.block_list?.persistent_cache_task).to.not.exist;

          req.reply({
            statusCode: 200,
            body: {
              id: 101,
              name: 'cluster-persistent-task',
              bio: '',
              scopes: { idc: '', location: '', cidrs: [], hostnames: [] },
              scheduler_cluster_id: 1,
              seed_peer_cluster_id: 1,
              scheduler_cluster_config: { candidate_parent_limit: 3, filter_parent_limit: 40, job_rate_limit: 10 },
              seed_peer_cluster_config: { load_limit: 2000 },
              peer_cluster_config: {
                load_limit: 200,
                block_list: {
                  persistent_task: {
                    download: { applications: ['app1'], urls: ['http://example.com'], tags: ['tag1'] },
                  },
                },
              },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              is_default: false,
            },
          });
        },
      ).as('createCluster');

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/101',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: {
              id: 101,
              name: 'cluster-persistent-task',
              bio: '',
              scopes: { idc: '', location: '', cidrs: [], hostnames: [] },
              scheduler_cluster_id: 1,
              seed_peer_cluster_id: 1,
              scheduler_cluster_config: { candidate_parent_limit: 3, filter_parent_limit: 40, job_rate_limit: 10 },
              seed_peer_cluster_config: { load_limit: 2000 },
              peer_cluster_config: {
                load_limit: 200,
                block_list: {
                  persistent_task: {
                    download: { applications: ['app1'], urls: ['http://example.com'], tags: ['tag1'] },
                  },
                },
              },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              is_default: false,
            },
          });
        },
      );

      cy.get('#save').click();
      cy.wait('@createCluster');
      cy.url().should('include', '/clusters/101');
    });

    it('should create cluster with complete blacklist configuration', () => {
      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Service
      cy.contains('label', 'Service').parent().find('input').first().as('serviceInput');
      cy.get('@serviceInput').should('be.visible').click();
      cy.get('@serviceInput').type('Client', { force: true });
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Client').should('be.visible').click();
      // Wait for Service selection to be processed and options to update
      cy.wait(1000);

      // Select Task Type
      cy.contains('label', 'Task Type').parent().find('input').first().as('taskInput');
      cy.get('@taskInput').should('be.visible').click();
      cy.get('@taskInput').type('Task', { force: true });
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Task').should('be.visible').click();

      // Feature auto-set to download

      // Add Applications
      cy.contains('label', 'Applications').parent().find('input').first().type('app1{enter}');
      cy.contains('label', 'Applications').parent().find('input').first().type('app2{enter}');

      // Add URLs
      cy.contains('label', 'URLs').parent().find('input').first().type('http://example1.com{enter}');
      cy.contains('label', 'URLs').parent().find('input').first().type('https://example2.com{enter}');

      // Add Tags
      cy.contains('label', 'Tags').parent().find('input').first().type('tag1{enter}');
      cy.contains('label', 'Tags').parent().find('input').first().type('tag2{enter}');

      // Add Priorities
      cy.contains('label', 'Priorities').parent().find('input').first().click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Level 1').should('be.visible').click();
      cy.contains('label', 'Priorities').parent().find('input').first().click();
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Level 3').should('be.visible').click();

      // Create cluster
      cy.get('#name').type('cluster-complete-blacklist');

      cy.intercept(
        {
          method: 'POST',
          url: '/api/v1/clusters',
        },
        (req) => {
          expect(req.body.peer_cluster_config?.block_list).to.exist;
          expect(req.body.peer_cluster_config?.block_list?.task?.download?.applications).to.deep.equal([
            'app1',
            'app2',
          ]);
          expect(req.body.peer_cluster_config?.block_list?.task?.download?.urls).to.deep.equal([
            'http://example1.com',
            'https://example2.com',
          ]);
          expect(req.body.peer_cluster_config?.block_list?.task?.download?.tags).to.deep.equal(['tag1', 'tag2']);
          expect(req.body.peer_cluster_config?.block_list?.task?.download?.priorities).to.deep.equal([1, 3]);

          req.reply({
            statusCode: 200,
            body: {
              id: 102,
              name: 'cluster-complete-blacklist',
              bio: '',
              scopes: { idc: '', location: '', cidrs: [], hostnames: [] },
              scheduler_cluster_id: 1,
              seed_peer_cluster_id: 1,
              scheduler_cluster_config: { candidate_parent_limit: 3, filter_parent_limit: 40, job_rate_limit: 10 },
              seed_peer_cluster_config: { load_limit: 2000 },
              peer_cluster_config: {
                load_limit: 200,
                block_list: {
                  task: {
                    download: {
                      applications: ['app1', 'app2'],
                      urls: ['http://example1.com', 'https://example2.com'],
                      tags: ['tag1', 'tag2'],
                      priorities: [1, 3],
                    },
                  },
                },
              },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              is_default: false,
            },
          });
        },
      ).as('createCluster');

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/102',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: {
              id: 102,
              name: 'cluster-complete-blacklist',
              bio: '',
              scopes: { idc: '', location: '', cidrs: [], hostnames: [] },
              scheduler_cluster_id: 1,
              seed_peer_cluster_id: 1,
              scheduler_cluster_config: { candidate_parent_limit: 3, filter_parent_limit: 40, job_rate_limit: 10 },
              seed_peer_cluster_config: { load_limit: 2000 },
              peer_cluster_config: {
                load_limit: 200,
                block_list: {
                  task: {
                    download: {
                      applications: ['app1', 'app2'],
                      urls: ['http://example1.com', 'https://example2.com'],
                      tags: ['tag1', 'tag2'],
                      priorities: [1, 3],
                    },
                  },
                },
              },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              is_default: false,
            },
          });
        },
      );

      cy.get('#save').click();
      cy.wait('@createCluster');
      cy.url().should('include', '/clusters/102');
    });

    it('should create cluster with both Client and Seed Client blacklists', () => {
      // Add Client blacklist.
      cy.contains('Add blacklist').scrollIntoView().click();

      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Task', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Feature auto-set to download.

      cy.contains('label', 'Applications').parent().find('input').type('app1{enter}');

      // Add Seed Client blacklist.
      // Second entry has Service label at index 1 (after first entry's labels).
      cy.contains('Add blacklist').scrollIntoView().click();

      // Get the second blacklist item and interact with its fields
      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 })
        .eq(1)
        .within(() => {
          cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
        });
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Seed Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 })
        .eq(1)
        .within(() => {
          cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
        });
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('Persistent Cache Task').should('be.visible').click();

      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 })
        .eq(1)
        .within(() => {
          cy.contains('label', 'Feature').closest('.MuiAutocomplete-root').should('exist').click();
        });
      cy.get('.MuiAutocomplete-popper').should('be.visible');
      cy.get('.MuiAutocomplete-popper').contains('upload').should('be.visible').click();

      // Upload does not show Priorities, so: Tags label for second entry.
      // Note: cy.contains() only returns the first matching element, so we use cy.get().filter() to get all matching labels
      cy.get('label').filter(':contains("Tags")').eq(1).parent().find('input').type('tag1{enter}');

      // Create cluster.
      cy.get('#name').type('cluster-both-blacklists');

      cy.intercept(
        {
          method: 'POST',
          url: '/api/v1/clusters',
        },
        (req) => {
          expect(req.body.peer_cluster_config?.block_list).to.exist;
          expect(req.body.seed_peer_cluster_config?.block_list).to.exist;
          expect(req.body.peer_cluster_config?.block_list?.task?.download?.applications).to.deep.equal(['app1']);
          // persistent_cache_task should be converted to persistent_task in API.
          expect(req.body.seed_peer_cluster_config?.block_list?.persistent_task?.upload?.tags).to.deep.equal(['tag1']);

          req.reply({
            statusCode: 200,
            body: {
              id: 103,
              name: 'cluster-both-blacklists',
              bio: '',
              scopes: { idc: '', location: '', cidrs: [], hostnames: [] },
              scheduler_cluster_id: 1,
              seed_peer_cluster_id: 1,
              scheduler_cluster_config: { candidate_parent_limit: 3, filter_parent_limit: 40, job_rate_limit: 10 },
              seed_peer_cluster_config: {
                load_limit: 2000,
                block_list: { persistent_task: { upload: { tags: ['tag1'] } } },
              },
              peer_cluster_config: {
                load_limit: 200,
                block_list: { task: { download: { applications: ['app1'] } } },
              },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              is_default: false,
            },
          });
        },
      ).as('createCluster');

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters/103',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: {
              id: 103,
              name: 'cluster-both-blacklists',
              bio: '',
              scopes: { idc: '', location: '', cidrs: [], hostnames: [] },
              scheduler_cluster_id: 1,
              seed_peer_cluster_id: 1,
              scheduler_cluster_config: { candidate_parent_limit: 3, filter_parent_limit: 40, job_rate_limit: 10 },
              seed_peer_cluster_config: {
                load_limit: 2000,
                block_list: { persistent_task: { upload: { tags: ['tag1'] } } },
              },
              peer_cluster_config: {
                load_limit: 200,
                block_list: { task: { download: { applications: ['app1'] } } },
              },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              is_default: false,
            },
          });
        },
      );

      cy.get('#save').click();
      cy.wait('@createCluster');
      cy.url().should('include', '/clusters/103');
    });

    it('should remove blacklist entry and update count', () => {
      // Add two entries.
      cy.contains('Add blacklist').scrollIntoView().click();
      cy.get('[data-testid="blacklist-item"]').should('have.length', 1);

      cy.contains('Add blacklist').scrollIntoView().click();
      cy.get('[data-testid="blacklist-item"]').should('have.length', 2);

      // Remove first entry.
      cy.contains('Delete').first().click();
      cy.get('[data-testid="blacklist-item"]').should('have.length', 1);

      // Remove remaining entry.
      cy.contains('Delete').first().click();
      cy.get('[data-testid="blacklist-item"]').should('have.length', 0);
    });

    it('should allow creating cluster with blacklist configuration', () => {
      cy.get('#name').type('cluster-with-blacklist');

      cy.contains('Add blacklist').scrollIntoView().click();

      // Select Service.
      cy.contains('label', 'Service').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Client', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Select Task Type.
      cy.contains('label', 'Task Type').closest('.MuiAutocomplete-root').should('exist').click();
      cy.get('.MuiAutocomplete-popper', { timeout: 10000 }).should('be.visible');
      cy.get('.MuiAutocomplete-popper [role="option"]')
        .contains('Task', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get('.MuiAutocomplete-popper').should('not.exist');

      // Feature auto-set to download.

      // Add application.
      cy.contains('label', 'Applications').parent().find('input').type('app1{enter}');

      cy.intercept(
        {
          method: 'POST',
          url: '/api/v1/clusters',
        },
        (req) => {
          // Verify request body has correct structure.
          expect(req.body.peer_cluster_config?.block_list?.task?.download?.applications).to.deep.equal(['app1']);

          req.reply({
            statusCode: 200,
            body: {
              id: 100,
              name: 'cluster-with-blacklist',
              bio: '',
              scopes: { idc: '', location: '', cidrs: [], hostnames: [] },
              scheduler_cluster_id: 1,
              seed_peer_cluster_id: 1,
              scheduler_cluster_config: { candidate_parent_limit: 3, filter_parent_limit: 40, job_rate_limit: 10 },
              seed_peer_cluster_config: { load_limit: 2000 },
              peer_cluster_config: {
                load_limit: 200,
                block_list: { task: { download: { applications: ['app1'] } } },
              },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              is_default: false,
            },
          });
        },
      ).as('createCluster');

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
              scopes: { idc: '', location: '', cidrs: [], hostnames: [] },
              scheduler_cluster_id: 1,
              seed_peer_cluster_id: 1,
              scheduler_cluster_config: { candidate_parent_limit: 3, filter_parent_limit: 40, job_rate_limit: 10 },
              seed_peer_cluster_config: { load_limit: 2000 },
              peer_cluster_config: {
                load_limit: 200,
                block_list: { task: { download: { applications: ['app1'] } } },
              },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              is_default: false,
            },
          });
        },
      );

      cy.get('#save').click();
      cy.wait('@createCluster');
      cy.url().should('include', '/clusters/100');
    });
  });

  describe('when editing cluster with existing blacklist', () => {
    // Use persistent_task (not persistent_cache_task) in API data - this is what the API actually stores.
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
          persistent_task: {
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

      // Wait for the page to load and blacklist data to be populated.
      cy.get('#name').should('be.visible');
    });

    it('should display existing blacklist configuration', () => {
      cy.contains('Blocklist').should('be.visible');
      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 }).should('have.length', 2);
    });

    it('should have blacklist form fields', () => {
      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 }).should('have.length', 2);
      cy.get('.MuiAutocomplete-root').should('have.length.greaterThan', 0);
    });

    it('should allow modifying existing blacklist entry', () => {
      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 }).should('have.length', 2);

      // Add a new application to the first entry's Applications field.
      cy.contains('label', 'Applications').parent().find('input').type('app3{enter}');

      // Verify that the chip was added.
      cy.contains('.MuiChip-root', 'app3').should('be.visible');
    });

    it('should allow removing existing blacklist entry', () => {
      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 }).should('have.length', 2);

      cy.contains('Delete').first().click();
      cy.get('[data-testid="blacklist-item"]').should('have.length', 1);
    });

    it('should update cluster with modified blacklist', () => {
      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 }).should('have.length', 2);

      // Remove first entry.
      cy.contains('Delete').first().click();
      cy.get('[data-testid="blacklist-item"]').should('have.length', 1);

      cy.intercept(
        {
          method: 'PATCH',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          // Verify the request body still has seed_peer_cluster_config block_list.
          expect(req.body.seed_peer_cluster_config?.block_list?.persistent_task).to.exist;

          req.reply({
            statusCode: 200,
            body: clusterWithBlacklist,
          });
        },
      ).as('updateCluster');

      cy.get('#save').click();
      cy.wait('@updateCluster');
      cy.url().should('include', '/clusters/1');
    });

    it('should allow adding new blacklist entry in edit mode', () => {
      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 }).should('have.length', 2);

      cy.contains('Add blacklist').scrollIntoView().click();
      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 }).should('have.length', 3);
    });

    it('should load persistent_task from API and display as Persistent Cache Task', () => {
      // The cluster has persistent_task in seed_peer_cluster_config.
      // The UI should display it as "Persistent Cache Task".
      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 }).should('have.length', 2);

      // Wait for the blacklist forms to be fully loaded and rendered
      cy.get('.MuiAutocomplete-root', { timeout: 10000 }).should('have.length.greaterThan', 0);

      // The second blacklist entry (Seed Client / persistent_cache_task / upload) should be displayed.
      // First entry has download (7 autocompletes: Service, TaskType, Feature, Apps, URLs, Tags, Priorities).
      // Second entry starts with Task Type label at index 1.
      // Need to ensure Service field is properly loaded before accessing Task Type
      // Note: cy.contains() only returns the first matching element, so we use cy.get().filter() to get all matching labels
      cy.get('label')
        .filter(':contains("Service")')
        .eq(1)
        .closest('.MuiAutocomplete-root')
        .within(() => {
          cy.get('input').should('have.value', 'Seed Client');
        });

      cy.get('label')
        .filter(':contains("Task Type")')
        .eq(1)
        .closest('.MuiAutocomplete-root')
        .within(() => {
          cy.get('input').should('have.value', 'Persistent Cache Task');
        });
    });

    it('should convert Persistent Cache Task to persistent_task on update', () => {
      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 }).should('have.length', 2);

      cy.intercept(
        {
          method: 'PATCH',
          url: '/api/v1/clusters/1',
        },
        (req) => {
          // API should receive persistent_task (not persistent_cache_task).
          expect(req.body.seed_peer_cluster_config?.block_list?.persistent_task).to.exist;
          expect(req.body.seed_peer_cluster_config?.block_list?.persistent_cache_task).to.not.exist;

          req.reply({
            statusCode: 200,
            body: clusterWithBlacklist,
          });
        },
      ).as('updateCluster');

      cy.get('#save').click();
      cy.wait('@updateCluster');
      cy.url().should('include', '/clusters/1');
    });

    it('should display priorities from API as integer values converted to string', () => {
      // Create a cluster with priorities in the API response.
      const clusterWithPriorities = {
        ...cluster,
        peer_cluster_config: {
          load_limit: 51,
          block_list: {
            task: {
              download: {
                applications: ['app1'],
                priorities: [1, 3],
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

      cy.visit('/clusters/1/edit');
      cy.get('#name').should('be.visible');
      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 }).should('have.length', 1);

      // Priorities should be displayed as chips (Level 1, Level 3).
      cy.contains('label', 'Priorities').parent().find('.MuiChip-root').should('have.length', 2);
    });

    it('should filter out invalid URLs when editing', () => {
      cy.get('[data-testid="blacklist-item"]', { timeout: 10000 }).should('have.length', 2);

      // Try to add invalid URL to the first entry's URLs field.
      cy.contains('label', 'URLs').parent().find('input').type('invalid-url{enter}');

      // Invalid URL should not be added.
      cy.contains('label', 'URLs').parent().find('.MuiChip-root').contains('invalid-url').should('not.exist');
    });
  });
});
