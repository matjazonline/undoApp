import { UndoAppPage } from './app.po';

describe('undo-app App', function() {
  let page: UndoAppPage;

  beforeEach(() => {
    page = new UndoAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
