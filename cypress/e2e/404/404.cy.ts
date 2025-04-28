describe('404', () => {
  beforeEach(() => {
    cy.signin();

    cy.viewport(1440, 1080);
  });

  it('show 404 page', () => {
    cy.visit('/root');

    cy.get('#404-help-text').should('have.text', `The page you were looking for doesn't exist.`);
  });

  it('click the `go back cluster` button', () => {
    cy.visit('/root');

    // Display 404 help text.
    cy.get('#something-went-wrong').should('have.text', 'Something gone wrong!');
    cy.get('#404-help-text').should('have.text', `The page you were looking for doesn't exist.`);

    // Click go back cluster button.
    cy.get('#go-back').click();

    // Then I see that the current page is the clusters.
    cy.url().should('include', '/clusters');
  });
});
