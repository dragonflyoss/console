describe('The clusters Page', () => {
  it('cluster page', function () {
    cy.visit('/signin');
    cy.visit('/signin');
    cy.get('#account').type('root');
    cy.get('#password').type(`dragonfly{enter}`);

    cy.visit('/clusters');

    cy.get(
      ':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .clusters_creatTimeContainer__k6XfL > .MuiButtonBase-root',
    ).click();

    cy.get('.MuiBreadcrumbs-ol > :nth-child(3) > .MuiTypography-root').contains('cluster-1');

    // cy.get('.css-bbra84-MuiButtonBase-root-MuiButton-root').click();

    // Delete
    cy.get(':nth-child(7) > .MuiButtonBase-root > [data-testid="DeleteIcon"] > path').click();

    cy.get('#cancelDeleteScheduler').click();

    cy.get(':nth-child(9) > .MuiButtonBase-root > [data-testid="DeleteIcon"]').click();

    cy.get('#cancelDeleteSeedPeer').click();

    //search scheduler
    cy.get(
      ':nth-child(6) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
    ).type('83e949c42848{enter}');

    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '83e949c42848');

    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', '83e949c42848');

    //search seedPeer

    cy.get(
      ':nth-child(8) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
    ).type('f89cd2d9eb26{enter}');

    cy.get(':nth-child(8) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(4)')
      .should('be.visible')
      .and('contain', '65006');

    cy.get('#scheduler-button').click();

    cy.get(':nth-child(7) > .css-70qvj9 > .MuiButtonBase-root > .MuiBox-root').click();
  });
});
