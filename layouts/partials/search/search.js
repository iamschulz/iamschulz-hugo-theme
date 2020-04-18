import Component from '../../../helpers/component';

export default class Search extends Component {
    init() {
        EventBus.subscribe('onColorSchemeDark', () => { this.setDDGTheme() });
        EventBus.subscribe('onColorSchemeLight', () => { this.setDDGTheme() });
    }

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = parseInt(x).toString(16)
            return hex.length === 1 ? '0' + hex : hex
        }).join('');
    }

    setDDGTheme() {
        const bodyStyles = getComputedStyle(document.body);

        this.header.value = this.rgbToHex(...bodyStyles.getPropertyValue('background-color').match(/\d+/g));
        this.background.value = this.rgbToHex(...bodyStyles.getPropertyValue('background-color').match(/\d+/g));
        this.text.value = this.rgbToHex(...bodyStyles.getPropertyValue('color').match(/\d+/g));
        this.links.value = this.rgbToHex(...bodyStyles.getPropertyValue('color').match(/\d+/g));
        this.addresses.value = this.rgbToHex(...bodyStyles.getPropertyValue('color').match(/\d+/g));
    }
}
