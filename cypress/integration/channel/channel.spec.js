context('Channel', () => {
  before(() => {
    if (cy.getCookie('minds_sess') === null) {
      cy.login(true);
      cy.location('pathname', { timeout: 30000 })
        .should('eq', `/newsfeed/subscriptions`);
    }
    cy.visit('/minds');
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('minds_sess', 'mwa', 'XSRF-TOKEN');
  })

  it('should change channel mode to public', () => {
    cy.get('.m-channel-mode-selector--dropdown')
      .click()
      .find(".m-dropdown--list--item:contains('Public')")
      .should('be.visible')
      .click();

    cy.get('.m-channel-mode-selector--dropdown')
      .find('label').contains('Public');
  });

  it('should change channel mode to moderated', () => {
    cy.get('.m-channel-mode-selector--dropdown')
      .click()
      .find(".m-dropdown--list--item:contains('Moderated')")
      .should('be.visible')
      .click();

    cy.get('.m-channel-mode-selector--dropdown')
      .find('label').contains('Moderated');
  });

  it('should change channel mode to closed', () => {
    cy.get('.m-channel-mode-selector--dropdown')
      .click()
      .find(".m-dropdown--list--item:contains('Closed')")
      .should('be.visible')
      .click();

    cy.get('.m-channel-mode-selector--dropdown')
      .find('label').contains('Closed');
  });

});
