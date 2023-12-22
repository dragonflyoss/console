describe('Menu', () => {
  it('user not signin', () => {
    // redirect when not signin.
    cy.visit('/');

    // Then I see that the current page is the signin!
    cy.url().should('include', '/signin');
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
      cy.get('.MuiList-root > :nth-child(2) > .MuiButtonBase-root').click();
      cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').click();

      // Then I see that the current page is the tokens!
      cy.url().should('include', '/developer/personal-access-tokens');

      // The selected menu is tokens.
      cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').should('have.class', 'Mui-selected');
    });

    it('should navigate to the preheats page', () => {
      cy.get('.MuiList-root > :nth-child(3) > .MuiButtonBase-root').click();
      cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').click();

      // Then I see that the current page is the preheats!
      cy.url().should('include', '/jobs/preheats');

      // The selected menu is preheats.
      cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').should('have.class', 'Mui-selected');
    });

    it('should navigate to the peers page', () => {
      cy.get('.MuiList-root > :nth-child(4) > .MuiButtonBase-root').click();
      cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').click();

      // Then I see that the current page is the peers!
      cy.url().should('include', '/insight/peers');

      // The selected menu is peers.
      cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').should('have.class', 'Mui-selected');
    });
  });

  describe('try to signin as root user', () => {
    beforeEach(() => {
      cy.signin();

      cy.visit('/');
    });

    it('should be redirect when signin', () => {
      // Then I see that the current page is the clusters!
      cy.url().should('include', '/clusters');

      // The selected menu is clusters.
      cy.get('[href="/clusters"]').should('have.class', 'Mui-selected');
    });

    it('should navigate to the tokens page', () => {
      cy.get('.MuiList-root > :nth-child(2) > .MuiButtonBase-root').click();
      cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').click();

      // Then I see that the current page is the tokens!
      cy.url().should('include', '/developer/personal-access-tokens');

      // The selected menu is tokens.
      cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').should('have.class', 'Mui-selected');
    });

    it('should navigate to the preheats page', () => {
      cy.get('.MuiList-root > :nth-child(3) > .MuiButtonBase-root').click();
      cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').click();

      // Then I see that the current page is the preheats!
      cy.url().should('include', '/jobs/preheats');

      // The selected menu is preheats.
      cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').should('have.class', 'Mui-selected');
    });

    it('should navigate to the peers page', () => {
      cy.get('.MuiList-root > :nth-child(4) > .MuiButtonBase-root').click();
      cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').click();

      // Then I see that the current page is the peers!
      cy.url().should('include', '/insight/peers');

      // The selected menu is peers.
      cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').should('have.class', 'Mui-selected');
    });

    it('should navigate to the users page', () => {
      cy.get('[href="/users"]').click();

      // Then I see that the current page is the users!
      cy.url().should('include', '/users');

      // The selected menu is users.
      cy.get('[href="/users"]').should('have.class', 'Mui-selected');
    });

    it('should navigate to the profile page', () => {
      // Click unfold button.
      cy.get('#unfold-more').click();

      // Go to profil page.
      cy.get('#profile-menu').click();

      // Then I see that the current page is the profile!
      cy.url().should('include', '/profile');
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

      cy.get('.css-1rr4qq7 > .MuiSnackbar-root > .MuiPaper-root > .MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiAlert-message').should('not.exist');
    });
  });
});
