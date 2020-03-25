/**
 * @author Ben Hayward
 * @desc Spec tests for blocking users.
 */
import generateRandomId from '../../support/utilities';

context('Blocked', () => {

  const testUsername = generateRandomId(); 
  const testPassword = generateRandomId()+'X#';

  const userDropdown = '[data-cy=data-minds-user-dropdown]';
  const blockButton = '[data-cy=data-minds-user-dropdown-block]';

  before(() => {
    cy.newUser(testUsername, testPassword);
    cy.logout();
    cy.login();
  });

  beforeEach(() => {
    cy.preserveCookies();
    cy.server();
    cy.route('PUT', '**/api/v1/block/**').as('putBlock');
  });

  it('should show nothing more to load when no users', () => {
    cy.visit('/settings/blocked-channels');
    cy.contains("Nothing more to load");
  });

  it('should let a user block another user', () => {
    cy.visit(`/${testUsername}`);

    cy.get(userDropdown).click();
    
    cy.get(blockButton)
      .click()
      .wait('@putBlock').then(xhr => {
        expect(xhr.status).to.equal(200);
      });
  });

  it('should allow a user to remove the user from their block list', () => {
    cy.visit('/settings/blocked-channels');    
    cy.contains(testUsername);
  });

});
