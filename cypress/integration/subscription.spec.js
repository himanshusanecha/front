import { Subscriber } from "rxjs";

context('Subscription', () => {

  const user = 'minds';
  const subscribeButton = 'minds-button-subscribe > button'
  const messageButton = 'm-messenger--channel-button > button';
  const userDropdown = 'minds-button-user-dropdown > button';
  const unsubscribeOption = 'minds-button-user-dropdown > ul > li:nth-child(4)'

  beforeEach(()=> {
    cy.login(true);

    cy.location('pathname', { timeout: 30000 })
      .should('eq', `/newsfeed/subscriptions`);
    
    cy.visit(`/${user}`);
  })

  it('should allow a user to subscribe to another', () => {
    subscribe();
  });

  it('should allow a user to unsubscribe',() => {
    unsubscribe();
  })

  function subscribe() {
    cy.get(subscribeButton).click();
    cy.get(messageButton).should('be.visible');
  }

  function unsubscribe() {
    cy.get(userDropdown).click();
    cy.get(unsubscribeOption).click();
    cy.get(subscribeButton).should('be.visible');
  }

});
