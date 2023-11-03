describe('The 404 Page', () => {
  it('404', function () {
    // destructuring assignment of the this.currentUser object
    // const { username, password } = this.currentUser;

    cy.visit('/404');

    cy.get('.MuiButtonBase-root').click();

    cy.url().should('include', '/signin');
  });
});
