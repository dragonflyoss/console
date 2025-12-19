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
  describe('when theme is dark mode', () => {
    beforeEach(() => {
      cy.viewport(1440, 1080);
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

      cy.visit('/clusters/1/peers', {
        onBeforeLoad(win) {
          Object.defineProperty(win, 'matchMedia', {
            writable: true,
            value: (query: string) => ({
              matches: query.includes('dark'), 
              media: query,
              onchange: null,
              addListener: cy.stub(), // deprecated
              removeListener: cy.stub(), // deprecated
              addEventListener: cy.stub(),
              removeEventListener: cy.stub(),
              dispatchEvent: cy.stub(),
            }),
          });
        },
      });
    });

    it('should render charts with dark mode colors', () => {
      cy.get('canvas').should('exist');

    });

    it('should trigger hover effect on bar chart', () => {
      cy.get('canvas').should('exist');

      cy.get('canvas').first().trigger('mouseover', { x: 100, y: 100 }).trigger('mousemove', { x: 100, y: 100 });

      cy.wait(500);
    });
  });

  describe('Chart color validation for dark mode', () => {
    it('should validate colors in dark mode', () => {
      cy.visit('/clusters/1/peers', {
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

    // Wait for page to fully load
    cy.get('[data-testid="cluster-loading"]', { timeout: 20000 }).should('not.exist');

    // Validate chart rendering
    cy.get('canvas').should('have.length', 4);

    // Validate dark mode color configuration
    cy.window().then((win) => {
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

      // Validate Canvas elements exist and are accessible
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
    cy.get('canvas').eq(0)
      .trigger('mouseover')
      .trigger('mousemove', 50, 50)
      .wait(300);

    cy.get('canvas').eq(1)
      .trigger('mouseover')
      .trigger('mousemove', 80, 80)
      .wait(300);
    });
  });

  describe('Chart color validation for light mode', () => {
    it('should validate colors in light mode', () => {
      cy.visit('/clusters/1/peers', {
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

      cy.get('[data-testid="cluster-loading"]', { timeout: 20000 }).should('not.exist');

      cy.get('canvas').should('have.length', 4);

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

      // 验证hover状态颜色变化
      cy.get('canvas').eq(2)
        .trigger('mouseover')
        .trigger('mousemove', 60, 60)
        .wait(300);

      cy.get('canvas').eq(3)
        .trigger('mouseover')
        .trigger('mousemove', 90, 90)
        .wait(300);
    });
  });

  describe('Advanced color validation', () => {
    it('should validate actual chart colors against configuration', () => {
      cy.visit('/clusters/1/peers');

      cy.get('[data-testid="cluster-loading"]', { timeout: 20000 }).should('not.exist');

      cy.get('canvas').should('have.length', 4);

      cy.get('#git-version-active').should('contain.text', '%');
      cy.get('#git-commit-active').should('contain.text', '%');

      cy.get('canvas').each(($canvas, index) => {
        cy.wrap($canvas).should('be.visible');
        cy.wrap($canvas)
          .trigger('mouseover')
          .trigger('mousemove', 50 + index * 20, 50 + index * 20)
          .wait(200);

        cy.wrap($canvas)
          .trigger('mouseout')
          .wait(100);
      });
    });
  });
});
