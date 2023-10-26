describe('The Signin Page', () => {
  //   beforeEach(() => {
  //     // reset and seed the database prior to every test
  //     // cy.exec('npm run db:reset && npm run db:seed');

  //     // seed a user in the DB that we can control from our tests
  //     // assuming it generates a random password for us
  //     cy.request('POST', '/signin', { naeme: 'root', password: 'dragonfly' }).its('body').as('currentUser');
  //   });

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
    const randomUsername = generateRandomString(6);

    function generateRandomEmail() {
      const randomString = Math.random().toString(36).substring(2, 10);
      const domain = 'example.com';
      return `${randomString}@${domain}`;
    }

    const randomEmail = generateRandomEmail();

    cy.visit('/signup');

    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();
    cy.url().should('include', '/signin');
    cy.get('.MuiTypography-inherit > .MuiTypography-root').click();
    cy.url().should('include', '/signup');
    cy.get('#account').type(randomUsername);

    cy.get('#email').type(randomEmail);
    cy.get('#password').type('dragonfly1');
    cy.get('#confirmPassword').type(`dragonfly1{enter}`);
    // we should be redirected to /dashboard
    cy.url().should('include', '/signin');

    // our auth cookie should be present
    // cy.getCookie('jwt').should(
    //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTgzMDY2MDYsImlkIjoxLCJvcmlnX2lhdCI6MTY5ODEzMzgwNn0.br3tl104dPNi5_kZy8i63lKb5dlozLII-u0IQatt-Bs',
    // );

    // UI should reflect this user being logged in
    // cy.get('h1').should('contain', 'jane.lane');
  });
});
