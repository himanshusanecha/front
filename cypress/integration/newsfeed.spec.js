context('Newsfeed', () => {
  before(() => {
    cy.getCookie('minds_sess').then(sessionCookie => {
      if (sessionCookie === null) {
        return cy.login(true);
      }
    });
  });

  beforeEach(() => {
    cy.preserveCookies();
    cy.server();
    cy.route('POST', '**/api/v1/newsfeed').as('newsfeedPOST');
    cy.route('POST', '**/api/v1/media').as('mediaPOST');
    cy.route('POST', '**/api/v1/newsfeed/**').as('newsfeedEDIT');
    cy.route('POST', '**/api/v1/media/**').as('mediaEDIT');
  });

  const deleteActivityFromNewsfeed = () => {
    cy.get(
      '.minds-list > minds-activity:first m-post-menu .minds-more'
    ).click();
    cy.get(
      '.minds-list > minds-activity:first m-post-menu .minds-dropdown-menu .mdl-menu__item:nth-child(4)'
    ).click();
    cy.get(
      '.minds-list > minds-activity:first m-post-menu m-modal-confirm .mdl-button--colored'
    ).click();
  };

  const newActivityContent = content => {
    cy.get('minds-newsfeed-poster').should('be.visible');
    cy.get('minds-newsfeed-poster textarea').type(content);
  };

  const attachImageToActivity = () => {
    cy.uploadFile(
      '#attachment-input-poster',
      '../fixtures/international-space-station-1776401_1920.jpg',
      'image/jpg'
    );
    cy.wait('@mediaPOST').then(xhr => {
      expect(xhr.status).to.equal(200);
    });
  };

  const postActivityAndAwaitResponse = code => {
    cy.get('.m-posterActionBar__PostButton').click();
    cy.wait('@newsfeedPOST').then(xhr => {
      expect(xhr.status).to.equal(code);
    });
  };

  const navigateToNewsfeed = () => {
    cy.get('.m-v2-topbar__Nav >')
      .eq(1)
      .click();
    cy.location('pathname', { timeout: 20000 }).should(
      'contains',
      'newsfeed/subscriptions'
    );
    cy.wait(5000);
  };

  const editActivityContent = newContent => {
    cy.get(
      '.minds-list > minds-activity:first m-post-menu .minds-more'
    ).click();
    cy.get(
      '.minds-list > minds-activity:first m-post-menu .minds-dropdown-menu .mdl-menu__item:nth-child(1)'
    ).click();
    cy.get('.minds-list > minds-activity:first textarea').clear();
    cy.get('.minds-list > minds-activity:first textarea').type(newContent);
    cy.get('.minds-list > minds-activity:first .mdl-button--colored').click();
    cy.wait('@newsfeedEDIT').then(xhr => {
      expect(xhr.status).to.equal(200);
    });
  };

  it('editing media post propagates to activity', () => {
    const identifier = Math.floor(Math.random() * 100);
    const content = 'This is a post with an image ' + identifier;

    newActivityContent(content);
    attachImageToActivity();
    postActivityAndAwaitResponse(200);

    cy.get('.minds-list > minds-activity:first .message').contains(content);
    cy.get('.minds-list > minds-activity:first  .item-image img').should(
      'be.visible'
    );

    cy.get('.minds-list > minds-activity:first  .item-image img').click();
    cy.get('m-media--modal .permalink').click();
    cy.location('pathname', { timeout: 20000 }).should('contains', 'media');
    cy.get('.m-media-content--heading').contains(content);
    cy.get('.minds-button-edit').click();

    const newContent = content + ' changed';
    cy.get('minds-textarea .m-editor')
      .clear()
      .type(newContent);
    cy.get('.m-button--submit').click();
    cy.wait('@mediaEDIT').then(xhr => {
      expect(xhr.status).to.equal(200);
    });

    navigateToNewsfeed();

    cy.get('.minds-list > minds-activity:first .message').contains(newContent);

    deleteActivityFromNewsfeed();
  });

  it('editing a media activity propagates to media post', () => {
    const identifier = Math.floor(Math.random() * 100);
    const content = 'This is a post with an image ' + identifier;

    newActivityContent(content);
    attachImageToActivity();
    postActivityAndAwaitResponse(200);

    cy.get('.minds-list > minds-activity:first .message').contains(content);
    cy.get('.minds-list > minds-activity:first  .item-image img').should(
      'be.visible'
    );

    const newContent = content + ' changed';
    editActivityContent(newContent);

    cy.get('.minds-list > minds-activity:first  .item-image img').click();
    cy.get('m-media--modal .permalink').click();
    cy.location('pathname', { timeout: 20000 }).should('contains', 'media');
    cy.get('.m-media-content--heading').contains(newContent);

    navigateToNewsfeed();
    deleteActivityFromNewsfeed();
  });

  it('should post an activity picking hashtags from the dropdown', () => {
    newActivityContent('This is a post');

    // click on hashtags dropdown
    cy.get(
      'minds-newsfeed-poster m-hashtags-selector .m-dropdown--label-container'
    ).click();

    // select #ART
    cy.get(
      'minds-newsfeed-poster m-hashtags-selector  m-dropdown m-form-tags-input > div > span'
    )
      .contains('#art')
      .click();

    // type in another hashtag manually
    cy.get('minds-newsfeed-poster m-hashtags-selector m-form-tags-input input')
      .type('hashtag{enter}')
      .click();

    // click away on arbitrary area.
    cy.get('minds-newsfeed-poster m-hashtags-selector .minds-bg-overlay').click(
      { force: true }
    );

    postActivityAndAwaitResponse(200);

    cy.get('.mdl-card__supporting-text.message.m-mature-message > span')
      .first()
      .contains('This is a post #art #hashtag');

    cy.get('.minds-list > minds-activity:first-child .message a:first-child')
      .contains('#art')
      .should(
        'have.attr',
        'href',
        '/newsfeed/global/top;hashtag=art;period=24h'
      );
    cy.get('.minds-list > minds-activity:first-child .message a:last-child')
      .contains('#hashtag')
      .should(
        'have.attr',
        'href',
        '/newsfeed/global/top;hashtag=hashtag;period=24h'
      );

    deleteActivityFromNewsfeed();
  });

  it('should post an activity with an image attachment', () => {
    const identifier = Math.floor(Math.random() * 100);
    const content = 'This is a post with an image ' + identifier;
    newActivityContent(content);

    cy.uploadFile(
      '#attachment-input-poster',
      '../fixtures/international-space-station-1776401_1920.jpg',
      'image/jpg'
    );

    cy.wait('@mediaPOST').then(xhr => {
      expect(xhr.status).to.equal(200);
    });

    postActivityAndAwaitResponse(200);

    cy.get('.minds-list > minds-activity:first-child .message').contains(
      content
    );
    cy.get('.minds-list > minds-activity:first-child  .item-image img').should(
      'be.visible'
    );

    deleteActivityFromNewsfeed();
  });

  it('should post a nsfw activity', () => {
    newActivityContent('This is a nsfw post');

    // click on nsfw dropdown
    cy.get(
      'minds-newsfeed-poster m-nsfw-selector .m-dropdown--label-container'
    ).click();

    // select Nudity
    cy.get('minds-newsfeed-poster m-nsfw-selector .m-dropdownList__item')
      .contains('Nudity')
      .click();

    // click away
    cy.get('minds-newsfeed-poster m-nsfw-selector .minds-bg-overlay').click();

    postActivityAndAwaitResponse(200);

    // should have the mature text toggle
    cy.get(
      '.minds-list > minds-activity:first-child .message .m-mature-text-toggle'
    ).should('not.have.class', 'mdl-color-text--red-500');
    cy.get(
      '.minds-list > minds-activity:first-child .message .m-mature-message-content'
    ).should('have.class', 'm-mature-text');

    // click the toggle
    cy.get(
      '.minds-list > minds-activity:first-child .message .m-mature-text-toggle'
    ).click();

    // text should be visible now
    cy.get(
      '.minds-list > minds-activity:first-child .message .m-mature-text-toggle'
    ).should('have.class', 'mdl-color-text--red-500');
    cy.get(
      '.minds-list > minds-activity:first-child .message .m-mature-message-content'
    ).should('not.have.class', 'm-mature-text');

    cy.get(
      '.minds-list > minds-activity:first-child .message .m-mature-message-content'
    ).contains('This is a nsfw post');

    deleteActivityFromNewsfeed();
  });

  it('should vote an activity', () => {
    newActivityContent('This is an upvoted post');
    postActivityAndAwaitResponse(200);

    // upvote
    cy.get(
      '.minds-list > minds-activity:first-child minds-button-thumbs-up a'
    ).should('not.have.class', 'selected');
    cy.get(
      '.minds-list > minds-activity:first-child minds-button-thumbs-up a'
    ).click();
    cy.get(
      '.minds-list > minds-activity:first-child minds-button-thumbs-up a'
    ).should('have.class', 'selected');
    cy.get(
      '.minds-list > minds-activity:first-child minds-button-thumbs-up span'
    ).contains('1');

    cy.get(
      '.minds-list > minds-activity:first-child minds-button-thumbs-up a'
    ).click();
    cy.get(
      '.minds-list > minds-activity:first-child minds-button-thumbs-up a'
    ).should('not.have.class', 'selected');

    // downvote
    cy.get(
      '.minds-list > minds-activity:first-child minds-button-thumbs-down a'
    ).should('not.have.class', 'selected');
    cy.get(
      '.minds-list > minds-activity:first-child minds-button-thumbs-down a'
    ).click();
    cy.get(
      '.minds-list > minds-activity:first-child minds-button-thumbs-down a'
    ).should('have.class', 'selected');
    cy.get(
      '.minds-list > minds-activity:first-child minds-button-thumbs-down span'
    ).contains('1');

    cy.get(
      '.minds-list > minds-activity:first-child minds-button-thumbs-down a'
    ).click();
    cy.get(
      '.minds-list > minds-activity:first-child minds-button-thumbs-down a'
    ).should('not.have.class', 'selected');

    deleteActivityFromNewsfeed();
  });

  it('should have an "Upgrade to Plus" button and it should redirect to /plus', () => {
    cy.get(
      '.m-page--sidebar--navigation a.m-page--sidebar--navigation--item:nth-child(2) span'
    ).contains('Upgrade to Plus');

    cy.get(
      '.m-page--sidebar--navigation a.m-page--sidebar--navigation--item:nth-child(2)'
    )
      .should('have.attr', 'href', '/plus')
      .click();

    cy.location('pathname').should('eq', '/plus');
  });

  it('should have a "Buy Tokens" button and it should redirect to /token', () => {
    cy.visit('/');
    cy.get(
      '.m-page--sidebar--navigation a.m-page--sidebar--navigation--item:last-child span'
    ).contains('Buy Tokens');

    cy.get(
      '.m-page--sidebar--navigation a.m-page--sidebar--navigation--item:last-child'
    )
      .should('have.attr', 'href', '/tokens')
      .click();

    cy.location('pathname').should('eq', '/token');
  });

  it('"create blog" button in poster should redirect to /blog/edit/new', () => {
    cy.visit('/');

    cy.get('minds-newsfeed-poster .m-posterActionBar__CreateBlog')
      .contains('Create blog')
      .click();

    cy.location('pathname').should('eq', '/blog/edit/new');
  });

  it('clicking on "create blog" button in poster should prompt a confirm dialog and open a new blog with the currently inputted text', () => {
    cy.visit('/');

    newActivityContent('thegreatmigration'); // TODO: fix UX issue when hashtag element is overlapping input

    const stub = cy.stub();
    cy.on('window:confirm', stub);
    cy.get('minds-newsfeed-poster .m-posterActionBar__CreateBlog')
      .contains('Create blog')
      .click()
      .then(() => {
        expect(stub.getCall(0)).to.be.calledWith(
          'Are you sure? The content will be moved to the blog editor.'
        );
      });

    cy.location('pathname').should('eq', '/blog/edit/new');

    cy.get(
      'm-inline-editor .medium-editor-element.medium-editor-insert-plugin p'
    ).contains('thegreatmigration');
  });

  it('should record a view when the user scrolls and an activity is visible', () => {
    cy.visit('/');

    cy.server();
    cy.route('POST', '**/api/v2/analytics/views/activity/*').as('view');

    newActivityContent('This is a post that will record a view');
    postActivityAndAwaitResponse(200);

    cy.scrollTo(0, '20px');

    cy.wait('@view').then(xhr => {
      expect(xhr.status).to.equal(200);
      expect(xhr.response.body).to.deep.equal({ status: 'success' });
    });

    deleteActivityFromNewsfeed();
  });

  it('clicking on the plus button on the sidebar should redirect the user to  /groups/create', () => {
    cy.get(
      'm-group--sidebar-markers .m-groupSidebarMarkers__list li:first-child'
    )
      .contains('add')
      .click();

    cy.location('pathname').should('eq', '/groups/create');
  });
});
