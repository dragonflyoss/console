import cluster from '../../fixtures/clusters/cluster/cluster.json';
import seedPeer from '../../fixtures/clusters/cluster/seed-peer.json';
import deleteSeedPeer from '../../fixtures/seed-peers/delete-seed-peer.json';
import seedPeerDeleteAfter from '../../fixtures/seed-peers/seed-peer-delete-after.json';
import seedPeerActive from '../../fixtures/seed-peers/seed-peer-active.json';
import deletedInactiveseedPeerError from '../../fixtures/seed-peers/deleted-inactive-seed-peer-error.json';
import deletedInactiveseedPeer from '../../fixtures/seed-peers/deleted-inactive-seed-peer.json';

describe('Seed peers', () => {
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
        url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: seedPeer,
        });
      },
    );

    cy.visit('clusters/1/seed-peers');
    cy.viewport(1440, 1480);
  });

  describe('when data is loaded', () => {
    it('display the total number of seed peer and the active number', () => {
      cy.get('#total').should('be.visible').and('contain', '51');
      cy.get('#active').should('be.visible').and('contain', '31');
      cy.get('#inactive').should('be.visible').and('contain', '20');
    });

    it('can display seed peers table', () => {
      // Show idloading.
      cy.get('[data-testid="isloading"]').should('be.exist');

      cy.get('#table').click();

      // Show hostname.
      cy.get('#hostname-seed-peer-51').should('be.visible').and('contain', 'seed-peer-51');

      // Show ip.
      cy.get('#ip-51').should('be.visible').and('contain', '172.31.255.255');

      // Show port.
      cy.get('#port-51').should('be.visible').and('contain', '65006');

      // Show download port.
      cy.get('#download-port-51').should('be.visible').and('contain', '65008');

      // Show object storage port.
      cy.get('#object-storage-port-51').should('be.visible').and('contain', '443');

      // Show type.
      cy.get('#type-51').should('be.visible').and('contain', 'Super');

      // Show state.
      cy.get(':nth-child(1) > :nth-child(8) > .MuiChip-root')
        .should('be.visible')
        .and('contain', 'Active')
        .and('have.css', 'background-color', 'rgb(0, 129, 112)');
    });

    it('can display seed peers card', () => {
      cy.get('.MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();
      cy.get('#card-id-7').should('be.visible').and('have.text', '7');

      // Show hostname.
      cy.get('#card-hostname-seed-peer-7').should('be.visible').and('contain', 'seed-peer-7');

      // Show ip.
      cy.get('#card-ip-7').should('be.visible').and('contain', '30.44.98.202');

      // Show status.
      cy.get('#card-state-7')
        .should('be.visible')
        .and('have.text', 'Active')
        .and('have.css', 'background-color', 'rgba(0, 129, 112, 0.2)');

      // Show type
      cy.get('#card-type-7').should('have.text', 'Super');

      // Show port.
      cy.get('#card-port-7').should('have.text', '65006');

      // Show download port.
      cy.get('#card-download-port-7').should('have.text', '65008');

      // Go to next page.
      cy.get(':nth-child(5) > .MuiButtonBase-root').click();

      cy.get('#card-hostname-seed-peer-39').should('be.visible').and('have.text', 'seed-peer-39');

      // Show status.
      cy.get('#card-state-39')
        .should('be.visible')
        .and('have.text', 'Inactive')
        .and('have.css', 'background-color', 'rgba(145, 158, 171, 0.16)');
    });

    it('can display seed peers table and seed peers card', () => {
      cy.get('#table').click();

      // It can show that the seed peers table is 10.
      cy.get('#seed-peer-table-body').children().should('have.length', 10);
      cy.get('#card').click();
      cy.get('#seed-peer-card').should('exist');

      // It can show that the seed-peer card is 10.
      cy.get('#seed-peer-card').children().should('have.length', 9);
      cy.get('#operation-51').click();
      cy.get(':nth-child(11) > .MuiPaper-root > .MuiList-root > .seed-peers_menu__BE2ff > #view-seed-peer-51').click();

      // Then I see that the current page is the seed-peer 7.
      cy.url().should('include', 'clusters/1/seed-peers/51');
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiBreadcrumbs-ol > :nth-child(5)').click();

      // It can show that the seed-peer card is 10.
      cy.get('#seed-peer-card').children().should('have.length', 9);
    });

    it('display the number of seed peers according to the status', () => {
      cy.get('#table').click();
      cy.get('#lock-button').click();

      // Display active seed peer.
      cy.get('[value="active"]').click();
      cy.get('#seed-peer-table-body').children().should('have.length', 10);

      cy.get('#seed-peer-table-body').should('not.contain', 'Inactive');

      cy.get(':nth-child(5) > .MuiButtonBase-root').click();

      cy.get('#seed-peer-table-body').children().should('have.length', 1);

      cy.get('#seed-peer-table-body').should('not.contain', 'Inactive');

      // Display inactive seed-peer.
      cy.get('#lock-button').click();
      cy.get('[value="inactive"]').click();
      cy.get('#seed-peer-table-body').should('not.contain', 'Active');
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('#seed-peer-table-body').children().should('have.length', 10);

      // No active.
      cy.get('#seed-peer-table-body').should('not.contain', 'Active');

      cy.get('#card').click();
      cy.get('#lock-button').click();

      // Display active seed-peer.
      cy.get('[value="active"]').click();
      cy.get('#seed-peer-card').children().should('have.length', 9);
      cy.get('#seed-peer-card').should('not.contain', 'Inactive');

      // Display inactive seed-peer.
      cy.get('[value="inactive"]').click();
      cy.get('#seed-peer-card').children().should('have.length', 9);

      // Go to last page.
      cy.get('.MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      cy.get('#seed-peer-card').children().should('have.length', 2);
      cy.get('#seed-peer-card').should('not.contain', 'Active');

      // Display all seed-peer.
      cy.get('#lock-button').click();
      cy.get('[value="all"]').click();
      cy.viewport(2440, 1580);
      cy.get('#seed-peer-card').children().should('have.length', 15);
    });

    it('view the number of seed peer cards when changing the page size', () => {
      // The viewport will now be changed to 1440px x 1080px
      cy.viewport(1440, 1480);

      // Check if the number of page size is 9.
      cy.get('#seed-peer-card').children().should('have.length', 9);

      // The viewport will now be changed to 1600px x 1480px
      cy.viewport(1600, 1480);
      cy.wait(1000);

      // Check if the number of page size is 9.
      cy.get('#seed-peer-card').children().should('have.length', 9);

      // The viewport will now be changed to 1920px x 1480px
      cy.viewport(1920, 1480);
      cy.wait(1000);

      // Check if the number of page size is 12.
      cy.get('#seed-peer-card').children().should('have.length', 12);

      // The viewport will now be changed to 2048px x 1480px
      cy.viewport(2048, 1480);
      cy.wait(1000);

      // Check if the number of page size is 12.
      cy.get('#seed-peer-card').children().should('have.length', 12);

      // The viewport will now be changed to 2560px x 1480px
      cy.viewport(2560, 1480);
      cy.wait(1000);

      // Check if the number of page size is 15.
      cy.get('#seed-peer-card').children().should('have.length', 15);
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: [],
          });
        },
      );
    });

    it('display the total number of seed peer and the active number', () => {
      cy.get('#active').should('be.visible').and('contain', '0');
      cy.get('#inactive').should('be.visible').and('contain', '0');
      cy.get('#total').should('be.visible').and('contain', '0');
    });

    it('there should be a message indicating that there is no seed peer', () => {
      // Show seed peer table.
      cy.get('#table').click();
      cy.get('#no-seed-peer-table').should('be.visible').and('contain', `You don't have seed peer cluster.`);

      // Show seed peer card.
      cy.get('#card').click();

      cy.get('#no-seed-peer').should('be.visible').and('contain', `You don't have seed peer cluster.`);
    });
  });

  describe('should handle API error response', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );
    });

    it('show error message', () => {
      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });

    it('display the total number of seed peer and the active number', () => {
      cy.get('#active').should('be.visible').and('contain', '0');
      cy.get('#inactive').should('be.visible').and('contain', '0');
      cy.get('#total').should('be.visible').and('contain', '0');
    });

    it('there should be a message indicating that there is no seed peer', () => {
      // Show seed peer table.
      cy.get('#table').click();

      cy.get('#no-seed-peer-table').should('be.visible').and('contain', `You don't have seed peer cluster.`);

      // Show seed peer card.
      cy.get('#card').click();

      cy.get('#no-seed-peer').should('be.visible').and('contain', `You don't have seed peer cluster.`);
    });
  });

  describe('pagination', () => {
    it('pagination updates results and page number', () => {
      // Check number of pagination.
      cy.get('#seed-peer-pagination > .MuiPagination-ul').children().should('have.length', 8);

      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');
    });

    it('when pagination changes, different page results are rendered', () => {
      // Show seed peer table.
      cy.get('#table').click();

      cy.get('#hostname-seed-peer-51').should('be.visible').and('contain', 'seed-peer-51');

      // Go to next page.
      cy.get(':nth-child(5) > .MuiButtonBase-root').click();

      // Then I see that the current page is the seed-peers?page=2.
      cy.url().should('include', '/clusters/1/seed-peers?page=4');

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '4');

      // Show seed peer information.
      cy.get('#hostname-seed-peer-39').should('be.visible').and('contain', 'seed-peer-39');

      cy.get('#hostname-seed-peer-51').should('not.exist');

      cy.get(':nth-child(5) > :nth-child(8) > .MuiChip-root')
        .should('be.visible')
        .and('contain', 'Inactive')
        .and('have.css', 'background-color', 'rgb(93, 95, 97)');

      // Go to last page.
      cy.get(':nth-child(7) > .MuiButtonBase-root').click();

      // Then I see that the current page is the seed-peers?page=6.
      cy.url().should('include', '/clusters/1/seed-peers?page=6');

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '6');

      cy.get('#seed-peer-table-body > .MuiTableRow-root > :nth-child(2)')
        .should('be.visible')
        .and('contain', 'seed-peer-3');

      cy.get('#seed-peer-pagination > .MuiPagination-ul > :nth-child(1) > .MuiButtonBase-root').click();
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '5');

      cy.get('#seed-peer-pagination > .MuiPagination-ul > :nth-child(5) > .MuiButtonBase-root').click();
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '4');
    });

    it('when you click refresh, the paginated results and page numbers remain unchanged.', () => {
      // Go to last page.
      cy.get(':nth-child(7) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '6');

      // show hostname.
      cy.get('#card-hostname-seed-peer-19').should('be.visible').and('contain', 'seed-peer-19');

      // Then I see that the current page is the seed-peers?page=6.
      cy.url().should('include', '/clusters/1/seed-peers?page=6');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(1000);
      });

      // Then I see that the current page is the seed-peers?page=6.
      cy.url().should('include', '/clusters/1/seed-peers?page=6');

      // Check if the page number has been reset.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '6');

      cy.get('#card-hostname-seed-peer-19').should('be.visible').and('contain', 'seed-peer-19');
    });

    it('when returning to the previous page, pagination and results remain unchanged', () => {
      // Go to last page.
      cy.get(':nth-child(7) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '6');

      // show hostname.
      cy.get('#card-hostname-seed-peer-19').should('be.visible').and('contain', 'seed-peer-19');

      // Go to show seed-peer page.
      cy.get('#card-hostname-seed-peer-19').click();

      // Then I see that the current page is the show seed-peers 19.
      cy.url().should('include', '/clusters/1/seed-peers/19');

      // Go back to the last page。
      cy.go('back');

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '6');

      cy.get('#card-id-19').should('have.text', 19);

      cy.get('#operation-19').click();

      cy.get(':nth-child(8) > .MuiPaper-root > .MuiList-root > .seed-peers_menu__BE2ff > #view-seed-peer-19').click();

      // Then I see that the current page is the show seed-peers 19.
      cy.url().should('include', '/clusters/1/seed-peers/19');

      // Go back to the last page。
      cy.go('back');

      // Then I see that the current page is the show seed-peers 19.
      cy.url().should('include', '/clusters/1/seed-peers?page=6');

      cy.get('#table').click();

      cy.get('#hostname-seed-peer-3 > .MuiTypography-root').click();

      // Then I see that the current page is the show seed-peers 3.
      cy.url().should('include', '/clusters/1/seed-peers/3');

      // Go back to the last page。
      cy.go('back');

      cy.get('#table').click();

      cy.get('#operation-3').click();

      cy.get('#view-seed-peer-3').click();

      // Then I see that the current page is the show seed-peers 3.
      cy.url().should('include', '/clusters/1/seed-peers/3');
    });
  });

  describe('search', () => {
    it('should search seed peer hostname', () => {
      cy.get('#seed-peer-card').children().should('have.length', 9);
      cy.get('#seed-peer-search').type('seed-peer-41');

      // Then I see that the current page is the clusters/1/seed-peers?search=seed-peer-4!
      cy.url().should('include', '/clusters/1/seed-peers?search=seed-peer-41');

      cy.get('#seed-peer-card').children().should('have.length', 1);

      // Pagination has been hidden.
      cy.get('#seed-peer-pagination > .MuiPagination-ul').should('not.exist');

      // Clear search box.
      cy.get('.MuiAutocomplete-endAdornment').click();

      // Check number of pagination.
      cy.get('#seed-peer-card').children().should('have.length', 9);

      cy.get('#seed-peer-search').type('seed-peer');

      cy.get('#seed-peer-card').children().should('have.length', 9);

      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // Then I see that the current page is the clusters/1/seed-peers?search=seed-peer&page=2!
      cy.url().should('include', '/clusters/1/seed-peers?search=seed-peer&page=2');

      cy.get('.MuiPagination-ul > :nth-child(2) > .MuiButtonBase-root').click();

      // Then I see that the current page is the clusters/1/seed-peers?search=seed-peer!
      cy.url().should('include', '/clusters/1/seed-peers?search=seed-peer');
    });

    it('should search seed peer hostname and show no results', () => {
      cy.get('#seed-peer-search').type('seed-peer-52');

      // Then I see that the current page is the /clusters/1/seed-peers?search=seed-peer-12!
      cy.url().should('include', '/clusters/1/seed-peers?search=seed-peer-52');

      // No data.
      cy.get('#no-seed-peer').should('be.visible').and('contain', `You don't have seed peer cluster.`);

      // Show scheduler card.
      cy.get('#table').click();

      cy.get('#no-seed-peer-table').should('be.visible').and('contain', `You don't have seed peer cluster.`);

      // Pagination has been hidden.
      cy.get('#seed-peer-pagination > .MuiPagination-ul').should('not.exist');
    });

    it('should be queried based on the query string', () => {
      cy.visit('/clusters/1/seed-peers?search=seed-peer');

      // The content of the input box is displayed as seed-peer.
      cy.get('#seed-peer-search').should('have.value', 'seed-peer');

      cy.get(':nth-child(5) > .MuiButtonBase-root').click();

      cy.get('#seed-peer-card').children().should('have.length', 9);

      cy.url().should('include', '/clusters/1/seed-peers?search=seed-peer&page=4');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(1000);
      });

      // Clear search box.
      cy.get('#seed-peer-search').clear();

      // Then I see that the current page is the clusters/1/seed-peers!
      cy.url().should('include', '/clusters/1/seed-peers');
    });

    it('query and then switch state', () => {
      cy.get('#seed-peer-search').type('seed-peer');

      cy.get('#lock-button').click();

      // Switch the state to active.
      cy.get('[value="active"]').click();

      cy.get('#seed-peer-pagination > .MuiPagination-ul').children().should('have.length', 6);

      // Check the current URL.
      cy.url().should('include', '/clusters/1/seed-peers?search=seed-peer&status=active');

      cy.get(':nth-child(5) > .MuiButtonBase-root').click();

      // Check the current URL.
      cy.url().should('include', '/clusters/1/seed-peers?search=seed-peer&page=4&status=active');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(1000);
      });

      // Check the current URL.
      cy.url().should('include', '/clusters/1/seed-peers?search=seed-peer&page=4&status=active');

      cy.get('#table').click();

      cy.get('#lock-button').click();

      // Switch the state to inactive.
      cy.get('[value="inactive"]').click();

      // Check the current URL.
      cy.url().should('include', '/clusters/1/seed-peers?search=seed-peer&status=inactive');

      cy.get('#seed-peer-pagination > .MuiPagination-ul').children().should('have.length', 4);

      // Show seed peer card.
      cy.get('#card').click();

      // Go to last page.
      cy.get('.MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '3');

      cy.get('#table').click();

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
    });
  });

  describe('delete', () => {
    it('when a seed peer is deleted, the seed peer is the only seed peer on the last page', () => {
      cy.get('#table').click();

      // Check the total number of seed peers.
      cy.get('#total').should('be.visible').and('contain', '51');

      // Go to last page.
      cy.get('#seed-peer-pagination > .MuiPagination-ul > :nth-child(7) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#id-3').should('have.text', '3');
      cy.get('#hostname-seed-peer-3').should('be.visible').and('contain', 'seed-peer-3');

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '6');
      cy.get('#operation-3').click();
      cy.get('#delete-seed-peer-3').click();
      cy.get('#cancelDeleteSeedPeer').click();
      cy.get('.MuiDialogContent-root').should('not.exist');

      // Confirm delete.
      cy.get('#operation-3').click();
      cy.get('#delete-seed-peer-3').click();
      cy.intercept({ method: 'DELETE', url: '/api/v1/seed-peers/3' }, (req) => {
        req.reply({
          statusCode: 200,
        });
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply((res) => {
            res.setDelay(1000);
            res.send({
              statusCode: 200,
              body: deleteSeedPeer,
            });
          });
        },
      );

      // Confirm delete.
      cy.get('#deleteSeedPeer').click();

      // Show idloading.
      cy.get('[data-testid="isloading"]').should('be.exist');

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '5');

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');
      cy.get('[data-testid="isloading"]').should('not.exist');

      // The total number of seed peers will be reduced by one.
      cy.get('#total').should('be.visible').and('contain', '50');

      // Check if the total number of pages is 7.
      cy.get('#seed-peer-pagination > .MuiPagination-ul').children().should('have.length', 7);
      cy.get('#hostname-seed-peer-3').should('not.exist');
    });

    it('when deleting a seed peer, there is only one seed peer on the next page', () => {
      cy.get('#table').click();

      // Go to next page.
      cy.get(':nth-child(6) > .MuiButtonBase-root').click();
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '5');

      // Check if the total number of pages is 8.
      cy.get('#seed-peer-pagination > .MuiPagination-ul').children().should('have.length', 8);
      cy.get('#hostname-seed-peer-25').should('be.visible').and('contain', 'seed-peer-25');
      cy.get('#hostname-seed-peer-3').should('not.exist');
      cy.get(':nth-child(5) > :nth-child(8) > .MuiChip-root > .MuiChip-label')
        .should('be.visible')
        .and('contain', 'Inactive');
      cy.get('#operation-9').click();
      cy.get(':nth-child(12) > .MuiPaper-root > .MuiList-root > .seed-peers_menu__BE2ff > #delete-seed-peer-9').click();

      cy.intercept({ method: 'DELETE', url: '/api/v1/seed-peers/9' }, (req) => {
        req.reply({
          statusCode: 200,
        });
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: seedPeerDeleteAfter,
          });
        },
      );

      cy.get('#deleteSeedPeer').click();

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

      // The total number of scheduler is 50.
      cy.get('#total').should('be.visible').and('contain', '50');

      // Check if the total number of pages is 7.
      cy.get('#seed-peer-pagination > .MuiPagination-ul').children().should('have.length', 7);
      cy.get('#hostname-seed-peer-9').should('not.exist');
      cy.get('#hostname-seed-peer-3').should('be.visible').and('contain', 'seed-peer-3');
    });

    it('delete the seed peer when switching to the seed peer card', () => {
      cy.get('#total').should('be.visible').and('contain', '51');
      cy.get(':nth-child(7) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#seed-peer-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '6');
      cy.get('#card-hostname-seed-peer-3').should('be.visible').and('contain', 'seed-peer-3');
      cy.get('#operation-3').click();
      cy.get(':nth-child(8) > .MuiPaper-root > .MuiList-root > .seed-peers_menu__BE2ff > #delete-seed-peer-3').click();
      cy.get('#cancelDeleteSeedPeer').click();
      cy.get('.MuiDialogContent-root').should('not.exist');

      // Confirm delete.
      cy.get('#operation-3').click();
      cy.get(':nth-child(8) > .MuiPaper-root > .MuiList-root > .seed-peers_menu__BE2ff > #delete-seed-peer-3').click();

      cy.intercept({ method: 'DELETE', url: '/api/v1/seed-peers/3' }, (req) => {
        req.reply({
          statusCode: 200,
        });
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: seedPeerDeleteAfter,
          });
        },
      ).as('getSeedPeers');

      // Confirm delete.
      cy.get('#deleteSeedPeer').click();
      cy.wait('@getSeedPeers');
      cy.get('#total').should('be.visible').and('contain', '50');
    });

    it('try to delete seed peer using guest user', () => {
      cy.guestSignin();
      cy.get('#card-hostname-seed-peer-51').should('be.visible').and('contain', 'seed-peer-51');

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/seed-peers/51',
        },
        (req) => {
          req.reply({
            statusCode: 401,
            body: { message: 'permission deny' },
          });
        },
      );

      cy.get('#operation-51').click();
      cy.get(
        ':nth-child(11) > .MuiPaper-root > .MuiList-root > .seed-peers_menu__BE2ff > #delete-seed-peer-51',
      ).click();
      cy.get('#deleteSeedPeer').click();

      // show error message.
      cy.contains('.MuiAlert-message', 'permission deny');
    });

    it('should handle API error response', () => {
      cy.get('#card-hostname-seed-peer-51').should('be.visible').and('contain', 'seed-peer-51');

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/seed-peers/51',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#operation-51').click();
      cy.get(
        ':nth-child(11) > .MuiPaper-root > .MuiList-root > .seed-peers_menu__BE2ff > #delete-seed-peer-51',
      ).click();
      cy.get('#deleteSeedPeer').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });

    it('after the search is complete, can delete the seed node', () => {
      cy.get('#seed-peer-search').type('seed-peer-9');

      // Check number of pagination.
      cy.get('#seed-peer-card').children().should('have.length', 1);

      cy.get('#operation-9').click();

      cy.get('#delete-seed-peer-9').click();

      cy.intercept({ method: 'DELETE', url: '/api/v1/seed-peers/9' }, (req) => {
        req.reply({
          statusCode: 200,
        });
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: seedPeerDeleteAfter,
          });
        },
      );

      cy.get('#deleteSeedPeer').click();

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

      // The total number of scheduler is 50.
      cy.get('#total').should('be.visible').and('contain', '50');

      // Check number of pagination.
      cy.get('#seed-peer-card').should('not.exist');

      cy.get('#seed-peer-search').clear();

      // Check number of pagination.
      cy.get('#seed-peer-card').children().should('have.length', 9);
    });

    it('after the search is complete, can toggle the state and delete the seed node', () => {
      cy.get('#seed-peer-search').type('seed-peer-3');

      // Check number of pagination.
      cy.get('#seed-peer-card').children().should('have.length', 9);

      cy.get('#lock-button').click();

      // Display active seed peer.
      cy.get('[value="inactive"]').click();

      // Check number of pagination.
      cy.get('#seed-peer-card').children().should('have.length', 6);

      cy.get('#operation-3').click();

      cy.get(':nth-child(8) > .MuiPaper-root > .MuiList-root > .seed-peers_menu__BE2ff > #delete-seed-peer-3').click();

      cy.intercept({ method: 'DELETE', url: '/api/v1/seed-peers/3' }, (req) => {
        req.reply({
          statusCode: 200,
        });
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply((res) => {
            res.setDelay(1000);
            res.send({
              statusCode: 200,
              body: deleteSeedPeer,
            });
          });
        },
      );

      // Confirm delete.
      cy.get('#deleteSeedPeer').click();
      // Show idloading.
      cy.get('[data-testid="isloading"]').should('be.exist');

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');
      cy.get('[data-testid="isloading"]').should('not.exist');

      // The total number of seed peers will be reduced by one.
      cy.get('#total').should('be.visible').and('contain', '50');

      // Check number of pagination.
      cy.get('#seed-peer-card').children().should('have.length', 5);
    });
  });

  describe('delete inactive instances', () => {
    it('there are no inactive seed peers to delete', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: seedPeerActive,
          });
        },
      );

      cy.get('#delete-all-inactive-instances').click();

      // Close delete inactive instances.
      cy.get('#close-delete-icon').click();
      cy.get('#delete-all-inactive-instances').click();

      cy.get('#delete-inactive-instances-title').should('have.text', 'Delete inactive instances');
      cy.get('#seedPeerTotal').should('have.text', '0 inactive');
      cy.get('#back-button').should('be.disabled');

      // Check next button.
      cy.get('#next-button').should('be.disabled');
    });

    it('deleting some inactive seed peers failed', () => {
      cy.intercept('DELETE', `/api/v1/seed-peers/9`, (req) => {
        req.reply({
          statusCode: 404,
          delayMs: 100,
          body: { message: 'Not Found' },
        });
      });

      const seedPeers = [39, 38, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 11, 18, 19, 20, 21, 22, 3];

      for (let i = 0; i < seedPeers.length; i++) {
        cy.intercept('DELETE', `/api/v1/seed-peers/${seedPeers[i]}`, (req) => {
          req.reply({
            statusCode: 200,
            delayMs: 400,
          });
        });
      }

      cy.get('#delete-all-inactive-instances').click();
      cy.get('#back-button').should('be.disabled');
      cy.get('#next-button').should('not.be.disabled');
      cy.get('#next-button').click();
      cy.get('#back-button').click();
      cy.get('#next-button').click();

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deletedInactiveseedPeerError,
          });
        },
      );

      cy.get('#deleteAllInactive').type('DELET3{enter}');

      // Display verification failure prompt information.
      cy.get('#deleteAllInactive-helper-text').should('have.text', 'Please enter "DELETE"');

      cy.get('#deleteAllInactive').clear();
      cy.get('#deleteAllInactive').type('DELETE{enter}');

      cy.get('#failure').should('exist');

      cy.get('#inactive-header').click();

      // Show error message.
      cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'Deletion of seed peer with ID 9 failed!, error: Not Found.');

      cy.get('#total').should('have.text', 33);

      cy.get('#inactive').should('have.text', 2);
    });

    it('can Delete inactive instances', () => {
      const seedPeers = [39, 38, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 11, 18, 19, 20, 21, 22, 9, 3];

      for (let i = 0; i < seedPeers.length; i++) {
        cy.intercept('DELETE', `/api/v1/seed-peers/${seedPeers[i]}`, (req) => {
          req.reply({
            statusCode: 200,
            delayMs: 400,
          });
        });
      }

      cy.get('#delete-all-inactive-instances').click();
      cy.get('body').click('topLeft');

      cy.get('#delete-all-inactive-instances').click();

      cy.get('#delete-inactive-instances-title').should('have.text', 'Delete inactive instances');
      cy.get('#seedPeerTotal').should('have.text', '20 inactive');
      cy.get('#back-button').should('be.disabled');
      cy.get('#next-button').should('not.be.disabled');
      cy.get('#next-button').click();

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deletedInactiveseedPeer,
          });
        },
      );

      cy.get('#deleteAllInactive').type('DELETE');

      cy.get('#deleteAllInactive-helper-text').should('not.exist');

      cy.get('#save-delete').click();

      // Show delete loading page.
      cy.get('.MuiLinearProgress-root').should('be.visible');

      // Unable to display delete cancel button and delete cancel icon button.
      cy.get('#close-delete-icon').should('not.exist');
      cy.get('#cancel-button').should('not.exist');
      cy.get('.css-xmqx0h').should('be.visible');

      cy.get('#failure').should('not.exist');

      cy.wait(400 * seedPeers.length);
      // Show number of deleted seed peers.
      cy.get('.MuiAlert-message').should('have.text', 'You have successfully deleted 20 inactive seed peers!');

      // Check the total number of seed peers.
      cy.get('#total').should('have.text', '31');

      cy.get('#inactive').should('have.text', '0');
    });

    it('cannot delete inactive instances', () => {
      cy.intercept('DELETE', `/api/v1/seed-peers/39`, (req) => {
        req.reply({
          statusCode: 404,
          delayMs: 100,
          body: { message: 'Not Found' },
        });
      });

      cy.get('#delete-all-inactive-instances').click();
      cy.get('#back-button').should('be.disabled');
      cy.get('#next-button').should('not.be.disabled');
      cy.get('#next-button').click();

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deletedInactiveseedPeer,
          });
        },
      );

      cy.get('#deleteAllInactive').type('DELETE{enter}');
      cy.get('#failure').should('exist');
      cy.get('#inactive-header').click();

      // Show error message.
      cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'Deletion of seed peer with ID 39 failed!, error: Not Found.');
    });

    it('should handle delete seed peer API error response', () => {
      cy.intercept('DELETE', `/api/v1/seed-peers/39`, (req) => {
        req.reply({
          forceNetworkError: true,
        });
      });

      cy.get('#delete-all-inactive-instances').click();
      cy.get('#back-button').should('be.disabled');
      cy.get('#next-button').should('not.be.disabled');
      cy.get('#next-button').click();

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#deleteAllInactive').type('DELETE{enter}');
      cy.get('#failure').should('exist');
      cy.get('#inactive-header').click();

      // Show error message.
      cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'Deletion of seed peer with ID 39 failed!, error: Failed to fetch.');

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });

    it('try to delete inactive seed peer using guest user', () => {
      cy.guestSignin();

      cy.intercept('DELETE', `/api/v1/seed-peers/39`, (req) => {
        req.reply({
          statusCode: 401,
          body: { message: 'permission deny' },
        });
      });

      cy.get('#delete-all-inactive-instances').click();
      cy.get('#back-button').should('be.disabled');
      cy.get('#next-button').should('not.be.disabled');
      cy.get('#next-button').click();

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/seed-peers?page=1&per_page=10000000&seed_peer_cluster_id=1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            // body: deletedInactiveseed peer,
          });
        },
      );

      cy.get('#deleteAllInactive').type('DELETE{enter}');
      cy.get('#failure').should('exist');
      cy.get('#inactive-header').click();

      // Show error message.
      cy.get('.MuiAccordionDetails-root > .MuiTypography-root')
        .should('be.visible')
        .and('have.text', 'Deletion of seed peer with ID 39 failed!, error: permission deny.');
    });
  });
});
