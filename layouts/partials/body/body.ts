import Component from "../../../helpers/component";
import StateMachineType from "../../../helpers/types/stateMachineInstance";
import StateMachine from "../../../helpers/stateMachine";

export default class body extends Component {
	StateMachine: StateMachineType;

	init() {
		this.StateMachine = new StateMachine(this, {
			scrolling: {
				value: "enabled",
				disabled: {
					event: "onDisableScroll",
				},
				enabled: {
					event: "onEnableScroll",
				},
			},
			colorScheme: {
				dark: {
					event: "onColorSchemeDark",
				},
				light: {
					event: "onColorSchemeLight",
				},
			},
		});
	}
}
