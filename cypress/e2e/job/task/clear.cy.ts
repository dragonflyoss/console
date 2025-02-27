import createTaskJob from '../../../fixtures/job/task/create-task-job.json';
import task from '../../../fixtures/job/task/task.json';
import pendingTask from '../../../fixtures/job/task/pending-task.json';
import taskIDByTask from '../../../fixtures/job/task/task-id-by-task.json';
import noTask from '../../../fixtures/job/task/no-task.json';
import _ from 'lodash';

describe('Clear', () => {
  beforeEach(() => {
    cy.signin();

    cy.visit('/jobs/task/clear');
    cy.viewport(1440, 1080);
  });

  it('when no data is loaded', () => {
    cy.get('#no-task').should('not.exist');

    cy.get('#light').should('exist');
    cy.get('#no-task-image').should('exist');

    cy.get('#mode').click();

    // Dark mode should show a different no-task-image.
    cy.get('#light').should('not.exist');
    cy.get('#no-task-image').should('not.exist');

    cy.get('#dark').should('exist');
    cy.get('#dark-no-task-image').should('exist');

    cy.intercept(
      {
        method: 'post',
        url: '/api/v1/jobs',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: createTaskJob,
        });
      },
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/jobs/1',
      },
      (req) => {
        req.reply({
          statusCode: 200,
          body: noTask,
        });
      },
    );

    cy.get('#url').click();

    // Add url.
    cy.get('#url').type('https://example.com/path/to/file');

    cy.get('#searchByURL').click();

    cy.get('#no-task').should('exist');
  });

  describe('when data is loaded', () => {
    it('click the `CANCEL button', () => {
      cy.get('#url').click();

      // Show tag input.
      cy.get('#tag').should('exist');
      cy.get('#cancelSearchByURL').click();

      // not show tag input.
      cy.get('#tag').should('not.exist');
    });

    it('can search by url', () => {
      let interceptCount = 0;

      cy.get('#url').click();

      // Add url.
      cy.get('#url').type('https://example.com/path/to/file');

      // Show tag input.
      cy.get('#tag').type('tag');

      // Show tag input.
      cy.get('#application').type('application');

      // Show tag input.
      cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('filteredQueryParams{enter}');
      cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('X-Amz-Algorithm{enter}');

      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: createTaskJob,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: pendingTask,
          });
          interceptCount++;
        },
      ).as('cache');

      cy.get('#searchByURL').click();

      cy.get('#isLoading').should('be.exist');

      cy.wait(120000);

      // Executed every 3 seconds, it should be executed 2 times after 6 seconds.
      cy.get('@cache').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(2, 1);
      });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: task,
          });
        },
      );

      cy.wait(60000);

      cy.get('#url').click();

      // Show url.
      cy.get('#url').should('have.value', 'https://example.com/path/to/file');
      cy.get('#tag').should('have.value', 'tag');
      cy.get('#application').should('have.value', 'application');
      cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root')
        .should('contain', 'filteredQueryParams')
        .and('contain', 'X-Amz-Algorithm');
    });

    it('can search by task id', () => {
      cy.get('#serach-task-id').click();

      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: createTaskJob,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: task,
          });
        },
      );

      cy.get('.MuiInputBase-root > #task-id').type(
        'fe0c4a611d35e338efd342c346a2c671c358c5187c483a5fc7cd66c6685ce916{enter}',
      );
      cy.get('#cache').children().should('have.length', 3);

      // Go to next page.
      cy.get('#pagination-0 > .MuiPagination-ul > :nth-child(4) > .MuiButtonBase-root').click();

      // Check the current page number.
      cy.get('#pagination-0 > .MuiPagination-ul .Mui-selected').should('have.text', '2');
      cy.get('#cache-0 > :nth-child(1) > .css-tzff0k > .MuiBox-root > .MuiTypography-root').should(
        'have.text',
        'dragonfly-seed-client-5',
      );
      cy.get('#cache-0').children().should('have.length', 2);

      // Pagination should not be displayed.
      cy.get('#pagination-1').should('exist');

      // Pagination should be shown.
      cy.get('#pagination-2').should('not.exist');
      cy.get('#cache-1 > :nth-child(1)')
        .should('contain', 'kind-worker3')
        .and('contain', '172.18.0.2-kind-worker3-3de3df03-a97d-4784-b608-f9b04b3085f3')
        .and('contain', 'Normal');
      cy.get('#pagination-1 > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root').click();
      cy.get('#cache-1').children().should('have.length', 1);

      // Go back to the last page.
      cy.get('#pagination-0 > .MuiPagination-ul > :nth-child(1) > .MuiButtonBase-root').click();

      // Check the current data list.
      cy.get('#cache-0').children().should('have.length', 5);
      cy.get('.MuiInputBase-root > .MuiButtonBase-root').click();
      cy.get('.MuiInputBase-root > #task-id').should('not.have.value');
      cy.get('.MuiInputBase-root > #task-id').type('{enter}');
    });
  });

  describe('should handle API error response', () => {
    it('create job API error', () => {
      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      // Search by URL.
      cy.get('#url').click();
      cy.get('#url').type('https://example.com/path/to/file');

      cy.get('#searchByURL').click();

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiAlert-message').should('not.exist');

      // Search by task id.
      cy.get('#serach-task-id').click();

      cy.get('.MuiInputBase-root > #task-id').type(
        'fe0c4a611d35e338efd342c346a2c671c358c5187c483a5fc7cd66c6685ce916{enter}',
      );

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiAlert-message').should('not.exist');
    });

    it('when the status is pending, delete cache API error response', () => {
      let interceptCount = 0;

      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: createTaskJob,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: pendingTask,
          });
          interceptCount++;
        },
      ).as('cache');

      // Search by URL.
      cy.get('#url').click();
      cy.get('#url').type('https://example.com/path/to/file');

      cy.get('#searchByURL').click();

      cy.get('#isLoading').should('be.exist');

      cy.wait(120000);

      // Executed every 1 minute and once after 1 minute.
      cy.get('@cache').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(2, 1);
      });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/1',
        },
        (req) => {
          req.reply({
            statusCode: 401,
            body: { message: 'Unauthorized' },
          });
        },
      );

      // Preheat API error response after three seconds.
      cy.wait(60000);

      // Show error message.
      cy.get('.MuiSnackbar-root > .MuiPaper-root').should('be.visible').and('contain', 'Unauthorized');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiSnackbar-root > .MuiPaper-root').should('not.exist');
    });

    // it('Delete cache API error response', () => {
    //   // Search by task id.
    //   cy.get('#serach-task-id').click();
    //   cy.intercept(
    //     {
    //       method: 'post',
    //       url: '/api/v1/jobs',
    //     },
    //     (req) => {
    //       req.reply({
    //         statusCode: 200,
    //         body: createTaskJob,
    //       });
    //     },
    //   );
    //   cy.intercept(
    //     {
    //       method: 'GET',
    //       url: '/api/v1/jobs/1',
    //     },
    //     (req) => {
    //       req.reply({
    //         statusCode: 401,
    //         body: { message: 'Unauthorized' },
    //       });
    //     },
    //   );

    //   cy.get('.MuiInputBase-root > #task-id').type(
    //     'fe0c4a611d35e338efd342c346a2c671c358c5187c483a5fc7cd66c6685ce916{enter}',
    //   );

    //   // Show error message.
    //   cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');

    //   // Close error message.
    //   cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
    //   cy.get('.MuiAlert-message').should('not.exist');
    // });
  });

  describe('delete', () => {
    it('can delete cache searched by URL', () => {
      cy.get('#url').click();

      // Add url.
      cy.get('#url').type('https://example.com/path/to/file');

      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: createTaskJob,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: task,
          });
        },
      );

      cy.get('#searchByURL').click();

      cy.get(':nth-child(2) > .MuiPaper-root > .css-whqzh4 > .MuiButtonBase-root').click();

      cy.get('#deletCache').type('e');

      // Should display message delete cache the validation error.
      cy.get('#deletCache-helper-text').should('have.text', 'Please enter "DELETE"');

      cy.get('#deletCache').clear();

      cy.get('#deletCache').type('DELETE');

      cy.get('#deletCache-helper-text').should('not.exist');

      // Click delete cache button.
      cy.get('#deleteTask').click();

      // Then I see that the current page is the executions id.
      cy.url().should('include', '/jobs/task/executions/1');
    });

    it('Can delete cache searched by task id', () => {
      // Search by task id.
      cy.get('#serach-task-id').click();

      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: createTaskJob,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: taskIDByTask,
          });
        },
      );

      cy.get('.MuiInputBase-root > #task-id').type(
        'fe0c4a611d35e338efd342c346a2c671c358c5187c483a5fc7cd66c6685ce916{enter}',
      );

      cy.get(':nth-child(2) > .MuiPaper-root > .css-whqzh4 > .MuiButtonBase-root').click();

      cy.get('#deletCache').type('e');

      // Should display message delete cache the validation error.
      cy.get('#deletCache-helper-text').should('have.text', 'Please enter "DELETE"');

      cy.get('#deletCache').clear();

      cy.get('#deletCache').type('DELETE');

      cy.get('#deletCache-helper-text').should('not.exist');

      // Click delete cache button.
      cy.get('#deleteTask').click();

      // Then I see that the current page is the executions id.
      cy.url().should('include', '/jobs/task/executions/1');
    });

    it('search by task id API error response should be handled', () => {
      cy.get('#url').click();
      // Add url.
      cy.get('#url').type('https://example.com/path/to/file');

      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: createTaskJob,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: task,
          });
        },
      );

      cy.get('#searchByURL').click();

      cy.get(':nth-child(2) > .MuiPaper-root > .css-whqzh4 > .css-70qvj9 > .css-1y3f2j > #schedulerTotal').should(
        'contain',
        '2',
      );

      cy.get(':nth-child(2) > .MuiPaper-root > .css-whqzh4 > .MuiButtonBase-root').click();

      cy.get('#deletCache').type('e');

      // Should display message delete cache the validation error.
      cy.get('#deletCache-helper-text').should('have.text', 'Please enter "DELETE"');

      cy.get('#deletCache').clear();

      cy.get('#deletCache').type('DELETE');

      cy.get('#deletCache-helper-text').should('not.exist');

      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      // Click delete cache button.
      cy.get('#deleteTask').click();

      // Then I see that the current page is the clear.
      cy.url().should('include', '/jobs/task/clear');

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    });

    it('search by URL API error response should be handled', () => {
      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: createTaskJob,
          });
        },
      );
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v1/jobs/1',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: task,
          });
        },
      );

      // Search by task id.
      cy.get('#serach-task-id').click();

      cy.get('.MuiInputBase-root > #task-id').type(
        'fe0c4a611d35e338efd342c346a2c671c358c5187c483a5fc7cd66c6685ce916{enter}',
      );

      cy.get(':nth-child(2) > .MuiPaper-root > .css-whqzh4 > .css-70qvj9 > .css-1y3f2j > #schedulerTotal').should(
        'contain',
        '2',
      );

      cy.get(':nth-child(2) > .MuiPaper-root > .css-whqzh4 > .MuiButtonBase-root').click();

      cy.get('#deletCache').type('e');

      // Should display message delete cache the validation error.
      cy.get('#deletCache-helper-text').should('have.text', 'Please enter "DELETE"');

      cy.get('#deletCache').clear();

      cy.get('#deletCache').type('DELETE');

      cy.get('#deletCache-helper-text').should('not.exist');

      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.reply({
            forceNetworkError: true,
          });
        },
      );

      // Click delete cache button.
      cy.get('#deleteTask').click();

      // Then I see that the current page is the clear.
      cy.url().should('include', '/jobs/task/clear');

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    });
  });

  describe('cannot search cache with invalid attributes', () => {
    it('try to verify url', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const url = _.times(1001, () => _.sample(characters)).join('');
      const filter = _.times(101, () => _.sample(characters)).join('');

      cy.get('#url').click();

      // Should display message url the validation error.
      cy.get('#url').type(`https://docs${url}`);

      cy.get('#url-helper-text').should('be.visible').and('have.text', 'Fill in the characters, the length is 0-1000.');

      cy.get('#searchByURL').click();
      cy.get('#url').clear();
      cy.get('#url').type('https://docs');

      cy.get('#url-helper-text').should('not.exist');

      // Should display message tag the validation error.
      cy.get('#tag').type(url);

      cy.get('#tag-helper-text').should('be.visible').and('have.text', 'Fill in the characters, the length is 0-1000.');

      cy.get('#tag').clear();

      // Should display message filter the validation error.
      cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('filter');

      cy.get('#searchByURL').click();

      cy.get('#filteredQueryParams-helper-text')
        .should('be.visible')
        .and('have.text', 'Please press ENTER to end the filter creation');

      cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').clear();

      cy.get('#filteredQueryParams-helper-text').should('not.exist');

      cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('filter{enter}');

      cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(filter);

      // Show verification error message.
      cy.get('#filteredQueryParams-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 0-100.');

      cy.get('#searchByURL').click();

      // Should display message application the validation error.
      cy.get('#application').type(url);

      cy.get('#application-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 0-1000.');

      cy.get('#application').clear();
      cy.get('#searchByURL').click();

      cy.get('#serach-task-id').click();

      cy.get('#task-id').type(`${url}{enter}`);
      cy.get('#task-id-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 0-1000.');
    });

    it('try to verify task id', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const taskID = _.times(1001, () => _.sample(characters)).join('');

      cy.get('#serach-task-id').click();

      cy.get('#task-id').type(`${taskID}{enter}`);
      cy.get('#task-id-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 0-1000.');
    });
  });
});
