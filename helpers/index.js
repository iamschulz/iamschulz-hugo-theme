import Component from './component';

export default class index extends Component {
    init() {
        this.StateMachine = new StateMachine(this, {
            scrolling: {
                value: 'enabled',
                disabled: {
                    event: 'onDisableScroll',
                },
                enabled: {
                    event: 'onEnableScroll',
                },
            },
            colorScheme: {
                dark: {
                    event: 'onColorSchemeDark',
                },
                light: {
                    event: 'onColorSchemeLight',
                },
            },
        });
    }
}
