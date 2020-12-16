import WindowFocusWatcher from './window-focus-watcher';

export default class AdaptiveMode {
    private defaultKeymap;
    private windowToKeymap;
    private previousWindow;
    private switchCallback;

    constructor(defaultKeymap, windowToKeymap, switchCallback) {
        this.defaultKeymap = defaultKeymap;
        this.windowToKeymap = windowToKeymap;
        this.switchCallback = switchCallback;
    }

    switchToKeymap(name) {
        this.switchCallback(name);
    }

    windowChanged(name) {
        console.log('Window changed to:', name);
        if (!name) {
            return;
        }

        // If a keymap is defined for current window switch to it
        if (this.windowToKeymap[name]) {
            this.switchToKeymap(this.windowToKeymap[name]);
            this.previousWindow = name;
            return;
        }

        // If the previous window was detected one (but the current one isn't) switch to default
        if (this.windowToKeymap[this.previousWindow]) {
            this.switchToKeymap(this.defaultKeymap);
            this.previousWindow = name;
        }
    }

    start() {
        console.log('Adaptive Mode Active');
        console.log('Waiting for window focus changes...');

        const wfw = new WindowFocusWatcher(this.windowChanged.bind(this));
        wfw.start();
    }
}
