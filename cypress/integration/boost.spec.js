context('Boost', () => {
  const duplicateError = "There's already an ongoing boost for this entity";
  const postContent = "Test boost, please reject..." + Math.random().toString(36).substring(8);

  
  beforeEach(() => {
    cy.login(true);
    cy.wait(5000);

    cy.get('.m-v2-topbar__Top minds-avatar div')
      .click();
  
    cy.scrollTo('top');
    cy.wait(2000);
  });

  it('should redirect a user to buy tokens when clicked', () => {    
    openTopModal();
    cy.wait(5000);

    cy.get('.m-boost--creator-section-row .m-boost--creator-section-payment m-boost--creator-payment-methods > ul > li:nth-child(3) > i')
      .click();

    cy.wait(1000);

    cy.location('pathname', { timeout: 30000 })
      .should('eq', `/token`);

  });

  it('should allow a user to make an offchain boost for 5000 tokens', () => {    
    cy.post(postContent);
    cy.wait(2000);

    openTopModal();
  
    cy.get('.m-boost--creator-section-amount input')
      .type(5000);

    cy.get('m-overlay-modal > div.m-overlay-modal > m-boost--creator button')
      .click();

    cy.wait(5000);
    
    cy.get('.m-overlay-modal')
      .should('not.be.visible')
  });

  it('should error if the boost is a duplicate', () => {
    openTopModal();
       
    cy.wait(5000);
  
    cy.get('.m-boost--creator-section-amount input')
      .type(5000);

    cy.wait(1000);

    cy.get('m-overlay-modal > div.m-overlay-modal > m-boost--creator button')
      .click();
    
    cy.wait(3000);
    
    cy.get('m-boost--creator > div > section > div > div > span')
      .contains(duplicateError);

  });

  it('should display an error if boost offer receiver has not signed up for rewards', () => {
    openTopModal();

    cy.get('.m-boost--creator-section.m-boost--creator-section-type > ul > li:nth-child(2) > h4')
      .click();

    cy.wait(1000);
    
    cy.get('m-boost--creator-p2p-search .m-boost--creator-wide-input input')
      .type('minds');
    
    cy.get('.m-boost--creator-autocomplete--results .m-boost--creator-autocomplete--result-content > span')
      .click();

  });

  function openTopModal() {
    cy.get('#boost-actions')
      .first()
      .click();
        
    cy.wait(5000);
  }

})
