context('Composer Modal', () => {
  before(() => {
    cy.getCookie('minds_sess').then(sessionCookie => {
      if (!sessionCookie) {
        return cy.login(true);
      }
    });
  });

  beforeEach(() => {
    cy.preserveCookies();
  });

  const composerTrigger = 'm-composer .m-composer__trigger';

  const modalBaseComposer = 'm-composer__modal > m-composer__base';

  it('should open a composer modal popup in newsfeed', () => {
    cy.visit('/newsfeed/subscriptions');

    cy.get(composerTrigger)
      .should('be.visible')
      .click();

    cy.get(modalBaseComposer)
      .should('be.visible')
  });

  it('should open a composer modal popup in discovery', () => {
    cy.visit('/newsfeed/global/top');

    cy.get(composerTrigger)
      .should('be.visible')
      .click();

    cy.get(modalBaseComposer)
      .should('be.visible')
  });

  it('should open a composer modal popup in own channel', () => {
    cy.visit(`/${Cypress.env().username}`);

    cy.get(composerTrigger)
      .should('be.visible')
      .click();

    cy.get(modalBaseComposer)
      .should('be.visible')
  });

  it.skip('should open a composer modal popup in a group', () => {
    cy.visit(`/${Cypress.env().group_id}`);

    cy.get(composerTrigger)
      .should('be.visible')
      .click();

    cy.get(modalBaseComposer)
      .should('be.visible')
  });
});
