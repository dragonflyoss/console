describe('The clusters Page', () => {
  it('cluster page', function () {
    cy.visit('/signin');
    cy.get('#account').type('root');
    cy.get('#password').type(`dragonfly{enter}`);

    cy.visit('/clusters');
    cy.get('.MuiBreadcrumbs-li > .MuiTypography-root').should('be.visible').and('contain', 'Cluster');

    cy.get('.MuiInputBase-root').type('cluster-1{enter}');

    cy.get(':nth-child(1) > .MuiPaper-root > .clusters_clusterListContent__UwWjF > .MuiTypography-h6')
      .should('be.visible')
      .and('contain', 'cluster-1');
      
    cy.get('.clusters_creatTimeContainer__k6XfL > .MuiButtonBase-root').click();

    cy.get('.MuiBreadcrumbs-ol > :nth-child(1) > .MuiTypography-root').click();
    cy.get('.clusters_clusterTitle__5Lhnw > .MuiButtonBase-root').click();

    cy.get('#cancel').click();
    cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
    cy.get('.MuiPagination-ul > :nth-child(2) > .MuiButtonBase-root').click();

    //Search cluster
    cy.get('.MuiInputBase-root').type('cluster-1{enter}');
    cy.get('.MuiAutocomplete-endAdornment').click();
    cy.get('#submit-button').click();

    cy.get('.MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();
    cy.get('.MuiPagination-ul > :nth-child(1) > .MuiButtonBase-root').click();
  });
});
