describe('The 404 Page', () => {
  it('sets auth cookie when logging in via form submission', function () {
    // destructuring assignment of the this.currentUser object
    // const { username, password } = this.currentUser;

    cy.visit('/404');

    cy.get('.MuiButtonBase-root').click();
    cy.url().should('include', '/signin');
  });
});
