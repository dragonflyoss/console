import createTaskJob from '../../../fixtures/resource/task/create-task-job.json';
import task from '../../../fixtures/resource/task/task.json';
import pendingTask from '../../../fixtures/resource/task/pending-task.json';
import taskIDByTask from '../../../fixtures/resource/task/task-id-by-task.json';
import noTask from '../../../fixtures/resource/task/no-task.json';
import ImageManifest from '../../../fixtures/resource/task/image-manifest-url-task.json';
import _ from 'lodash';

describe('Clear', () => {
  beforeEach(() => {
    cy.signin();

    cy.visit('/resource/task/clear');
    cy.viewport(1440, 1080);
  });

  describe('when no data is loaded', () => {
    it('when search by url has no data to load', () => {
      cy.get('#no-task').should('not.exist');

      cy.get('#light').should('exist');
      cy.get('#no-task-image').should('not.exist');

      // Click the Toggle Light button.
      cy.get('#light').click();
      cy.get('#light').should('have.class', 'Mui-selected');

      // Check if it is switched to light mode.
      cy.get('#main').should('have.css', 'background-color', 'rgb(244, 246, 248)');

      cy.get('#no-task-image').should('exist');

      cy.get('#dark-no-task-image').should('not.exist');

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

    it('when search by image manifest url has no data to load', () => {
      cy.get('#no-task').should('not.exist');

      cy.get('#serach-image-manifest-url').click();

      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        async (req) => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          req.reply({
            statusCode: 200,
            body: {
              image: {
                layers: [
                  {
                    url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:c7c72808bf776cd122bdaf4630a4a35ea319603d6a3b6cbffddd4c7fd6d2d269',
                  },
                  {
                    url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:9986a736f7d3d24bb01b0a560fa0f19c4b57e56c646e1f998941529d28710e6b',
                  },
                ],
              },
              peers: [],
            },
          });
        },
      );

      cy.get('#image-manifest-url').type('https://example.com/path/to/file{enter}');

      // Shou You don't find any results!
      cy.get('#no-image-manifest-URL-task').should('exist').and('contain', `You don't find any results!`);
    });
  });

  describe('when data is loaded', () => {
    it('click the `CANCEL button', () => {
      cy.get('#url').click();

      // Add tag input.
      cy.get('#tag').should('exist');

      // Add url.
      cy.get('#url').type('https://example.com/path/to/file');

      // Add piece length.
      cy.get('#pieceLength').type('4');

      cy.get('#cancelSearchByURL').click();

      cy.get('#url').click();

      cy.get('#tag').should('have.value', '');
      cy.get('#url').should('have.value', '');
      cy.get('#pieceLength').should('have.value', '');
    });

    it('can search by url', () => {
      let interceptCount = 0;

      cy.get('#url').click();

      // Add url.
      cy.get('#url').type('https://example.com/path/to/file');

      // Add piece length.
      cy.get('#pieceLength').type('4');

      // Add tag input.
      cy.get('#tag').type('tag');

      // Add tag input.
      cy.get('#application').type('application');

      // Add filtered query params input.
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

      cy.wait(59000);

      // Executed every 3 seconds, it should be executed 2 times after 6 seconds.
      cy.get('@cache').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(1, 0);
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

    it('can search by content for calculating task id', () => {
      cy.get('#serach-content-for-calculating-task-id').click();

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

      cy.get('#content-for-calculating-task-id').type('3870122509{enter}');
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
    });

    it('can search by image manifest url', () => {
      cy.get('#no-task').should('not.exist');

      cy.get('#serach-image-manifest-url').click();

      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        async (req) => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          req.reply({
            statusCode: 200,
            body: ImageManifest,
          });
        },
      );

      cy.get('#image-manifest-url').type('https://example.com/path/to/file{enter}');

      // Show is loading.
      cy.get('#isLoading').should('exist');

      // Display cache information.
      cy.get('#blobs').should('have.text', 'Total: 5');
      cy.get('#scheduler-id-0').should('exist', 'ID :  1');
      cy.get('#isLoading').should('not.exist');
      cy.get('#scheduler-1-hostname-0').should('have.text', 'kind-worker1');
      cy.get('#scheduler-1-ip-0').should('have.text', '172.18.0.4');
      cy.get('#scheduler-1-proportion-0').should('contain', '60.00%');

      // Should display URL.
      cy.get('#scheduler-1-url-0').click();
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

      cy.wait(59000);

      // Executed every 1 minute and once after 1 minute.
      cy.get('@cache').then(() => {
        expect(interceptCount).to.be.greaterThan(0);
        expect(interceptCount).to.be.closeTo(1, 0);
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

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');
    });

    it('delete cache API error response', () => {
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
            statusCode: 401,
            body: { message: 'Unauthorized' },
          });
        },
      );

      cy.get('.MuiInputBase-root > #task-id').type(
        'fe0c4a611d35e338efd342c346a2c671c358c5187c483a5fc7cd66c6685ce916{enter}',
      );

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Unauthorized');

      // Close error message.
      cy.get('.MuiAlert-action > .MuiButtonBase-root').click();
      cy.get('.MuiAlert-message').should('not.exist');
    });

    it('search by image manifest url API error response', () => {
      cy.get('#no-task').should('not.exist');
      cy.get('#serach-image-manifest-url').click();
      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        async (req) => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          req.reply({
            forceNetworkError: true,
          });
        },
      );
      cy.get('#image-manifest-url').type('https://example.com/path/to/file{enter}');

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    });
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
      cy.url().should('include', '/resource/task/executions/1');
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
      cy.url().should('include', '/resource/task/executions/1');
    });

    it('Can delete cache searched by content for calculating task id', () => {
      cy.get('#serach-content-for-calculating-task-id').click();

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

      cy.get('#content-for-calculating-task-id').type('3870122509{enter}');

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
      cy.url().should('include', '/resource/task/executions/1');
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

      cy.get('#scheduler-id-1').should('contain', '2');

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
      cy.url().should('include', '/resource/task/clear');

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

      cy.get('#scheduler-id-1').should('contain', '2');

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
      cy.url().should('include', '/resource/task/clear');

      // Show error message.
      cy.get('.MuiAlert-message').should('be.visible').and('contain', 'Failed to fetch');
    });
  });

  describe('cannot search cache with invalid attributes', () => {
    it('try to verify url', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const url = _.times(1001, () => _.sample(characters)).join('');
      const tag = _.times(401, () => _.sample(characters)).join('');
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
      cy.get('#tag').type(tag);

      cy.get('#tag-helper-text').should('be.visible').and('have.text', 'Fill in the characters, the length is 0-400.');

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
      cy.get('#application').type(tag);

      cy.get('#application-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 0-400.');

      cy.get('#application').clear();
      cy.get('#searchByURL').click();

      cy.get('#serach-task-id').click();

      cy.get('#task-id').type(`${tag}{enter}`);
      cy.get('#task-id-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 0-400.');
    });

    it('try to verify task id', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const taskID = _.times(401, () => _.sample(characters)).join('');

      cy.get('#serach-task-id').click();

      cy.get('#task-id').type(`${taskID}{enter}`);
      cy.get('#task-id-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 0-400.');
    });

    it('try to verify content for calculating task id', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const contentForCalculatingTaskID = _.times(401, () => _.sample(characters)).join('');

      cy.get('#serach-content-for-calculating-task-id').click();

      cy.get('#content-for-calculating-task-id').type(`${contentForCalculatingTaskID}{enter}`);

      cy.get('#content-for-calculating-task-id-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 0-400.');
    });

    it('try to verify image manifest url', () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const url = _.times(401, () => _.sample(characters)).join('');

      cy.get('#serach-image-manifest-url').click();

      cy.get('#image-manifest-url').click();

      // Should display message url the validation error.
      cy.get('#image-manifest-url').type(`https://docs${url}`);

      cy.get('#image-manifest-url-helper-text')
        .should('be.visible')
        .and('have.text', 'Fill in the characters, the length is 1-400.');

      cy.get('#image-manifest-url').clear();
      cy.get('#image-manifest-url').type('https://docs');

      cy.get('#image-manifest-url-helper-text').should('not.exist');
    });
  });
});
