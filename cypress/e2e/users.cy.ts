import root from '../fixtures/api/role-root.json';
import user from '../fixtures/api/user.json';
import users from '../fixtures/api/users.json';
import guestUser from '../fixtures/api/guest-user.json';
import guest from '../fixtures/api/role-guest.json';

describe('Users', () => {
  beforeEach(() => {
    cy.signin();
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: user,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/1/roles',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: root,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: users,
        });
      },
    );

    cy.visit('/users');
    cy.viewport(1440, 1080);
  });

  describe('when data is loaded', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/2',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: user,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/3',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: guestUser,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/2/roles',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: root,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/3/roles',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: guest,
          });
        },
      );
    });

    it('can display users table', () => {
      // Show root user information.
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(2)').should('be.visible').and('have.text', 'root');

      // Show root user email.
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(3)')
        .should('be.visible')
        .and('have.text', 'root@example.com');

      // Show root user location.
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(4)').should('be.visible').and('have.text', 'Shanghai');

      // Show root user state.
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(5)').should('be.visible').and('have.text', 'Enable');

      // The update role button for the root user is not displayed.
      cy.get('#edit-root > .MuiBox-root').should('not.exist');

      // Show root user detail button.
      cy.get('#detail-root > .MuiBox-root').should('exist');

      // Show lucy user information.
      cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(2)').should('be.visible').and('have.text', 'lucy');

      cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(3)')
        .should('be.visible')
        .and('have.text', 'lucy@example.com');

      cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(4)').should('be.visible').and('have.text', 'Hangzhou');

      cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(5)').should('be.visible').and('have.text', 'Enable');

      cy.get('#edit-lucy > .MuiBox-root').should('exist');
      cy.get('#detail-lucy > .MuiBox-root').should('exist');

      // Show jack user information.
      cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(2)').should('be.visible').and('have.text', 'jack');

      cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(3)')
        .should('be.visible')
        .and('have.text', 'jack@example.com');

      cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(4)').should('be.visible').and('have.text', 'Shanghai');

      cy.get('.MuiTableBody-root > :nth-child(3) > :nth-child(5)').should('be.visible').and('have.text', 'Enable');

      cy.get('#edit-jack > .MuiBox-root').should('exist');
      cy.get('#detail-jack > .MuiBox-root').should('exist');
    });

    it('can display user detail', () => {
      // Click detail button.
      cy.get('#detail-root > .MuiBox-root').click();

      // Display user lucy details.
      cy.get('.MuiDrawer-root > .MuiPaper-root').should('be.visible');
      cy.get(':nth-child(3) > .css-e784if-MuiTypography-root').should('have.text', 1);
      cy.get(':nth-child(5) > .css-e784if-MuiTypography-root').should('have.text', 'root');
      cy.get('.css-e784if-MuiTypography-root > .MuiChip-root').should('have.text', 'root');
      cy.get(':nth-child(9) > .css-e784if-MuiTypography-root').should('have.text', 'root@example.com');
      cy.get(':nth-child(11) > .css-e784if-MuiTypography-root').should('have.text', '1234567890');
      cy.get('.users_emailContent__jraG8 > .MuiTypography-root').should('have.text', 'Hangzhou');
      cy.get('.MuiList-root > :nth-child(15)').should('contain', '2023-11-06 06:09:04');
      cy.get('.MuiList-root > :nth-child(17)').should('contain', '2023-11-06 06:09:04');

      // closure user details.
      cy.get('.MuiListSubheader-root > .MuiButtonBase-root').click();

      cy.get('#detail-jack').click();

      // Display user jack details.
      cy.get('.MuiDrawer-root > .MuiPaper-root').should('be.visible');
      cy.get(':nth-child(3) > .css-e784if-MuiTypography-root').should('have.text', 2);
      cy.get(':nth-child(5) > .css-e784if-MuiTypography-root').should('have.text', 'jack');
      cy.get('.css-e784if-MuiTypography-root > .MuiChip-root').should('have.text', 'guest');
      cy.get(':nth-child(9) > .css-e784if-MuiTypography-root').should('have.text', 'jack@example.com');
      cy.get(':nth-child(11) > .css-e784if-MuiTypography-root').should('have.text', '1234567890');
      cy.get('.users_emailContent__jraG8 > .MuiTypography-root').should('have.text', 'Shanghai');
      cy.get('.MuiList-root > :nth-child(15)').should('contain', '2023-11-07 06:09:04');
      cy.get('.MuiList-root > :nth-child(17)').should('contain', '2023-11-07 06:09:04');
    });

    it('can display update user', () => {
      // Click update user button.
      cy.get('#edit-lucy > .MuiBox-root').click();

      // Check role.
      cy.get('#role-root').should('be.checked').check({ force: true });
      cy.get('#role-guest');
      cy.get('body').click('topLeft');

      cy.get('#edit-jack > .MuiBox-root').click();

      cy.get('#role-root').should('not.be.checked');
      cy.get('#role-guest').should('be.checked').check({ force: true });
    });
  });

  describe('when no data is loaded', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: user,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/1/roles',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: root,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: [],
          });
        },
      );

      cy.visit('/users');
      cy.viewport(1440, 1080);
    });

    it('cannot display users table', () => {
      cy.get('#user-table-row').should('not.exist');
    });
  });

  it('try to show users page using guest user', () => {
    cy.guestSignin();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/2',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: guestUser,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/2/roles',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: guest,
        });
      },
    );

    // The 404 page is displayed and the user page does not exist.
    cy.get('.MuiTypography-h4').should('have.text', 'Something gone wrong!');
    cy.get('.MuiTypography-body1').should('have.text', `The page you were looking for doesn't exist.`);
  });

  describe('get role API error response', () => {
    it('cannot display users table', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('.MuiAlert-message').should('be.visible').and('have.text', 'Failed to fetch');
    });

    it('user detail should render empty', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/3',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/3/roles',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#detail-jack').click();

      // Display user jack details.
      cy.get(':nth-child(3) > .css-e784if-MuiTypography-root').should('have.text', 0);
      cy.get(':nth-child(5) > .css-e784if-MuiTypography-root').should('have.text', '-');
      cy.get('.MuiList-root > :nth-child(7)').should('contain', '-');
      cy.get(':nth-child(9) > .css-e784if-MuiTypography-root').should('have.text', '-');
      cy.get(':nth-child(11) > .css-e784if-MuiTypography-root').should('have.text', '-');
      cy.get('.users_emailContent__jraG8 > .MuiTypography-root').should('have.text', '-');
      cy.get('.MuiList-root > :nth-child(15)').should('contain', '-');
      cy.get('.MuiList-root > :nth-child(17)').should('contain', '-');
    });
  });

  describe('pagination', () => {
    it('pagination updates results and page number', () => {
      cy.get('#user-pagination').should('exist');

      // Check number of pagination.
      cy.get('#user-pagination > .MuiPagination-ul').children().should('have.length', 4);

      cy.get('#user-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');
    });

    it('when pagination changes, different page results are rendered', () => {
      cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(2)').should('be.visible').and('have.text', 'root');

      // There are ten users on the current page.
      cy.get('#user-table-body').children().should('have.length', 10);

      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      cy.get('#user-table-row > :nth-child(2)').should('be.visible').and('have.text', 'root-11');

      // There is only one user on the current page.
      cy.get('#user-table-body').children().should('have.length', 1);

      // Check the current page number.
      cy.get('#user-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');
    });

    it('pagination resets results and page number to first page when refresh is clicked', () => {
      // Go to next page.
      cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();

      // There is only one user on the current page.
      cy.get('#user-table-body').children().should('have.length', 1);

      // Check the current page number.
      cy.get('#user-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '2');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(2000);
      });

      // There are ten users on the current page.
      cy.get('#user-table-body').children().should('have.length', 10);

      // Check the current page number.
      cy.get('#user-pagination > .MuiPagination-ul .Mui-selected').should('have.text', '1');
    });
  });

  describe('update role', () => {
    it('can change the root user to the guest user', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/2/roles',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: root,
          });
        },
      );
      cy.intercept(
        {
          method: 'PUT',
          url: '/api/v1/users/2/roles/guest',
        },
        (req) => {
          req.reply({
            statusCode: 200,
          });
        },
      );
      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/users/2/roles/root',
        },
        (req) => {
          req.reply({
            statusCode: 200,
          });
        },
      );

      cy.get('#edit-lucy > .MuiBox-root').click();

      cy.get('#role-root').should('be.checked').check({ force: true });
      cy.get('#role-guest').should('not.be.checked');

      // Switch role to guest.
      cy.get('#role-guest').click();

      cy.get('#save').click();

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/2/roles',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: ['guest'],
          });
        },
      );

      cy.get('#edit-lucy > .MuiBox-root').click();

      // Change success message.
      cy.get('.MuiAlert-message').should('be.visible').and('have.text', 'Submission successful!');
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiAlert-message').should('not.exist');

      // Check role.
      cy.get('#role-root').should('not.be.checked');
      cy.get('#role-guest').should('be.checked').check({ force: true });
    });

    it('can change the guest user to the root user', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/3/roles',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: guest,
          });
        },
      );
      cy.intercept(
        {
          method: 'PUT',
          url: '/api/v1/users/3/roles/root',
        },
        (req) => {
          req.reply({
            statusCode: 200,
          });
        },
      );
      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/users/3/roles/guest',
        },
        (req) => {
          req.reply({
            statusCode: 200,
          });
        },
      );

      cy.get('#edit-jack > .MuiBox-root').click();

      // Check if role is guest.
      cy.get('#role-root').should('not.be.checked');
      cy.get('#role-guest').should('be.checked').check({ force: true });

      // Switch role to root.
      cy.get('#role-root').click();
      cy.get('#save').click();
      cy.get('.MuiAlert-message').should('be.visible').and('have.text', 'Submission successful!');

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/3/roles',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: ['root'],
          });
        },
      );

      cy.get('#edit-jack > .MuiBox-root').click();

      // Check if role is root.
      cy.get('#role-root').should('be.checked').check({ force: true });
      cy.get('#role-guest').should('not.be.checked');
    });

    it('try using root user to change to guest user and then update to root user', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/2/roles',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: root,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/2',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: user,
          });
        },
      );

      cy.guestSignin();

      cy.intercept(
        {
          method: 'PUT',
          url: '/api/v1/users/2/roles/guest',
        },
        (req) => {
          req.reply({
            statusCode: 200,
          });
        },
      );
      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/users/2/roles/root',
        },
        (req) => {
          req.reply({
            statusCode: 200,
          });
        },
      );

      // Click edit button.
      cy.get('#edit-lucy > .MuiBox-root').click();

      cy.get('#role-root').should('be.checked').check({ force: true });
      cy.get('#role-guest').should('not.be.checked');

      cy.get('#role-guest').click();
      cy.get('#save').click();

      // Change success message.
      cy.get('.MuiAlert-message').should('be.visible').and('have.text', 'Submission successful!');
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/2/roles',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: ['guest'],
          });
        },
      );

      cy.get('#edit-lucy > .MuiBox-root').click();

      // Check role.
      cy.get('#role-root').should('not.be.checked');
      cy.get('#role-guest').should('be.checked').check({ force: true });

      // Switch role to guest.
      cy.get('#role-root').click();

      cy.intercept(
        {
          method: 'PUT',
          url: '/api/v1/users/2/roles/root',
        },
        (req) => {
          req.reply({
            statusCode: 401,
            body: { message: 'permission deny' },
          });
        },
      );

      cy.get('#save').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('have.text', 'permission deny');

      // Refresh page.
      cy.reload().then(() => {
        cy.wait(2000);
      });

      // When the user role is guest, the user page will no longer be displayed.
      cy.get('.MuiTypography-body1')
        .should('be.visible')
        .and('have.text', `The page you were looking for doesn't exist.`);
    });

    it('get role API error response', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/2/roles',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#edit-lucy > .MuiBox-root').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('have.text', 'Failed to fetch');

      // Check role.
      cy.get('#role-root').should('not.be.checked');
      cy.get('#role-guest').should('not.be.checked');
    });

    it('change role API error response', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/2/roles',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: root,
          });
        },
      );
      cy.intercept(
        {
          method: 'PUT',
          url: '/api/v1/users/2/roles/guest',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );
      cy.intercept(
        {
          method: 'DELETE',
          url: '/api/v1/users/2/roles/root',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#edit-lucy > .MuiBox-root').click();

      // Check if role is root.
      cy.get('#role-root').should('be.checked').check({ force: true });
      cy.get('#role-guest').should('not.be.checked');

      cy.get('#role-guest').click();

      cy.get('#save').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('have.text', 'Failed to fetch');
    });
  });
});
