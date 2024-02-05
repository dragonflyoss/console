import tokens from '../../../fixtures/developer/tokens/tokens.json';
import deleteToken from '../../../fixtures/developer/tokens/delete-tokens.json';
import tokenDeleteAfter from '../../../fixtures/developer/tokens/token-delete-after.json';

describe('Tokens', () => {
  beforeEach(() => {
    cy.signin();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/personal-access-tokens?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: tokens,
        });
      },
    );

    cy.visit('/developer/personal-access-tokens');
    cy.viewport(1440, 1080);
  });

  it('when data is loaded', () => {
    cy.get('.css-1qdyvok > .MuiTypography-root').should('have.text', 'Personal access tokens');

    cy.get('.MuiList-root > :nth-child(2) > .MuiButtonBase-root > .MuiTypography-root').click();

    // Whether the style selected by menu is Personal access tokens.
    cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').should('have.class', 'Mui-selected');

    // Show token name.
    cy.get('#root-11').should('be.visible').and('have.text', 'root-11');

    // Show user name.
    cy.get(':nth-child(1) > .css-fyy1jt > :nth-child(1) > .MuiBox-root > .MuiTypography-body2').should(
      'contain',
      'root',
    );

    // Show Expiration.
    cy.get(':nth-child(1) > .css-fyy1jt > :nth-child(1) > .css-70qvj9 > .css-189ppmh-MuiTypography-root')
      .should('be.visible')
      .and('have.text', 'Mon, Dec 11 2023.');

    // Show token information.
    cy.get('#root-9').should('be.visible').and('have.text', 'root-9');

    cy.get(':nth-child(3) > .css-fyy1jt > :nth-child(1) > .css-fu0n4a > .MuiTypography-body2').should(
      'contain',
      'jack',
    );

    cy.get(':nth-child(3) > .css-fyy1jt > :nth-child(1) > .css-70qvj9 > .css-189ppmh-MuiTypography-root')
      .should('be.visible')
      .and('have.text', 'Thu, Dec 1 2033.');

    cy.get('#root-4').should('be.visible').and('have.text', 'root-4');

    cy.get(':nth-child(8) > .css-fyy1jt > :nth-child(1) > .css-fu0n4a > .MuiTypography-body2').should(
      'contain',
      'lucy',
    );

    cy.get(':nth-child(8) > .css-fyy1jt > :nth-child(1) > .css-70qvj9 > .css-189ppmh-MuiTypography-root')
      .should('be.visible')
      .and('have.text', 'Sun, Feb 11 2024.');
  });

  it('when no data is loaded', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/personal-access-tokens?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );

    cy.get('#tokens-list').should('not.exist');
    cy.get('.MuiPaper-root').should('be.visible').and('have.text', `You don't have any tokens.`);
  });

  describe('should handle API error response', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/personal-access-tokens?page=1&per_page=10000000',
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
      cy.get('.MuiAlert-message').should('be.visible').and('have.text', 'Failed to fetch');
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    });

    it('there should be a message indicating that there is not tokens', () => {
      cy.get('#tokens-list').should('not.exist');
      cy.get('.MuiPaper-root').should('be.visible').and('have.text', `You don't have any tokens.`);
    });
  });

  describe('pagination', () => {
    it('pagination updates results and page number', () => {
      // Check number of pagination.
      cy.get('#tokens-pagination > .MuiPagination-ul').children().should('have.length', 4);

      // Check the current page number.
      cy.get('#tokens-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');
    });

    it('when pagination changes, different page results are rendered', () => {
      // Check the current page number.
      cy.get('#tokens-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');

      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3)').click();

      // Check the current page number.
      cy.get('#tokens-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Show token name.
      cy.get('.MuiTypography-inherit').should('be.visible').and('have.text', 'root-1');

      cy.get('span.css-189ppmh-MuiTypography-root').should('be.visible').and('have.text', 'Thu, Dec 1 2033.');
    });

    it('when you click refresh, the paginated results and page numbers remain unchanged.', () => {
      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3)').click();

      // Check the current page number.
      cy.get('#tokens-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(2000);
      });

      // Check if the page number is the last page number.
      cy.get('#tokens-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
    });

    it('when returning to the previous page, pagination and results remain unchanged', () => {
      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3)').click();

      // Check the current page number.
      cy.get('#tokens-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#root-1').should('have.text', 'root-1');

      cy.get('#root-1').click();

      // Then I see that the current page is the show update personal-access-tokens.
      cy.url().should('include', '/developer/personal-access-tokens/1');

      // Go back to the last page。
      cy.go('back');

      // Check the current page number.
      cy.get('#tokens-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      cy.get('#root-1').should('have.text', 'root-1');
    });
  });

  describe('delete', () => {
    it('when a token is removed, this token is the only token on the last page', () => {
      // Go to last page.
      cy.get('.MuiPagination-ul > :nth-child(3)').click();
      cy.get('#tokens-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Displays the name of the token that needs to be deleted.
      cy.get('#root-1').should('be.visible').and('have.text', 'root-1');

      // Click DELETE button.
      cy.get('.css-fyy1jt > :nth-child(2) > .MuiButtonBase-root').click();

      // Click cancel button.
      cy.get('#cancel').click();
      cy.get('.css-fyy1jt > :nth-child(2) > .MuiButtonBase-root').click();

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/personal-access-tokens/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/personal-access-tokens?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: deleteToken,
          });
        },
      ).as('delete');

      // Confirm delete.
      cy.get('#delete').click();
      cy.wait('@delete');

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

      // Check if the token exists.
      cy.get('#root-1').should('not.exist');

      // Pagination does not exist.
      cy.get('#tokens-pagination > .MuiPagination-ul').should('not.exist');
    });

    it('When removing a token, there is only one token for the next page', () => {
      // Check the current page number.
      cy.get('#tokens-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');

      // Displays the name of the token that needs to be deleted.
      cy.get('#root-11').should('be.visible').and('have.text', 'root-11');

      cy.get(':nth-child(1) > .css-fyy1jt > :nth-child(2) > #delete-token').click();

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/personal-access-tokens/11',
        },
        (req) => {
          req.reply({
            statusCode: 200,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/personal-access-tokens?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: tokenDeleteAfter,
          });
        },
      ).as('delete');

      cy.get('#delete').click();
      cy.wait('@delete');

      // Delete success message.
      cy.get('.MuiAlert-message').should('have.text', 'Submission successful!');

      // Check if the token exists.
      cy.get('#root-11').should('not.exist');

      // Pagination does not exist.
      cy.get('#tokens-pagination > .MuiPagination-ul').should('not.exist');
    });

    it('try to delete token using guest user', () => {
      cy.guestSignin();

      cy.get(':nth-child(1) > .css-fyy1jt > :nth-child(2) > #delete-token').click();

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/personal-access-tokens/11',
        },
        (req) => {
          req.reply({
            statusCode: 401,
            body: { message: 'permission deny' },
          });
        },
      );

      cy.get('#delete').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'permission deny');
    });

    it('try to delete token using guest user', () => {
      cy.guestSignin();

      cy.get(':nth-child(1) > .css-fyy1jt > :nth-child(2) > #delete-token').click();

      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/personal-access-tokens/11',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#delete').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('have.text', 'Failed to fetch');
    });
  });
});
