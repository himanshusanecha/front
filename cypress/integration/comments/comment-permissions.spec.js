
context('Comment Threads', () => {
  before(() => {
    //make a post new.
    cy.getCookie('minds_sess')
    .then((sessionCookie) => {
      if (sessionCookie === null) {
        return cy.login(true);
      }
    });

    cy.visit('/newsfeed/subscriptions');  
    cy.location('pathname')
      .should('eq', `/newsfeed/subscriptions`);

    cy.post('test post');
  }); 

  beforeEach(()=> {
    cy.preserveCookies();
  });
});