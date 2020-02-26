context('Composer Bottom Bar', () => {
  before(() => {
    cy.getCookie('minds_sess').then(sessionCookie => {
      if (!sessionCookie) {
        return cy.login(true);
      }
    });
  });

  // Components

  const composerToolbar = 'm-composer__modal > m-composer__base .m-composer__toolbar';

  // Buttons

  const uploadButton = `${composerToolbar} m-file-upload[data-cy="upload-button"]`;

  const deleteAttachmentButton = `${composerToolbar} a[data-cy="delete-attachment-button"]`;

  const nsfwButton = `${composerToolbar} a[data-cy="nsfw-button"]`;

  const monetizeButton = `${composerToolbar} a[data-cy="monetize-button"]`;

  const tagsButton = `${composerToolbar} a[data-cy="tags-button"]`;

  const postButton = `${composerToolbar} a[data-cy="post-button"]`;

  //

  beforeEach(() => {
    cy.preserveCookies();
  });

  const showComposer = () => {
    const composerTrigger = 'm-composer .m-composer__trigger';

    cy.visit('/newsfeed/subscriptions');

    cy.get(composerTrigger)
      .should('be.visible')
      .click();

    cy.get(composerToolbar)
      .should('be.visible');
  };

  context('Desktop', () => {
    before(() => {
      showComposer();
    });

    beforeEach(() => {
      cy.viewport(1366, 800);
    });

    it('should show upload button', () => {
      cy.get(uploadButton)
        .should('be.visible');

      // TODO: Check we're showing the label, input[type=file] overlay causes a false negative
    });

    it('should show NSFW button and its label', () => {
      cy.get(nsfwButton)
        .should('be.visible');

      cy.get(`${nsfwButton} .m-composerToolbarItem__label`)
        .should('be.visible');
    });

    it('should show monetize button and its label', () => {
      cy.get(monetizeButton)
        .should('be.visible');

      cy.get(`${monetizeButton} .m-composerToolbarItem__label`)
        .should('be.visible');
    });

    it('should show tags button and its label', () => {
      cy.get(tagsButton)
        .should('be.visible');

      cy.get(`${tagsButton} .m-composerToolbarItem__label`)
        .should('be.visible');
    });
  });

  context('Mobile', () => {
    before(() => {
      showComposer();
    });

    beforeEach(() => {
      cy.viewport(360, 760);
    });

    it('should show upload button', () => {
      cy.get(uploadButton)
        .should('be.visible');

      // TODO: Check we're not showing the label, input[type=file] overlay causes a false positive
    });

    it('should show NSFW button without its label', () => {
      cy.get(nsfwButton)
        .should('be.visible');

      cy.get(`${nsfwButton} .m-composerToolbarItem__label`)
        .should('not.be.visible');
    });

    it('should show monetize button without its label', () => {
      cy.get(monetizeButton)
        .should('be.visible');

      cy.get(`${monetizeButton} .m-composerToolbarItem__label`)
        .should('not.be.visible');
    });

    it('should show tags button without its label', () => {
      cy.get(tagsButton)
        .should('be.visible');

      cy.get(`${tagsButton} .m-composerToolbarItem__label`)
        .should('not.be.visible');
    });
  })
});
