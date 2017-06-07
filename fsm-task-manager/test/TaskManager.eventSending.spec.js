import assert from 'assert';
import Machine from '../../fsm-library/src/Machine';
import MachineDefinition from '../../fsm-library/src/MachineDefinition';
import TaskManager from '../src/TaskManager';

describe('Task manager:event sending', function() {
  const machine = new Machine({
    machineDefinition: new MachineDefinition({
      schema: {
        "name": "test",
        "initialState": "init",
        "finalStates": [
          "finished"
        ],
        "objectStateFieldName": "status",
        "transitions": [
          {
            "from": "init",
            "event": "finish",
            "to": "finished",
          }
        ]
      }
    })
  });

  let object = {};

  beforeEach(() => {
    object[MachineDefinition.getDefaultObjectStateFieldName()] = '';
  });

  const search = ({ searchParams }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => (resolve([object])), 100);
    })
  };

  const update = (newValue) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        object = { ...newValue };
        resolve({object: newValue});
      }, 100);
    })
  };


  it('test starting & saving after it', (done) => {
    const tm = new TaskManager({ machine, search, update });
    tm.start({object}).then((result) => {
      assert.equal(object.status, 'init');
      done();
    });
  });

  it('test event sending & saving', (done) => {
    const tm = new TaskManager({ machine, search, update });
    machine.start({object}).then((startedTask) => {
      tm.sendEvent({object, event: 'finish'}).then((result) => {
        assert.equal(object.status, 'finished');
        done();
      })
    });
  });
});
