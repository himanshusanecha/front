/**
 * @author Ben Hayward
 * @desc E2E testing for Minds Pro's settings.
 */
context('Pro Settings', () => {
  if (Cypress.env().pro_password) {
    // required to run tests against pro user only.
    const activityContainer = 'minds-activity';

    function data(str) {
      return `[data-minds=${str}]`;
    }

    const general = {
      title: data('title'),
      headline: data('headline'),
      publish: data('publish'),
      strings: {
        title: 'Minds Pro E2E',
        headline: 'This headline is a test',
      },
    };

    const theme = {
      textColor: data('textColor'),
      // textColorPicker: data('textColorPicker'),
      primaryColor: data('primaryColor'),
      // primaryColorPicker: data('primaryColorPicker'),
      plainBgColor: data('plainBgColor'),
      // plainBgColorPicker: data('plainBgColorPicker'),
      schemeLight: data('schemeLight'),
      schemeDark: data('schemeDark'),
      aspectRatio: {
        169: data('tileRatio_16:9'), //  16:9
        1610: data('tileRatio_16:10'), // 16:10
        43: data('tileRatio_4:3'), // 4:3
        11: data('tileRatio_1:1'), // 1:1
      },
      strings: {
        textColor: '#4690df',
        primaryColor: '#cb7848',
        plainBgColor: '#b4bbf0',
        textColorRgb: 'rgb(70, 144, 223)',
        primaryColorRgb: 'rgb(203, 120, 72)',
        plainBgColorRgba: 'rgba(180, 187, 240, 0.627)',
      },
    };

    //TODOOJM
    const assets = {
      logo: data('logo'),
      background: data('background'),
      strings: {
        logoFixture: '../../fixtures/avatar.jpg',
        backgroundFixture:
          '../../fixtures/international-space-station-1776401_1920.jpg',
      },
    };

    const hashtags = {
      add: data('addHashtag'),
      label0: data('tag__label--0'),
      tag0: data('tag__tag--0'),
      label1: data('tag__label--1'),
      tag1: data('tag__tag--1'),
      strings: {
        label0: 'myLabel0',
        label1: 'myLabel1',
        tag0: '#hashtag0',
        tag1: '#hashtag1',
      },
    };

    const footer = {
      text: data('footerText'),
      add: data('addFooterLink'),
      linkTitle: data('footerLink__title--0'),
      linkHref: data('footerLink__href--0'),
      strings: {
        text: 'This is a footer',
        linkTitle: 'Minds',
        linkHref: 'https://www.minds.com/',
      },
    };

    // TODO
    // const domain = {};

    const payouts = {
      strings: {
        method: 'USD',
      },
    };

    before(() => {
      cy.login(true, Cypress.env().pro_username, Cypress.env().pro_password);
    });

    after(() => {
      cy.visit('/pro/' + Cypress.env().pro_username + '/settings/hashtags')
        .location('pathname')
        .should(
          'eq',
          '/pro/' + Cypress.env().pro_username + '/settings/hashtags'
        );
      clearHashtags();
    });

    beforeEach(() => {
      cy.preserveCookies();
      cy.server();
      cy.route('POST', '**/api/v2/pro/settings').as('settings');

      cy.visit('/pro/' + Cypress.env().pro_username + '/settings/general')
        .location('pathname')
        .should(
          'eq',
          '/pro/' + Cypress.env().pro_username + '/settings/general'
        );
    });

    it('should update the title and headline', () => {
      //enter data
      cy.get(general.title)
        .focus()
        .clear()
        .type(general.strings.title);

      cy.get(general.headline)
        .focus()
        .clear()
        .type(general.strings.headline);

      saveAndPreview();
      //check tab title.
      cy.title().should(
        'eq',
        general.strings.title + ' - ' + general.strings.headline + ' | Minds'
      );
    });

    // it('should enable pro theme', () => {
    // cy.get(general.publish).check();

    // saveAndPreview();

    // });

    // it('should disable pro theme', () => {
    // cy.get(general.publish).uncheck();

    // saveAndPreview();

    // });

    it('should allow the user to set theme colors', () => {
      cy.contains('Theme').click();

      cy.get(theme.textColor)
        .click()
        .clear()
        .type(theme.strings.textColor);

      cy.get(theme.primaryColor)
        .click()
        .clear()
        .type(theme.strings.primaryColor);

      cy.get(theme.plainBgColor)
        .click()
        .clear()
        .type(theme.strings.plainBgColor);

      saveAndPreview();

      cy.contains('feed')
        .should('have.css', 'color')
        .and('eq', theme.strings.textColorRgb);

      cy.get('.m-pro__searchBox input').should(
        'have.css',
        'background-color',
        theme.strings.plainBgColorRgba
      );

      cy.contains('feed').should(
        'have.css',
        'color',
        theme.strings.textColorRgb
      );
      // .and('eq', theme.strings.textColorRgb);

      cy.contains('feed').click();
      cy.get('.m-proHamburgerMenu__trigger')
        .click()
        .get('.m-proHamburgerMenu__item--active')
        .should('have.css', 'color')
        .and('eq', theme.strings.primaryColorRgb);
    });

    it('should allow the user to set a dark theme for posts', () => {
      cy.contains('Theme').click();

      cy.get(theme.schemeDark).click();

      saveAndPreview();

      cy.contains('Feed').click();

      cy.get(activityContainer)
        .should('have.css', 'background-color')
        .and('eq', 'rgb(35, 35, 35)');
    });

    it('should allow the user to set a light theme for posts', () => {
      cy.contains('Theme').click();

      cy.get(theme.schemeLight).click();

      saveAndPreview();

      cy.contains('Feed').click();

      cy.get(activityContainer)
        .should('have.css', 'background-color')
        .and('eq', 'rgb(255, 255, 255)');
    });

    it('should allow the user to upload logo and background images', () => {
      cy.uploadFile(assets.logo, assets.strings.logoFixture, 'image/jpg');
      // // upload the image
      // cy.uploadFile('.medium-media-file-input', '../fixtures/international-space-station-1776401_1920.jpg', 'image/jpg')
      //   .wait('@postMedia').then(xhr => {
      //     expect(xhr.status).to.equal(200);
      //     expect(xhr.response.body.status).to.equal('success');
      //   });

      cy.uploadFile(
        assets.background,
        assets.strings.backgroundFixture,
        'image/jpg'
      );
    });

    it('should allow the user to set category hashtags', () => {
      cy.contains('Hashtags').click();

      cy.get(hashtags.add).click();

      cy.get(hashtags.label0)
        .clear()
        .type(hashtags.strings.label0);

      cy.get(hashtags.tag0)
        .clear()
        .type(hashtags.strings.tag0);

      cy.get(hashtags.add).click();

      cy.get(hashtags.label1)
        .clear()
        .type(hashtags.strings.label1);

      cy.get(hashtags.tag1)
        .clear()
        .type(hashtags.strings.tag1);

      saveAndPreview();

      //check the labels are present and clickable.
      cy.contains(hashtags.strings.label1);
      cy.contains(hashtags.strings.label2);
    });

    it('should allow the user to set footer', () => {
      cy.contains('Footer').click();

      // add a new footer link
      cy.get(footer.add).click();

      cy.get(footer.linkHref)
        .clear()
        .type(footer.strings.linkHref);

      cy.get(footer.linkTitle)
        .clear()
        .type(footer.strings.linkTitle);

      // add footer text
      cy.get(footer.text)
        .clear()
        .type(footer.strings.text);

      saveAndPreview();

      cy.contains(footer.strings.footerTitle)
        .should('have.attr', 'href')
        .should('contain', footer.strings.footerHref);

      cy.get(footer.text).should('contain', footer.strings.text);
    });

    it('should allow the user to set payout method', () => {
      cy.contains('Payouts').click();

      cy.contains(payouts.method).check();

      // session.getLoggedInUser().merchant.service: "stripe"
    });

    //save, await response, preview.
    function saveAndPreview() {
      //save and await response
      cy.contains('Save')
        .click()
        .wait('@settings')
        .then(xhr => {
          expect(xhr.status).to.equal(200);
          expect(xhr.response.body).to.deep.equal({ status: 'success' });
        });

      //go to pro page
      cy.contains('View Pro Channel').click();
    }

    function clearHashtags() {
      cy.contains('Hashtags').click();

      cy.get(hashtags.add).click();

      cy.contains('clear').click({ multiple: true });
      saveAndPreview();
    }

    //
    // it.only('should update the theme', () => {
    //   // nav to theme tab
    //   cy.contains('Theme')
    //     .click();

    //   cy.get(theme.plainBgColor).then(elem => {
    //     elem.val('#00dd00');
    //         //save and await response
    //     cy.contains('Save')
    //     .click()
    //     .wait('@settings').then((xhr) => {
    //       expect(xhr.status).to.equal(200);
    //       expect(xhr.response.body).to.deep.equal({ status: 'success' });
    //     });

    //   //go to pro page
    // cy.contains('View Pro Channel').click();

    // })
  }
});
