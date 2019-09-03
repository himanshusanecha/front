context('Registration', () => {

  const username = Math.random().toString(36).replace('0.', '');
  const email = 'test@minds.com';
  const password = `${Math.random().toString(36).replace('0.', '')}0oA!`;
  const noSymbolPass = 'Passw0rd';

  const welcomeText = "Welcome to Minds!";
  const passwordDontMatch = "Passwords must match.";
  const passwordInvalid = " Password must have more than 8 characters. Including uppercase, numbers, special characters (ie. !,#,@), and cannot have spaces. ";

  const usernameField = 'minds-form-register #username';
  const emailField = 'minds-form-register #email';
  const passwordField = 'minds-form-register #password';
  const password2Field = 'minds-form-register #password2';
  const checkbox = 'minds-form-register label:nth-child(2) .mdl-ripple--center';
  const submitButton = 'minds-form-register .mdl-card__actions button';
  const errorContainer = 'div:nth-child(2) > minds-form-register > div > div';

  before(() => {
    cy.server();
    cy.route("POST", "**/api/v1/register").as("register");
  });

  beforeEach(() => {
    cy.visit('/login');
    cy.location('pathname').should('eq', '/login');
  });

  it('should allow a user to register', () => {
    //type values
    cy.get(usernameField).focus().type(username);
    cy.get(emailField).focus().type(email);
    cy.get(passwordField).focus().type(password);

    cy.get(password2Field).focus().type(password);
    cy.get(checkbox).click();

    //submit
    cy.get(submitButton).click()
      .wait('@register').then((xhr) => {
        expect(xhr.status).to.equal(200);
      });
  
    //onboarding modal shown
    cy.get('m-onboarding--topics > div > h2:nth-child(1)')
      .contains(welcomeText);
  });

  it('should display an error if password is invalid', () => {
    
    cy.get(usernameField).focus().type(Math.random().toString(36).replace('0.', ''));
    cy.get(emailField).focus().type(email);
    cy.get(passwordField).focus().type(noSymbolPass);
    cy.wait(500);    
    cy.get(password2Field).focus().type(noSymbolPass);
    cy.get(checkbox).click();

    //submit
    cy.get(submitButton).click()
      .wait('@register').then((xhr) => {
        expect(xhr.status).to.equal(200);
      });

    cy.scrollTo('top');
    cy.get(errorContainer)
      .contains(passwordInvalid);
  });

  it('should display an error if passwords do not match', () => {
    cy.get(usernameField).focus().type(Math.random().toString(36).replace('0.', ''));
    cy.get(emailField).focus().type(email);
    cy.get('minds-form-register #password').focus().type(password);
    cy.wait(500);
  
    cy.get(password2Field).focus().type(password + '!');
    cy.get(checkbox).click();
    
    //submit
    cy.get(submitButton).click();
    cy.get(submitButton).click()
    .wait('@register').then((xhr) => {
      expect(xhr.status).to.equal(200);
    });

    cy.scrollTo('top');
    cy.get(errorContainer)
      .contains(passwordDontMatch);
  });

})
