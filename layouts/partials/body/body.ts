import Component from "../../../helpers/component";
import { StateMachine as StateMachineType } from "../../../helpers/types/states";
import StateMachine from "../../../helpers/stateMachine";

export default class body extends Component {
	StateMachine: StateMachineType;

	init() {
		this.StateMachine = new StateMachine(this, {
			scrolling: {
				value: "enabled",
				triggers: [
					{
						name: "disabled",
						event: "onDisableScroll",
					},
					{
						name: "enabled",
						event: "onEnableScroll",
					},
				],
			},
			colorScheme: {
				triggers: [
					{
						name: "dark",
						event: "onColorSchemeDark",
					},
					{
						name: "light",
						event: "onColorSchemeLight",
					},
				],
			},
		});
	}
}
