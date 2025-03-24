import updateUser from '../../fixtures/users/update-user.json';
import _ from 'lodash';

describe('Profile', () => {
  beforeEach(() => {
    cy.signin();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/schedulers?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/clusters?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/seed-peers?page=1&per_page=10000000',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );

    cy.visit('/profile');
    cy.viewport(1440, 1080);
  });

  it('when data is loaded', () => {
    // Show user name.
    cy.get('#name-title').should('be.visible').and('have.text', 'root');

    // Show user description.
    cy.get('#description').should('be.visible').and('have.text', 'I am root');
    cy.get('#id').should('be.visible').and('have.text', 1);
    cy.get('#name').should('be.visible').and('have.text', 'root');
    cy.get('#email').should('be.visible').and('have.text', 'root@example.com');
    cy.get('#location').should('be.visible').and('have.text', 'Hangzhou');
    cy.get('#phone').should('be.visible').and('have.text', '+86 153 1234 5678');
    cy.get('#created_at').should('be.visible').and('have.text', '2023-11-06 06:09:04');

    // Check Update Personal Information form.
    cy.get('.MuiGrid-root > .MuiButtonBase-root').click();

    cy.get('#bio').should('have.value', 'I am root');
    cy.get('#phone').should('have.value', '+86 153 1234 5678');
    cy.get('#location').should('have.value', 'Hangzhou');
    cy.get('#email').should('have.value', 'root@example.com');
  });

  it('when no data is loaded', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: [],
        });
      },
    );

    // Show user name.
    cy.get('#name-title').should('be.visible').and('have.text', '-');

    // Show user description.
    cy.get('#description').should('be.visible').and('have.text', '-');
    cy.get('#id').should('be.visible').and('have.text', '-');
    cy.get('#name').should('be.visible').and('have.text', '-');
    cy.get('#email').should('be.visible').and('have.text', '-');
    cy.get('#location').should('be.visible').and('have.text', '-');
    cy.get('#phone').should('be.visible').and('have.text', '-');
    cy.get('#created_at').should('be.visible').and('have.text', '-');

    // Check Update Personal Information form.
    cy.get('.MuiGrid-root > .MuiButtonBase-root').click();

    cy.get('#bio').should('have.value', '');
    cy.get('#phone').should('have.value', '+86');
    cy.get('#location').should('have.value', '');
    cy.get('#email').should('have.value', '');
  });

  it('should handle API error response', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/users/1',
      },
      (req) => {
        req.reply({
          forceNetworkError: true,
        });
      },
    );

    // Show error message.
    cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

    // Check Update Personal Information form.
    cy.get('.MuiGrid-root > .MuiButtonBase-root').click();

    cy.get('#bio').should('have.value', '');
    cy.get('#phone').should('have.value', '+86');
    cy.get('#location').should('have.value', '');
    cy.get('#email').should('have.value', '');
  });

  describe('update personal information', () => {
    it('can update user', () => {
      cy.intercept({ method: 'PATCH', url: '/api/v1/users/1' }, (req) => {
        (req.body = ''),
          req.reply({
            statusCode: 200,
            body: [],
          });
      });

      // Click EDIT button.
      cy.get('.MuiGrid-root > .MuiButtonBase-root').click();

      // Update user name.
      cy.get('#bio').clear();
      cy.get('#bio').type('I am root, I will change the description');

      // Update user phone.
      cy.get('#phone').clear();
      cy.get('#phone').type('15123456789');

      // Update user location.
      cy.get('#location').clear();
      cy.get('#location').type('Shanghai');

      // Update user email.
      cy.get('#email').clear();
      cy.get('#email').type('root@gmail.com');

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/users/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: updateUser,
          });
        },
      );

      cy.get('#save').click();

      // Check if profile description is updated.
      cy.get('#description').should('be.visible').and('have.text', 'I am root, I will change the description');

      // Check if profile email is updated.
      cy.get('#email').should('be.visible').and('have.text', 'root@gmail.com');

      // Check if profile location is updated.
      cy.get('#location').should('be.visible').and('have.text', 'Shanghai');

      // Check if profile phone is updated.
      cy.get('#phone').should('be.visible').and('have.text', '+86 153 1234 5678');
    });

    it('click the `CANCEL button', () => {
      // Click EDIT button.
      cy.get('.MuiGrid-root > .MuiButtonBase-root').click();
      cy.get('#bio').clear();
      cy.get('#bio').type('I am root, I will change the description');

      // Update user email.
      cy.get('#email').clear();
      cy.get('#email').type('root@gmail.com');
      cy.get('#cancel').click();
      cy.get('#description').should('be.visible').and('have.text', 'I am root');

      // Check whether the navigation bar email has changed.
      cy.get('#email').should('be.visible').and('have.text', 'root@example.com');

      // Click EDIT button.
      cy.get('.MuiGrid-root > .MuiButtonBase-root').click();
      cy.get('#bio').should('have.value', 'I am root');
      cy.get('#email').should('have.value', 'root@example.com');
    });

    it('try to update user with guest user', () => {
      cy.visit('/signin');
      cy.guestSignin();

      cy.intercept({ method: 'PATCH', url: '/api/v1/users/2' }, (req) => {
        (req.body = ''),
          req.reply({
            statusCode: 401,
            body: { message: 'permission deny' },
          });
      });

      cy.visit('/profile');

      cy.get('.MuiGrid-root > .MuiButtonBase-root').click();

      // Update user phone.
      cy.get('#phone').clear();
      cy.get('#phone').type('18123456789');
      cy.get('#save').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'permission deny');
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiAlert-message').should('not.exist');
    });

    it('should handle API error response', () => {
      cy.intercept({ method: 'PATCH', url: '/api/v1/users/1' }, (req) => {
        (req.body = ''),
          req.reply({
            forceNetworkError: true,
          });
      });

      cy.get('.MuiGrid-root > .MuiButtonBase-root').click();

      // Update user phone.
      cy.get('#phone').clear();
      cy.get('#phone').type('18123456789');
      cy.get('#save').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    });

    it('cannot create user with invalid attributes', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const description = _.times(1001, () => _.sample(characters)).join('');
      const location = _.times(101, () => _.sample(characters)).join('');

      cy.get('.MuiGrid-root > .MuiButtonBase-root').click();

      // Should display message description the validation error.
      cy.get('#bio').clear();
      cy.get('#bio').type(description);

      // Show verification error message.
      cy.get('#bio-helper-text').should('be.visible').and('have.text', 'Fill in the characters, the length is 0-1000.');
      cy.get('#save').click();
      cy.get('.css-1033rfx > .MuiTypography-root').should('exist').and('have.text', 'Update Personal Information');

      cy.get('#bio').clear();
      cy.get('#bio').type('I am root');

      // Verification passed.
      cy.get('#bio-helper-text').should('not.exist');

      // Should display message phone the validation error.
      cy.get('#phone').clear();
      cy.get('#phone').type('+86 153 1234 123123');

      // Show verification error message.
      cy.get('#phone-helper-text').should('be.visible').and('have.text', 'Invalid phone number.');
      cy.get('#save').click();
      cy.get('.css-1033rfx > .MuiTypography-root').should('exist').and('have.text', 'Update Personal Information');

      cy.get('#phone').clear();
      cy.get('#phone').type('+86 151 2345 6789');

      // Verification passed.
      cy.get('#phone-helper-text').should('not.exist');

      // Should display message location the validation error.
      cy.get('#location').clear();
      cy.get('#location').type(location);

      // Show verification error message.
      cy.get('#location-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 0-100.');
      cy.get('#location').clear();
      cy.get('#location').type('Shanghai');
      cy.get('#location-helper-text').should('not.exist');

      // Should display message email the validation error.
      cy.get('#email').clear();
      cy.get('#email').type('root');

      // Show verification error message.
      cy.get('#email-helper-text').should('be.visible').and('have.text', 'Email is invalid or already taken.');
      cy.get('#email').clear();
      cy.get('#email').type('root@example.com');
      cy.get('#email-helper-text').should('not.exist');
    });
  });

  describe('change password', () => {
    it('can update password', () => {
      cy.intercept({ method: 'POST', url: '/api/v1/users/1/reset_password' }, (req) => {
        (req.body = { new_password: 'dragonfly2', old_password: 'dragonfly2' }),
          req.reply({
            statusCode: 200,
          });
      });
      cy.intercept({ method: 'POST', url: '/api/v1/users/signout' }, (req) => {
        (req.body = ''),
          req.reply({
            statusCode: 200,
          });
      });

      // Click change password tab.
      cy.get('#tab-password').click();

      cy.get('#oldPassword').type('dragonfly1');
      cy.get('#newPassword').type('dragonfly2');
      cy.get('#confirmNewPassword').type('dragonfly2');

      // Click cancel password button.
      cy.get('#cancel-change-password').click();

      // Input should be cleared.
      cy.get('#oldPassword').should('have.value', '');
      cy.get('#newPassword').should('have.value', '');
      cy.get('#confirmNewPassword').should('have.value', '');

      cy.get('#oldPassword').type('dragonfly1');
      cy.get('#newPassword').type('dragonfly2');
      cy.get('#confirmNewPassword').type('dragonfly2');

      // Click save button.
      cy.get('#change-password').click();

      // Then I see that the current page is the signin!
      cy.url().should('include', 'signin');
    });

    it('click the Profile tab', () => {
      // Click change password button.
      cy.get('#tab-password').click();
      cy.get('#change-password-title').should('be.visible').and('have.text', 'Change Password');
      cy.get('#oldPassword').type('dragonfly1');
      cy.get('#newPassword').type('dragonfly2');
      cy.get('#confirmNewPassword').type('dragonfly2');

      // Click cancel button.
      cy.get('#tab-profile').click();
      cy.get('#change-password-title').should('not.exist');

      cy.get('#tab-password').click();
      cy.get('#change-password-title').should('be.visible').and('have.text', 'Change Password');

      // Check if old password is empty.
      cy.get('#oldPassword').should('have.text', '');

      // Check if new password is empty.
      cy.get('#newPassword').should('have.text', '');

      // Check if confirm new password is empty.
      cy.get('#confirmNewPassword').should('have.text', '');
    });

    it('try to update user with guest user', () => {
      cy.visit('/signin');
      cy.guestSignin();

      cy.intercept({ method: 'POST', url: '/api/v1/users/2/reset_password' }, (req) => {
        (req.body = { new_password: 'dragonfly2', old_password: 'dragonfly2' }),
          req.reply({
            statusCode: 200,
          });
      });
      cy.intercept({ method: 'POST', url: '/api/v1/users/signout' }, (req) => {
        (req.body = ''),
          req.reply({
            statusCode: 200,
          });
      });

      cy.visit('/profile');

      // Click change password button.
      cy.get('#tab-password').click();
      cy.get('#oldPassword').type('dragonfly1');
      cy.get('#newPassword').type('dragonfly2');
      cy.get('#confirmNewPassword').type('dragonfly2');
      cy.get('#change-password').click();

      // Then I see that the current page is the signin!
      cy.url().should('include', 'signin');
    });

    it('should handle API error response', () => {
      cy.intercept({ method: 'POST', url: '/api/v1/users/1/reset_password' }, (req) => {
        (req.body = { new_password: 'dragonfly2', old_password: 'dragonfly2' }),
          req.reply({
            forceNetworkError: true,
          });
      });

      // Click change password button.
      cy.get('#tab-password').click();
      cy.get('#oldPassword').type('dragonfly1');
      cy.get('#newPassword').type('dragonfly2');
      cy.get('#confirmNewPassword').type('dragonfly2');
      cy.get('#change-password').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    });

    it('try to change password with invalid password', () => {
      cy.intercept({ method: 'POST', url: '/api/v1/users/1/reset_password' }, (req) => {
        (req.body = { new_password: 'dragonfly2', old_password: 'dragonfly2' }),
          req.reply({
            statusCode: 401,
            body: { message: 'Unauthorized' },
          });
      });

      // Click change password button.
      cy.get('#tab-password').click();
      cy.get('#oldPassword').type('dragonfly1');
      cy.get('#newPassword').type('dragonfly2');
      cy.get('#confirmNewPassword').type('dragonfly2');
      cy.get('#change-password').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    });

    it('cannot change password without required attributes', () => {
      // Click change password button.
      cy.get('#tab-password').click();
      cy.get('#change-password').click();

      // Show error message.
      cy.get('#oldPassword-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the maximum length is 16.');

      cy.get('#newPassword-helper-text')
        .should('be.visible')
        .and('have.text', 'At least 8-16 characters, with at least 1 lowercase letter and 1 number.');

      cy.get('#confirmNewPassword-helper-text')
        .should('be.visible')
        .and('have.text', 'Please enter the same password.');
    });

    it('cannot change password with invalid attributes', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const oldPassword = _.times(17, () => _.sample('abcdefghijklmnopqrstuvwxyz')).join('');
      const newPasswordLengthExceeds = _.times(17, () => _.sample(characters)).join('');
      const newPasswordLengthIsInsufficient = _.times(7, () => _.sample(characters)).join('');

      // Click change password button.
      cy.get('#tab-password').click();

      // Should display message old password the validation error.
      cy.get('#oldPassword').type(oldPassword);

      // Show verification error message.
      cy.get('#oldPassword-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the maximum length is 16.');
      cy.get('#oldPassword').clear();
      cy.get('#oldPassword').type('dragonfly');
      cy.get('#oldPassword-helper-text').should('not.exist');

      // Should display message new password the validation error.
      cy.get('#newPassword').type(newPasswordLengthExceeds);

      // Show verification error message.
      cy.get('#newPassword-helper-text')
        .should('be.visible')
        .and('have.text', 'At least 8-16 characters, with at least 1 lowercase letter and 1 number.');
      cy.get('#newPassword').clear();
      cy.get('#newPassword').type('dragonfly1');

      // Verification passed.
      cy.get('#newPassword-helper-text').should('not.exist');
      cy.get('#newPassword').clear();
      cy.get('#newPassword').type(newPasswordLengthIsInsufficient);

      // Show verification error message.
      cy.get('#newPassword-helper-text')
        .should('be.visible')
        .and('have.text', 'At least 8-16 characters, with at least 1 lowercase letter and 1 number.');
      cy.get('#newPassword').clear();
      cy.get('#newPassword').type('dragonfly1');

      // Verification passed.
      cy.get('#newPassword-helper-text').should('not.exist');

      // Should display message confirm new password the validation error.
      cy.get('#confirmNewPassword').type(newPasswordLengthIsInsufficient);

      // Show verification error message.
      cy.get('#confirmNewPassword-helper-text')
        .should('be.visible')
        .and('have.text', 'Please enter the same password.');
      cy.get('#confirmNewPassword').clear();
      cy.get('#confirmNewPassword').type('dragonfly1');

      // Verification passed.
      cy.get('#confirmNewPassword-helper-text').should('not.exist');
    });

    it('click the password hide butto', () => {
      cy.get('#tab-password').click();

      // Verify the display status of the content of the old password input box.
      cy.get('#oldPassword').type('dragonfly1');

      // Find the old password input box and verify that its type attribute is 'password'.
      cy.get('#oldPassword').should('have.attr', 'type', 'password');

      // Change the type attribute of the old password input box to 'text' so that the content is visible.
      cy.get(':nth-child(2) > .MuiFormControl-root > .MuiInputBase-root > .MuiButtonBase-root').click();

      // Verify the contents of the old password input box.
      cy.get('#oldPassword').should('have.attr', 'type', 'text').and('have.value', 'dragonfly1');

      // Verify the display status of the content of the new password input box.
      cy.get('#newPassword').type('dragonfly2');
      cy.get('#newPassword').should('have.attr', 'type', 'password');
      cy.get(':nth-child(3) > .MuiFormControl-root > .MuiInputBase-root > .MuiButtonBase-root').click();
      cy.get('#newPassword').should('have.attr', 'type', 'text').and('have.value', 'dragonfly2');

      // Verify the display status of the content of the confirm new password input box.
      cy.get('#confirmNewPassword').type('dragonfly2');
      cy.get('#confirmNewPassword').should('have.attr', 'type', 'password');
      cy.get(':nth-child(4) > .MuiFormControl-root > .MuiInputBase-root > .MuiButtonBase-root').click();
      cy.get('#confirmNewPassword').should('have.attr', 'type', 'text').and('have.value', 'dragonfly2');
    });
  });
});
