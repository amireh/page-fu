import Route from '../Route';
import { assert, sinonSuite, simulateDOMEnvironment } from './TestUtils';

describe('page-fu.Route', function() {
  const sinon = sinonSuite(this);

  simulateDOMEnvironment(this);

  describe('construction', function() {
    const subject = Route();

    afterEach(function(done) {
      subject.exit({}, done);
    })

    it('can be created and destroyed', function() {
      subject.enter({});
    })
  });

  describe('public APIs', function() {
    const MyRoute = Route({
      getInitialState() {
        return {
          user: { id: '1' }
        };
      },

      enter() {},

      getUserId() {
        return this.state.user.id;
      }
    })

    it('leaves APIs defined in the spec untouched', function() {
      const subject = MyRoute;

      subject.enter({})

      assert.equal(typeof subject.getUserId, 'function');
      assert.equal(subject.getUserId(), '1');

      subject.setState({
        user: { id: '2' }
      })

      assert.equal(subject.getUserId(), '2');
    })
  })

  it('will always call #next on exit if the handler is not handling it', function(done) {
    const exit = sinon.stub();
    const subject = Route({
      exit
    })

    subject.enter({});
    subject.exit({}, function(err) {
      assert.called(exit);

      done(err);
    });
  })
});
