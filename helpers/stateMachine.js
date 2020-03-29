/**
 * Usage:
 *      this.StateMachine = new StateMachine(this, {
 *          stateName: {
 *              value: 'stateValue',
 *              stateValue: {
 *                  event: 'onEvent',
 *                  on: 'enterCallbackFn',
 *                  off: 'exitCallbackFn',
 *              },
 *          },
 *      });
 *
 * stateName is the name of your defined state. must be a string. is required.
 * stateName.value is the initial value of a state. must be a string or a number. is optional and defaults to null.
 * stateName.stateValue is the configuration for a certain state. must reflect the value in order to trigger.
 * stateName.stateValue.event defines an event that triggers this stateValue
 * stateName.stateValue.on points to a method that is called upon stateValue activation
 * stateName.stateValue.off points to a method that is called upon stateValue deactivation
 */

import State from './state';

export default class StateMachine {
    constructor(component, states) {
        if (!component || !states) {
            console.error('State Machine called incorrectly');
            return;
        }

        this.component = component;
        this.statesObj = states;
        this.states = {};

        this.registerStates();
    }

    registerStates() {
        Object.keys(this.statesObj).forEach((name) => {
            this.states[name] = new State(name, this.component, this.statesObj[name]);
        });
    }
}
