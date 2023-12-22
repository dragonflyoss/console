import peers from '../../../fixtures/insight/peers/peers.json';

const path = require('path');
declare const expect: Chai.ExpectStatic;

describe('Peers', () => {
  beforeEach(() => {
    cy.signin();
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/peers?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: peers,
        });
      },
    );

    cy.visit('/insight/peers');
    cy.viewport(1440, 1080);
  });

  describe('when data is loaded', () => {
    it('should display the total number of peers', () => {
      cy.get('.css-18k9q32 > :nth-child(1) > .MuiPaper-root').should('exist');
      cy.get(
        ':nth-child(1) > .MuiPaper-root > .inde_navigationContent__tkUaj > div.MuiBox-root > .MuiTypography-h5',
      ).should('have.text', 7);
    });

    it('should display the total number of git version', () => {
      cy.get('.css-18k9q32 > :nth-child(2) > .MuiPaper-root').should('exist');
      cy.get(
        ':nth-child(2) > .MuiPaper-root > .inde_navigationContent__tkUaj > div.MuiBox-root > .MuiTypography-h5',
      ).should('have.text', 4);
    });

    it('should display the total number of git commit', () => {
      cy.get('.css-1l3zj38 > .MuiPaper-root').should('exist');
      cy.get(
        '.css-1l3zj38 > .MuiPaper-root > .inde_navigationContent__tkUaj > div.MuiBox-root > .MuiTypography-h5',
      ).should('have.text', 5);
    });

    it('should display the active ratio', () => {
      // Show active ratio by cluster.
      cy.get('#cluster-active').should('contain', '71.43%');

      // Show active ratio by git version.
      cy.get('#git-version-active').should('contain', '71.43%');

      cy.get('.css-1tg4d9 > .MuiFormControl-root > .MuiInputBase-root > #states-select').click();

      cy.get('[data-value="cluster-1"]').click();

      cy.get('#git-version-active').should('contain', '66.67%');

      // Show active ratio by git commit.
      cy.get('#git-commit-active').should('contain', '71.43%');

      cy.get('.css-1klrv8o-MuiFormControl-root > .MuiInputBase-root > #states-select').click();

      cy.get('[data-value="cluster-1"]').click();

      cy.get('#git-commit-active').should('contain', '66.67%');

      cy.get(
        '.css-1tg4d9 > .MuiBox-root > .css-1461v9t-MuiFormControl-root > .MuiInputBase-root > #states-select',
      ).click();

      cy.get('[data-value="git-version-1"]').click();

      cy.get('#git-commit-active').should('contain', '50%');
    });

    it('can export csv file', () => {
      const downloadsFolder = Cypress.config('downloadsFolder');

      // Click export csv.
      cy.get('.css-1st7tpv > .MuiButtonBase-root').click();

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

        expect(numEntries).to.be.closeTo(7, 0);
      });

      // Click export csv.
      cy.get('.css-1st7tpv > .MuiButtonBase-root').click();

      cy.get('.css-nvaly6-MuiFormControl-root > .MuiInputBase-root > #states-select').click();
      cy.get('[data-value="cluster-1"]').click();

      cy.get('#save').click();

      cy.wait(2000);

      const cluster = path.join(downloadsFolder, 'Peer Data.csv');

      // Check whether the number of data exported based on cluster-1 is correct.
      cy.readFile(cluster)
        .should('exist')
        .then((fileContent) => {
          const numEntries = fileContent.split('\n').length - 2;

          expect(numEntries).to.be.closeTo(3, 0);
        });

      // Click export csv.
      cy.get('.css-1st7tpv > .MuiButtonBase-root').click();

      cy.get('.css-nvaly6-MuiFormControl-root > .MuiInputBase-root > #states-select').click();
      cy.get('[data-value="cluster-1"]').click();

      cy.get('.css-g74ywa-MuiFormControl-root > .MuiInputBase-root > #states-select').click();
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
      cy.get('.css-1st7tpv > .MuiButtonBase-root').click();

      cy.get('.css-nvaly6-MuiFormControl-root > .MuiInputBase-root > #states-select').click();
      cy.get('[data-value="cluster-1"]').click();

      cy.get('.css-g74ywa-MuiFormControl-root > .MuiInputBase-root > #states-select').click();
      cy.get('[data-value="git-version-1"]').click();

      cy.get('.css-70qsx4-MuiFormControl-root > .MuiInputBase-root > #states-select').click();
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
      cy.get('.css-1st7tpv > .MuiButtonBase-root').click();
      cy.get('#alert-dialog-title').should('be.visible').and('have.text', 'Export');

      // Select cluster-1 in the clusters selection box.
      cy.get('.css-nvaly6-MuiFormControl-root > .MuiInputBase-root > #states-select').click();
      cy.get('[data-value="cluster-1"]').click();

      // Select git-version-1 in the git version selection box.
      cy.get('.css-g74ywa-MuiFormControl-root > .MuiInputBase-root > #states-select').click();
      cy.get('[data-value="git-version-1"]').click();

      // Select git-commit-4 in the git commit selection box.
      cy.get('.css-70qsx4-MuiFormControl-root > .MuiInputBase-root > #states-select').click();
      cy.get('[data-value="git-commit-4"]').click();

      // Click cancel button.
      cy.get('#cancel').click();

      cy.get('.css-1st7tpv > .MuiButtonBase-root').click();

      // Check whether the selected one is all.
      cy.get('.css-nvaly6-MuiFormControl-root > .MuiInputBase-root > #states-select').should('have.text', 'All');
      cy.get('.css-g74ywa-MuiFormControl-root > .MuiInputBase-root > #states-select').should('have.text', 'All');
      cy.get('.css-70qsx4-MuiFormControl-root > .MuiInputBase-root > #states-select').should('have.text', 'All');
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/peers?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: [],
          });
        },
      );
    });

    it('should display the total number of peers', () => {
      cy.get('.css-18k9q32 > :nth-child(1) > .MuiPaper-root').should('exist');
      cy.get(
        ':nth-child(1) > .MuiPaper-root > .inde_navigationContent__tkUaj > div.MuiBox-root > .MuiTypography-h5',
      ).should('have.text', 0);
    });

    it('should display the total number of git version', () => {
      cy.get('.css-18k9q32 > :nth-child(2) > .MuiPaper-root').should('exist');
      cy.get(
        ':nth-child(2) > .MuiPaper-root > .inde_navigationContent__tkUaj > div.MuiBox-root > .MuiTypography-h5',
      ).should('have.text', 0);
    });

    it('should display the total number of git commit', () => {
      cy.get('.css-1l3zj38 > .MuiPaper-root').should('exist');
      cy.get(
        '.css-1l3zj38 > .MuiPaper-root > .inde_navigationContent__tkUaj > div.MuiBox-root > .MuiTypography-h5',
      ).should('have.text', 0);
    });

    it('cannot display the active ratio', () => {
      cy.get('#git-version-active').should('contain', '0');
      cy.get('#git-version-active').should('contain', '0');
      cy.get('#git-commit-active').should('contain', '0');
    });

    it('cannot export csv file', () => {
      cy.get('.css-1st7tpv > .MuiButtonBase-root').click();
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
          url: '/api/v1/peers?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );
      cy.visit('/insight/peers');
    });

    it('should display the total number of peers', () => {
      cy.get('.css-18k9q32 > :nth-child(1) > .MuiPaper-root').should('exist');
      cy.get(
        ':nth-child(1) > .MuiPaper-root > .inde_navigationContent__tkUaj > div.MuiBox-root > .MuiTypography-h5',
      ).should('have.text', 0);
    });

    it('should display the total number of git version', () => {
      cy.get('.css-18k9q32 > :nth-child(2) > .MuiPaper-root').should('exist');
      cy.get(
        ':nth-child(2) > .MuiPaper-root > .inde_navigationContent__tkUaj > div.MuiBox-root > .MuiTypography-h5',
      ).should('have.text', 0);
    });

    it('should display the total number of git commit', () => {
      cy.get('.css-1l3zj38 > .MuiPaper-root').should('exist');
      cy.get(
        '.css-1l3zj38 > .MuiPaper-root > .inde_navigationContent__tkUaj > div.MuiBox-root > .MuiTypography-h5',
      ).should('have.text', 0);
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
      cy.get('.css-1st7tpv > .MuiButtonBase-root').click();
      cy.get('#save').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Export failed');
    });
  });
});
