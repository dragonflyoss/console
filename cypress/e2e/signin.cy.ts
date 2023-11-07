describe('The Signin Page', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v1/users/signin', (req) => {
      const { name, password } = req.body;

      if (name === 'root' && password === 'dragonfly') {
        req.reply({
          statusCode: 200,
          body: {
            expire: '2023-11-04T10:57:15+09:00',
            token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTkwNjY2MzUsImlkIjoxLCJvcmlnX2lhdCI6MTY5ODg5MzgzNX0.KH-3-Pu8BqVW1u5JDyiWooR1a_acyKFFE4BRbLB0bAg',
          },
        });
      } else {
        req.reply({
          statusCode: 401,
          body: {
            message: 'Unauthorized',
          },
        });
      }
    });
  });

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
  });
});
