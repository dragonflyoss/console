import 'cypress-clipboard';

describe('The clusters Page', () => {
  it('cluster page', function () {
    cy.visit('/signin');
    cy.get('#account').type('root');
    cy.get('#password').type(`dragonfly{enter}`);

    cy.visit('/clusters');

    cy.get(
      ':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .clusters_creatTimeContainer__k6XfL > .MuiButtonBase-root',
    ).click();

    // cy.get('.show_container__osP4U > .MuiTypography-root').should('be.visible').and('contain', 'Cluster');

    cy.get(':nth-child(2) > :nth-child(7) > .MuiButtonBase-root').click();
    cy.get('#cancelDeleteScheduler').click();
    cy.get(':nth-child(2) > :nth-child(9) > .MuiButtonBase-root > [data-testid="DeleteIcon"]').click();
    cy.get('#cancelDeleteSeedPeer').click();

    cy.get(
      ':nth-child(6) > .show_searchContainer__6kD-7 > .MuiStack-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root',
    ).type('e443e8075a8a{enter}');

    cy.get(
      ':nth-child(6) > .css-8atqhb > .MuiTable-root > .MuiTableBody-root > .MuiTableRow-root > :nth-child(2) > .MuiTypography-root',
    )
      .should('be.visible')
      .and('contain', 'e443e8075a8a');

    cy.get('.MuiAutocomplete-endAdornment').click();

    cy.get('#scheduler-button').click();

    cy.get(':nth-child(7) > .css-70qvj9 > .MuiButtonBase-root > .MuiBox-root').click();
  });
});
