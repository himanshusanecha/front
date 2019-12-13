context('Onboarding', () => {

  const remindText = 'remind test text';

  before(() => {
    cy.getCookie('minds_sess')
      .then((sessionCookie) => {
        if (sessionCookie === null) {
          return cy.login(true);
        }
      });
    cy.visit(`/onboarding`);

    // create two test groups
  });

  beforeEach(() => {
    cy.preserveCookies();
  });

  it('should go through the process of onboarding', () => {
    // notice should appear
    cy.get('.m-onboarding__form > h1').contains('Welcome to the Minds Community');
    cy.get('.m-onboarding__form > h2').contains(`@${Cypress.env().username}`);

    // should redirect to /hashtags
    cy.get('.m-onboarding__form button.mf-button').contains("Let's Get Setup").click();
    cy.wait(1000);


    // should be in the hashtags step


    // should have a Profile Setup title
    cy.get('.m-onboarding__form > h2').contains('Profile Setup');


    // should have a progressbar, with the hashtags step highlighted
    cy.get('.m-onboardingProgressbar__item--selected span:first-child').contains('1');
    cy.get('.m-onboardingProgressbar__item--selected span:nth-child(2)').contains('Hashtags');

    // should have a description
    cy.get('.m-onboarding__form .m-onboarding__description').contains('Select some hashtags that are of interest to you.');

    // should have a list of selectable hashtags
    cy.get('.m-hashtags__list li.m-hashtagsList__item:nth-child(2)').click();
    cy.get('.m-hashtags__list li.m-hashtagsList__item:nth-child(2)').should('have.class', 'm-hashtagsList__item--selected');
    cy.get('.m-hashtags__list li.m-hashtagsList__item:nth-child(3)').click();
    cy.get('.m-hashtags__list li.m-hashtagsList__item:nth-child(3)').should('have.class', 'm-hashtagsList__item--selected');
    cy.get('.m-hashtags__list li.m-hashtagsList__item:nth-child(4)').click();
    cy.get('.m-hashtags__list li.m-hashtagsList__item:nth-child(4)').should('have.class', 'm-hashtagsList__item--selected');

    // should have a continue and a skip button
    cy.get('button.mf-button--hollow').contains('Skip');
    cy.get('button.mf-button--alt').contains('Continue').click();

    // should be in the info step
    cy.get('.m-onboardingProgressbar__item--selected span:first-child').contains('2');
    cy.get('.m-onboardingProgressbar__item--selected span:nth-child(2)').contains('Info');

    // should have a Mobile Phone Number input
    cy.get('.m-onboarding__controls .m-onboarding__control:first-child label').contains('Mobile Phone Number');

    // open country dropdown
    cy.get('.m-onboarding__controls .m-phone-input--selected-flag').click();
    // click on UK
    cy.get('.m-phone-input--country-list li:nth-child(2)').click();
    // Uk should be selected
    cy.get('.m-phone-input--selected-flag .m-phone-input--dial-code').contains('+44');

    // add the number
    cy.get('#phone').type('012345678');

    // should have a Location input
    cy.get('.m-onboarding__controls .m-onboarding__control:nth-child(2) label').contains('Location');
    cy.get('.m-onboarding__controls .m-onboarding__control:nth-child(2) input').type('London');


    // should have Date of Birth inputs
    cy.get('.m-onboarding__controls .m-onboarding__control:nth-child(3) label').contains('Date of Birth');

    // open month selection and pick February
    cy.get('.m-onboarding__controls .m-onboarding__control:nth-child(3) select:nth-child(1)').select('February');

    // open day selection and pick 2nd
    cy.get('.m-onboarding__controls .m-onboarding__control:nth-child(3) select:nth-child(2)').select('2');

    // open year selection and pick 1991
    cy.get('.m-onboarding__controls .m-onboarding__control:nth-child(3) select:nth-child(3)').select('1991');

    // should have a continue and a skip button
    cy.get('button.mf-button--hollow').contains('Skip');
    cy.get('button.mf-button--alt').contains('Continue').click();

    // should be in the Groups step

    // should have a groups list
    cy.get('.m-groupList__list').should('exist');

    // clicking on a group join button should join the group
    // cy.get('.m-groupList__list .m-groupList__item:first-child .m-join__subscribe').contains('add').click();
    // // button should change to a check, and clicking on it should leave the group
    // cy.get('.m-groupList__list .m-groupList__item:first-child .m-join__subscribed').contains('check').click();
    // cy.get('.m-groupList__list .m-groupList__item:first-child .m-join__subscribe i').contains('add');

    // should have a continue and a skip button
    cy.get('button.mf-button--hollow').contains('Skip');
    cy.get('button.mf-button--alt').contains('Continue').click();


    // should be in the Channels step

    // should have a channels list
    // cy.get('.m-channelList__list').should('exist');
    // // clicking on a group join button should join the group
    // cy.get('.m-channelList__list .m-channelList__item:first-child .m-join__subscribe').contains('add').click();
    // // button should change to a check, and clicking on it should leave the channel
    // cy.get('.m-channelList__list .m-channelList__item:first-child .m-join__subscribed').contains('check').click();
    // cy.get('.m-channelList__list .m-channelList__item:first-child .m-join__subscribe i').contains('add');

    // should have a continue and a skip button
    cy.get('button.mf-button--hollow').contains('Skip');
    cy.get('button.mf-button--alt').contains('Finish').click();

    // should be in the newsfeed
    cy.location('pathname').should('eq', '/newsfeed/subscriptions');
  });
});
