describe('The Signin Page', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v1/users/signup', (req) => {
      const { name, password, email } = req.body;

      if (name === 'root-1' && password === 'dragonfly1' && email === 'root@d7y.com') {
        req.reply({
          statusCode: 200,
          body: {
            id: 31,
            created_at: '2023-11-03T02:27:10Z',
            updated_at: '2023-11-03T02:27:10Z',
            is_del: 0,
            email: 'root@d7y.com',
            name: 'root-1',
            avatar: '',
            phone: '',
            state: 'enable',
            location: '',
            bio: '',
            configs: null,
          },
        });
      } else {
        req.reply({
          statusCode: 401,
          body: {
            message: 'Conflict',
          },
        });
      }
    });
  });

  it('signup', function () {

    cy.visit('/signup');
    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();
    cy.url().should('include', '/signin');
    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();
    cy.url().should('include', '/signup');

    cy.get('#account').type('root-1');

    cy.get('#email').type('root@d7y.com');
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly1{enter}`);

    cy.url().should('include', '/signin');
  });
});
