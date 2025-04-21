import clusters from '../../fixtures/clusters/clusters.json';
import seedPeers from '../../fixtures/seed-peers/seed-peers.json';
import schedulers from '../../fixtures/schedulers/schedulers.json';

describe('Menu', () => {
  beforeEach(() => {
    cy.viewport(1440, 1080);
  });

  it('user not signin', () => {
    // redirect when not signin.
    cy.visit('/');

    // Then I see that the current page is the signin!
    cy.url().should('include', '/signin');
  });

  it('should switch to dark mode', () => {
    cy.guestSignin();
    cy.visit('/');

    // Click the Light button.
    cy.get('#light').click();
    cy.get('#light').should('have.class', 'Mui-selected');

    // Check if it is switched to light mode.
    cy.get('#main').should('have.css', 'background-color', 'rgb(244, 246, 248)');

    // Click the Dark button.
    cy.get('#dark').click();
    cy.get('#dark').should('have.class', 'Mui-selected');

    // Check if it is switched to dark mode.
    cy.get('#main').should('have.css', 'background-color', 'rgb(31, 36, 48)');
  });

  describe('try to signin as guest user', () => {
    beforeEach(() => {
      cy.guestSignin();

      cy.visit('/');
    });

    it('should be redirect when signin', () => {
      // Then I see that the current page is the clusters!
      cy.url().should('include', '/clusters');

      // The selected menu is clusters.
      cy.get('[href="/clusters"]').should('have.class', 'Mui-selected');

      // User menu does not exist.
      cy.get('[href="/users"]').should('not.exist');
    });

    it('should navigate to the tokens page', () => {
      cy.get('#developer').click();
      cy.get('#personal-access-tokens').click();

      // Then I see that the current page is the tokens!
      cy.url().should('include', '/developer/personal-access-tokens');

      // The selected menu is tokens.
      cy.get('#personal-access-tokens').should('have.class', 'Mui-selected');

      cy.get('#dragonfly').click();
      // Then I see that the current page is the clusters!
      cy.url().should('include', '/clusters');
    });

    it('should navigate to the preheats page and task page', () => {
      cy.get('#jobs').click();
      cy.get('#preheats').click();

      // Then I see that the current page is the preheats!
      cy.url().should('include', '/jobs/preheats');

      // The selected menu is preheats.
      cy.get('#preheats').should('have.class', 'Mui-selected');

      cy.get('#task').click();

      // Then I see that the current page is the task!
      cy.url().should('include', '/jobs/task/clear');

      cy.get('#task').should('have.class', 'Mui-selected');
    });
  });

  describe('try to signin as root user', () => {
    beforeEach(() => {
      cy.signin();

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/clusters?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: clusters,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/schedulers?page=1&per_page=10000000',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: schedulers,
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
            body: seedPeers,
          });
        },
      );

      cy.visit('/');
    });

    it('should be redirect when signin', () => {
      // Then I see that the current page is the clusters!
      cy.url().should('include', '/clusters');

      // The selected menu is clusters.
      cy.get('[href="/clusters"]').should('have.class', 'Mui-selected');
    });

    it('should navigate to the tokens page', () => {
      cy.get('#developer').click();
      cy.get('#personal-access-tokens').click();

      // Then I see that the current page is the tokens!
      cy.url().should('include', '/developer/personal-access-tokens');

      // The selected menu is tokens.
      cy.get('#personal-access-tokens').should('have.class', 'Mui-selected');
    });

    it('should navigate to the preheats page and task page', () => {
      cy.get('#jobs').click();
      cy.get('#preheats').click();

      // Then I see that the current page is the preheats!
      cy.url().should('include', '/jobs/preheats');

      // The selected menu is preheats.
      cy.get('#preheats').should('have.class', 'Mui-selected');

      cy.get('#task').click();

      // Then I see that the current page is the task!
      cy.url().should('include', '/jobs/task/clear');

      cy.get('#task').should('have.class', 'Mui-selected');
    });

    it('should navigate to the users page', () => {
      cy.get('#users').click();

      // Then I see that the current page is the users!
      cy.url().should('include', '/users');

      // The selected menu is users.
      cy.get('#users').should('have.class', 'Mui-selected');
    });

    it('should navigate to the profile page', () => {
      // Click unfold button.
      cy.get('#unfold-more').click();

      // Go to profil page.
      cy.get('#profile-menu').click();

      // Then I see that the current page is the profile!
      cy.url().should('include', '/profile');
    });

    it('The menu should be smaller', () => {
      // The menu should be smaller.
      cy.get('#closure').should('exist').click();
      cy.get('#expand').should('exist');
      cy.get('#closure').should('not.exist');

      // Go to tokens page.
      cy.get('#developer').click();

      cy.get('#personal-access-tokens').click();

      // Then I see that the current page is the tokens!
      cy.url().should('include', '/developer/personal-access-tokens');

      // Go to jobs page.
      cy.get('#jobs').click();
      cy.get('#preheats').click();

      // Then I see that the current page is the preheats!
      cy.url().should('include', '/jobs/preheats');

      // Go to task page.
      cy.get('#jobs').click();
      cy.get('#task').click();

      // Then I see that the current page is the task!
      cy.url().should('include', '/jobs/task/clear');

      // Go to user page.

      cy.get('#users').click();

      // Then I see that the current page is the users!
      cy.url().should('include', '/users');
    });

    it('can logout', () => {
      cy.intercept(
        {
          method: 'POST',
          url: '/api/v1/users/signout',
        },
        (req) => {
          req.reply({
            statusCode: 200,
          });
        },
      );

      cy.get('#unfold-more').click();

      cy.get('body').click('topLeft');

      cy.get('#unfold-more').click();

      // Click Logout button.
      cy.get('#logout-menu').click();

      // Then I see that the current page is the signin!
      cy.url().should('include', '/signin');
    });

    it('logout API error response', () => {
      cy.intercept(
        {
          method: 'POST',
          url: '/api/v1/users/signout',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      cy.get('#unfold-more').click();

      cy.get('#logout-menu').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiAlert-message').should('not.exist');
    });
  });
});
