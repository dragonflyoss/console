describe('link', () => {
  it('should link to the home page', () => {
    cy.visit('http://localhost:3000/')

    cy.get('a[href*="home"]').click()

    cy.url().should('include', 'home')

    cy.get('h3').contains("home page")
      
  })
})
export {}
