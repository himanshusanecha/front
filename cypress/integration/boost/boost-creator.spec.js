context('Boost Creation', () => {
  const duplicateError = "There's already an ongoing boost for this entity";
  const postContent = "Testing, please reject..." + Math.random().toString(36).substring(8);
  const nonParticipationError = 'Boost target should participate in the Rewards program.'

  beforeEach(() => {
    cy.server()
      .route("GET", '**/api/v2/boost/prepare/**').as('prepare')
      .route("POST", '**/api/v2/boost/activity/**').as('activity')
      .route("GET", '**/api/v2/blockchain/wallet/balance*').as('balance')
      .route("GET", '**/api/v2/search/suggest/**').as('suggest');

    cy.getCookie('minds_sess')
      .then((sessionCookie) => {
        if (sessionCookie === null) {
          return cy.login(true);
        }
      });

    cy.visit(`/${Cypress.env().username}/`)
      .location('pathname')
      .should('eq', `/${Cypress.env().username}/`);
  });

  // Revoke all boosts visible on the screen - 
  // If adding tests make sure it is cleaned up by this.
  after(() => {
    cy.visit('/boost/console/newsfeed/history');  
    cy.contains('Revoke')
      .click({multiple: true});
  });

  before(() => {
    cy.getCookie('minds_sess')
      .then((sessionCookie) => {
        if (sessionCookie === null) {
          return cy.login(true);
        }
      });
    cy.post(postContent);
  });

  it('should redirect a user to buy tokens when clicked', () => {    
    openModal(postContent);

    cy.get('m-boost--creator-payment-methods li h5 span')
      .contains('Buy Tokens')
      .click();

    cy.location('pathname', { timeout: 30000 })
      .should('eq', `/token`);
  });

  it('should allow a user to make an offchain boost for 500 tokens', () => {    
    openModal(postContent);
  
    cy.get('.m-boost--creator-section-amount input')
      .type(500);
  
    cy.get('m-overlay-modal > div.m-overlay-modal > m-boost--creator button')
      .click()
      .wait('@prepare').then((xhr) => {
        expect(xhr.status).to.equal(200);
        expect(xhr.response.body.status).to.deep.equal("success");
      }).wait('@activity').then((xhr) => {
        expect(xhr.status).to.equal(200);
        expect(xhr.response.body.status).to.deep.equal("success");
      });
        
    cy.get('.m-overlay-modal')
      .should('not.be.visible')
  });

  it('should error if the boost is a duplicate', () => {
    openModal(postContent);  
    cy.get('.m-boost--creator-section-amount input')
      .type(500);

    cy.get('m-overlay-modal > div.m-overlay-modal > m-boost--creator button')
      .click()
      .wait('@prepare').then((xhr) => {
        expect(xhr.status).to.equal(200);
        expect(xhr.response.body.status).to.deep.equal("success");
      }).wait('@activity').then((xhr) => {
        expect(xhr.status).to.equal(200);
        expect(xhr.response.body.status).to.deep.equal("error");
      });
    
    cy.get('[data-cy=data-minds-boost-creation-error]')
      .contains(duplicateError);
  });

  it('should display an error if boost offer receiver has not signed up for rewards', () => {
    openModal(postContent);

    cy.get('h4')
      .contains('Offers')
      .click();
    
    cy.get('m-boost--creator-p2p-search .m-boost--creator-wide-input input')
      .type("minds").wait('@suggest').then((xhr) => {
        expect(xhr.status).to.equal(200);
        expect(xhr.response.body.status).to.deep.equal("success");
      });
    
    cy.get('.m-boost--creator-autocomplete--results .m-boost--creator-autocomplete--result-content')
      .first()
      .click({force: true});

    cy.get('[data-cy=data-minds-boost-creation-error]')
      .contains(nonParticipationError);
  });

  /*
   * Finds the post containing the post content,
   * then gets the parent entity before m-newsfeed__entity.
   * Following that, we get all of the children, and look
   * for the one that contains Boost, and clicks. 
   */
  function openModal(postText) {
    cy.contains(postText)
      .parentsUntil('m-newsfeed__entity')
      .children()
      .contains('Boost')
      .click()
      .wait('@balance').then((xhr) => {
        expect(xhr.status).to.equal(200);
        expect(xhr.response.body.status).to.deep.equal("success");
      });
  }

})
