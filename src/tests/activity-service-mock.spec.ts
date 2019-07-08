export let activityServiceMock = new function() {
  this.triggerChange = jasmine.createSpy('triggerChange').and.stub();
  this.toggleAllowComments = jasmine.createSpy('toggleAllowComponents').and.stub();
}
