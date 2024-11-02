import createGetTaskJob from '../../../fixtures/job/task/create-get-task-job.json';
import cache from '../../../fixtures/job/task/cache.json';

describe('Clear', () => {
  beforeEach(() => {
    cy.signin();

    cy.visit('/jobs/task/clear');
    cy.viewport(1440, 1080);
  });

  describe('when data is loaded', () => {
    // it('click the `CANCEL button', () => {
    //   cy.get('#url').click();

    //   // Show tag input.
    //   cy.get('#tag').should('exist');

    //   cy.get('#cancelSearchByURL').click();

    //   // not show tag input.
    //   cy.get('#tag').should('not.exist');
    // });

    it('can search by url', () => {
      cy.get('#url').click();

      // Add url.
      cy.get('#url').type('https://example.com/path/to/file');
      // Show tag input.
      cy.get('#tag').type('tag');

      // Show tag input.
      cy.get('#application').type('application');

      // Show tag input.
      cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('filteredQueryParams{enter}');
      cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('hz{enter}');

      cy.intercept(
        {
          method: 'post',
          url: '/api/v1/jobs',
        },
        (req) => {
          req.reply({
            statusCode: 200,
            body: createGetTaskJob,
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
            body: cache,
          });
        },
      );
      cy.get('#searchByURL').click();
    });
  });
});
