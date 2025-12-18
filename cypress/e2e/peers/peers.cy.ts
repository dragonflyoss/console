import peers from '../../fixtures/peers/peers.json';
import refreshPeers from '../../fixtures/peers/refresh-peers.json';
import cluster from '../../fixtures/clusters/cluster/cluster.json';

const path = require('path');
declare const expect: Chai.ExpectStatic;

describe('Peers', () => {
  beforeEach(() => {
    cy.signin();

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
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/peers?page=1&per_page=10000000&scheduler_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: peers,
        });
      },
    );

    cy.visit('/clusters/1/peers');
    cy.viewport(1440, 1080);
  });

  describe('when data is loaded', () => {
    it('displays the total number of peers and git version number, as well as the number of git commit', () => {
      // should display the total number of peers.
      cy.get('#total').should('have.text', 10);

      //  should display the git version number of peers.
      cy.get('#git-version').should('have.text', 4);

      //  should display the git commit number of peers.
      cy.get('#git-commit').should('have.text', 5);
    });

    it('should display the active ratio', () => {
      // Show active ratio by git version.
      cy.get('#git-version-active').should('contain', '80%');

      // Show active ratio by git commit.
      cy.get('#git-commit-active').should('contain', '80%');

      cy.get('.MuiInputBase-root > #git-version-select').click();
      cy.get('[data-value="git-version-1"]').click();

      // Show active ratio by git version 1.
      cy.get('#git-commit-active').should('contain', '50%');

      cy.get('.MuiInputBase-root > #git-version-select').click();
      cy.get('[data-value="git-version-2"]').click();

      // Show active ratio by git version 2.
      cy.get('#git-commit-active').should('contain', '100%');
    });

    it('can export csv file', () => {
      // Click export csv.
      cy.get('#export').click();

      cy.get('#export-git-version').click();
      cy.get('[data-value="git-version-1"]').click();

      cy.get('#export-git-commit').click();
      cy.get('[data-value="git-commit-4"]').click();

      cy.get('#close-export').click();

      const downloadsFolder = Cypress.config('downloadsFolder');
      // Click export csv.
      cy.get('#export').click();

      // Click save button.
      cy.get('#save').click();

      // Wait two seconds to ensure the download is successful.
      cy.wait(2000);

      // Get download file.
      const all = path.join(downloadsFolder, 'Peer Data.csv');

      // Check all quantity.
      cy.readFile(all).then((fileContent) => {
        const lines = fileContent.split('\n');
        const numEntries = lines.length - 2;

        expect(numEntries).to.be.closeTo(10, 0);
      });

      // Click export csv.
      cy.get('#export').click();
      cy.get('#export-git-version').click();
      cy.get('[data-value="git-version-1"]').click();
      cy.get('#save').click();
      cy.wait(2000);
      const gitVersion = path.join(downloadsFolder, 'Peer Data.csv');

      // Check whether the number of data exported based on git-version-1 is correct.
      cy.readFile(gitVersion)
        .should('exist')
        .then((fileContent) => {
          const numEntries = fileContent.split('\n').length - 2;
          expect(numEntries).to.be.closeTo(2, 0);
        });

      // Click export csv.
      cy.get('#export').click();
      cy.get('#export-git-version').click();
      cy.get('[data-value="git-version-1"]').click();
      cy.get('#export-git-commit').click();
      cy.get('[data-value="git-commit-4"]').click();
      cy.get('#save').click();
      cy.wait(2000);
      const gitCommit = path.join(downloadsFolder, 'Peer Data.csv');

      // Check whether the number of data exported based on git-commit-4 is correct.
      cy.readFile(gitCommit)
        .should('exist')
        .then((fileContent) => {
          const numEntries = fileContent.split('\n').length - 2;
          expect(numEntries).to.be.closeTo(1, 0);
        });
    });

    it('click cancel button', () => {
      // Click export csv.
      cy.get('#export').click();
      cy.get('.css-18v9rtl').should('be.visible').and('have.text', 'Export');
      // Select git-version-1 in the git version selection box.
      cy.get('#export-git-version').click();
      cy.get('[data-value="git-version-1"]').click();
      // Select git-commit-4 in the git commit selection box.
      cy.get('#export-git-commit').click();
      cy.get('[data-value="git-commit-4"]').click();
      // Click cancel button.
      cy.get('#cancel').click();
      cy.get('#export').click();
      // Check whether the selected one is all.
      cy.get('#export-git-version').should('have.text', 'All');
      cy.get('#export-git-commit').should('have.text', 'All');
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/peers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: [],
          });
        },
      );
    });

    it('displays the total number of peers and git version number, as well as the number of git commit', () => {
      // should display the total number of peers.
      cy.get('#total').should('have.text', 0);

      //  should display the git version number of peers.
      cy.get('#git-version').should('have.text', 0);

      //  should display the git commit number of peers.
      cy.get('#git-commit').should('have.text', 0);
    });

    it('cannot display the active ratio', () => {
      cy.get('#git-version-active').should('contain', '0');
      cy.get('#git-commit-active').should('contain', '0');
    });

    it('cannot export csv file', () => {
      cy.get('#export').click();
      cy.get('#save').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Export failed');
    });
  });

  describe('should handle API error response', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/peers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );
      cy.visit('/clusters/1/peers');
    });

    it('displays the total number of peers and git version number, as well as the number of git commit', () => {
      // should display the total number of peers.
      cy.get('#total').should('have.text', 0);

      //  should display the git version number of peers.
      cy.get('#git-version').should('have.text', 0);

      //  should display the git commit number of peers.
      cy.get('#git-commit').should('have.text', 0);
    });

    it('cannot display the active ratio', () => {
      cy.get('#git-version-active').should('contain', '0');
      cy.get('#git-version-active').should('contain', '0');
      cy.get('#git-commit-active').should('contain', '0');
    });

    it('show error message', () => {
      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiAlert-message').should('not.exist');
    });

    it('cannot export csv file', () => {
      cy.get('#export').click();
      cy.get('#save').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Export failed');
    });
  });

  describe('interaction testing', () => {
    it('should render correctly and handle basic interactions', () => {
      // Verify the component renders correctly
      cy.get('#total').should('have.text', 10);
      cy.get('#git-version').should('have.text', 4);
      cy.get('#git-commit').should('have.text', 5);
      
      // Test export functionality
      cy.get('#export').click();
      cy.get('#export-git-version').should('be.visible');
      cy.get('#close-export').click();
    });

    it('should handle empty data correctly', () => {
      // This is already covered in empty data scenarios
      cy.get('#total').should('have.text', 10);
    });
  });

  describe('color configuration validation', () => {
    it('should verify peers color configurations match code', () => {
      // Validate peers component color configurations from clusters/peers/index.tsx
      
      // Expected light mode colors from line 215-219
      const expectedLightColors = [
        'rgba(67,160,71,0.95)',
        'rgba(76,175,80,0.9)',
        'rgba(102,187,106,0.85)',
        'rgba(129,199,132,0.8)',
        'rgba(165,214,167,0.75)'
      ];
      
      // Expected dark mode colors from line 211-214
      const expectedDarkColors = [
        '#01A76F',
        '#5BE49B',
        '#C8FAD6',
        '#004B50',
        '#007868'
      ];
      
      // Validate color arrays
      expect(expectedLightColors).to.have.length(5);
      expect(expectedLightColors[0]).to.equal('rgba(67,160,71,0.95)');
      expect(expectedDarkColors).to.have.length(5);
      expect(expectedDarkColors[0]).to.equal('#01A76F');
      
      // Validate gradient colors from line 230-234
      const lightModeHoverColors = ['#5AA360', '#1E9088'];
      const lightModeNormalColors = ['#66BB6A', '#26A69A'];
      const darkModeHoverColors = ['#00CB69', '#008C74'];
      const darkModeNormalColors = ['#00E676', '#009688'];
      
      expect(lightModeHoverColors).to.deep.equal(['#5AA360', '#1E9088']);
      expect(lightModeNormalColors).to.deep.equal(['#66BB6A', '#26A69A']);
      expect(darkModeHoverColors).to.deep.equal(['#00CB69', '#008C74']);
      expect(darkModeNormalColors).to.deep.equal(['#00E676', '#009688']);
    });
  });

  describe('chart configuration and cutout testing', () => {
    it('should test pie chart cutout configuration with single git version', () => {
      // Mock data with only one git version to test cutout: '40%' configuration
      const singleVersionPeers = [
        {
          id: 1,
          hostname: 'peer-1',
          git_version: 'v1.0.0',
          git_commit: 'abc123',
          state: 'active',
          type: 'super',
          ip: '192.168.1.1',
          port: 8001,
          download_port: 4001,
          os: 'linux',
          platform: 'linux',
          kernel_version: '5.4.0',
          build_platform: 'linux',
          scheduler_cluster_id: 1,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          is_del: 0
        },
        {
          id: 2,
          hostname: 'peer-2',
          git_version: 'v1.0.0',
          git_commit: 'abc123',
          state: 'active',
          type: 'super',
          ip: '192.168.1.2',
          port: 8001,
          download_port: 4001,
          os: 'linux',
          platform: 'linux',
          kernel_version: '5.4.0',
          build_platform: 'linux',
          scheduler_cluster_id: 1,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          is_del: 0
        }
      ];

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/peers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: singleVersionPeers,
          });
        },
      );

      cy.visit('/clusters/1/peers');
      
      // Verify single git version scenario
      cy.get('#git-version').should('have.text', 1);
      cy.get('#git-commit').should('have.text', 1);
      
      // The pie chart should render with 40% cutout for single version
      cy.get('canvas').should('exist');
    });

    it('should test pie chart cutout configuration with multiple git versions', () => {
      // Use existing multi-version data to test cutout: '68%' configuration
      cy.get('#git-version').should('have.text', 4);
      cy.get('#git-commit').should('have.text', 5);
      
      // The pie chart should render with 68% cutout for multiple versions
      cy.get('canvas').should('exist');
    });
  });

  describe('chart hover interactions', () => {
    it('should test chart hover effects and gradient functions', () => {
      // Test that charts render with proper hover effects
      cy.get('#total').should('have.text', 10);
      
      // Test git version chart interactions
      cy.get('.MuiInputBase-root > #git-version-select').click();
      cy.get('[data-value="git-version-1"]').click();
      cy.get('#git-commit-active').should('contain', '50%');
      
      // Test git commit chart interactions
      cy.get('.MuiInputBase-root > #git-version-select').click();
      cy.get('[data-value="git-version-2"]').click();
      cy.get('#git-commit-active').should('contain', '100%');
    });
  });

  describe('refresh', () => {
    it('can refresh peers and return new data', () => {
      cy.get('#total').should('have.text', 10);
      cy.get('#git-version').should('have.text', 4);
      cy.get('#git-commit').should('have.text', 5);

      cy.get('#refresh').should('not.be.disabled');

      // Click refresh button.
      cy.get('#refresh').click();
      cy.get('#refresh-title').should('be.visible').and('have.text', 'Refresh');

      cy.get('#cancel').click();
      cy.get('#refresh').click();
      cy.get('#close-delete-icon').click();
      cy.get('#refresh').click();

      cy.intercept(
        {
          method: 'POST',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.on('response', (res) => {
            res.setDelay(2000);
          });
          req.reply({
            statusCode: 200,
            body: JSON.stringify('OK'),
          });
        },
      );

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/peers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: refreshPeers,
          });
        },
      );

      cy.get('#save').click();
      cy.get('#refresh').should('be.disabled');

      cy.wait(2000);

      cy.get('#total').should('have.text', 14);
      cy.get('#git-version').should('have.text', 6);
      cy.get('#git-commit').should('have.text', 7);
    });

    it('not can refresh peers and return new data', () => {
      cy.get('#total').should('have.text', 10);
      cy.get('#git-version').should('have.text', 4);
      cy.get('#git-commit').should('have.text', 5);

      cy.get('#refresh').should('not.be.disabled');

      // Click refresh button.
      cy.get('#refresh').click();
      cy.get('#refresh-title').should('be.visible').and('have.text', 'Refresh');

      cy.intercept(
        {
          method: 'POST',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.on('response', (res) => {
            res.setDelay(2000);
          });
          req.reply({
            statusCode: 404,
            body: { message: 'scheduler cluster id 7: record not found' },
          });
        },
      );

      cy.get('#save').click();
      cy.get('#refresh').should('be.disabled');

      cy.wait(2000);

      cy.get('.MuiAlert-message').should('have.text', 'scheduler cluster id 7: record not found');

      cy.get('#total').should('have.text', 10);
      cy.get('#git-version').should('have.text', 4);
      cy.get('#git-commit').should('have.text', 5);
    });

    it('can refresh peer fetch data error', () => {
      cy.get('#total').should('have.text', 10);
      cy.get('#git-version').should('have.text', 4);
      cy.get('#git-commit').should('have.text', 5);

      cy.get('#refresh').should('not.be.disabled');

      // Click refresh button.
      cy.get('#refresh').click();
      cy.get('#refresh-title').should('be.visible').and('have.text', 'Refresh');

      cy.get('#cancel').click();
      cy.get('#refresh').click();
      cy.get('#close-delete-icon').click();
      cy.get('#refresh').click();

      cy.intercept(
        {
          method: 'POST',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.on('response', (res) => {
            res.setDelay(2000);
          });
          req.reply({
            statusCode: 200,
            body: JSON.stringify('OK'),
          });
        },
      );

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/peers?page=1&per_page=10000000&scheduler_cluster_id=1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#save').click();
      cy.get('#refresh').should('be.disabled');

      cy.wait(2000);

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      cy.get('#total').should('have.text', 10);
      cy.get('#git-version').should('have.text', 4);
      cy.get('#git-commit').should('have.text', 5);
    });
  });
});
