describe('The Signin Page', () => {
  it('signin with wrong credentials', () => {
    cy.visit('/signin');
    cy.get('#account').type('root');
    cy.get('#password').type('rooot1');
    cy.get('form').submit();

    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
  });
  it('sign in suceesfully', function () {
    cy.visit('/signin');

    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();

    cy.url().should('include', '/signup');

    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();

    cy.url().should('include', '/signin');

    cy.get('#account').type('root');
    cy.get('#password').type(`dragonfly`);
    cy.get('.MuiInputBase-root > .MuiButtonBase-root').click();
    cy.get('form').submit();
    cy.url().should('include', '/clusters');
    cy.getCookie('jwt').should('exist');
  });
});
