describe('404', () => {
  beforeEach(() => {
    cy.signin();

    cy.viewport(1440, 1080);
  });

  it('show 404 page', () => {
    cy.visit('/root');
    cy.get('.MuiTypography-h4').should('have.text', 'Something gone wrong!');
  });

  it('click the `go back cluster` button', () => {
    cy.visit('/root');
    cy.get('.MuiTypography-h4').should('have.text', 'Something gone wrong!');
    cy.get('.MuiButtonBase-root').click();

    // Then I see that the current page is the clusters.
    cy.url().should('include', '/clusters');
  });
});
