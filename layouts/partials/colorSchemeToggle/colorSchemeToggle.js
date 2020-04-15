import Component from '../../../helpers/component';

export default class ColorSchemeToggle extends Component {
    prepare() {
        this.StateMachine = new StateMachine(this, {
            colorScheme: {
                value: window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light',
                dark: {
                    event: 'onColorSchemeDark',
                },
                light: {
                    event: 'onColorSchemeLight',
                },
            },
        });
    }

    init() {
        this.boundOnToggle = () => { this.onToggle(); };
        this.colorSchemeToggle.addEventListener('change', this.boundOnToggle);
        this.applyInitialState();
    }

    onToggle() {
        const colorScheme = this.colorSchemeToggle.checked ? 'Dark' : 'Light';
        window.localStorage.colorScheme = colorScheme.toLowerCase();
        document.querySelector('meta[name="theme-color"]')
                .setAttribute('content', colorScheme === 'Light' ? '#f1f3f4' : '#0e181b');
        EventBus.publish(`onColorScheme${colorScheme}`);
    }

    applyInitialState() {
        if (window.localStorage.colorScheme === 'dark' || window.localStorage.colorScheme === 'light') {
            this.colorSchemeToggle.checked = window.localStorage.colorScheme === 'dark';
            this.onToggle();
        } else {
            this.colorSchemeToggle.checked = window.matchMedia('(prefers-color-scheme:dark)').matches;
        }
    }
}
