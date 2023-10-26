describe('The 404 Page', () => {
  it('sets auth cookie when logging in via form submission', function () {
    // destructuring assignment of the this.currentUser object
    // const { username, password } = this.currentUser;
    cy.visit('/signin');
    cy.get('#account').type('root');
    cy.get('#password').type(`dragonfly{enter}`);

    cy.visit('/clusters');
    cy.get('.MuiList-root > :nth-child(2) > .MuiButtonBase-root').click();

    cy.get('.MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root').click();

    cy.url().should('include', '/developer/personal-access-tokens');

    cy.get(':nth-child(3) > .css-ibh903-MuiButtonBase-root-MuiListItemButton-root').click();
    cy.get(
      ':nth-child(3) > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root',
    ).click();
    cy.url().should('include', '/jobs/preheats');

    cy.get(':nth-child(4) > .MuiButtonBase-root').click();

    cy.get(
      ':nth-child(4) > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiList-root > .MuiButtonBase-root',
    ).click();

    cy.url().should('include', '/insight/peers');

    cy.get('.css-1f5e1yp > .MuiButtonBase-root').click();

    cy.get('.MuiPaper-root > .MuiList-root > [tabindex="0"]').click();
    cy.url().should('include', '/profile');
    //logout
    cy.get('.MuiList-root > [tabindex="-1"]').click();
    cy.url().should('include', '/signin');
  });
});
