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

  it('sets auth cookie when logging in via form submission', function () {
    // destructuring assignment of the this.currentUser object
    // const { username, password } = this.currentUser;
    function generateRandomString(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    }

    function generateRandomEmail() {
      const randomString = Math.random().toString(36).substring(2, 10);
      const domain = 'example.com';
      return `${randomString}@${domain}`;
    }

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

    // our auth cookie should be present
    // cy.getCookie('jwt').should(
    //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTgzMDY2MDYsImlkIjoxLCJvcmlnX2lhdCI6MTY5ODEzMzgwNn0.br3tl104dPNi5_kZy8i63lKb5dlozLII-u0IQatt-Bs',
    // );

    // UI should reflect this user being logged in
    // cy.get('h1').should('contain', 'jane.lane');
  });
});
