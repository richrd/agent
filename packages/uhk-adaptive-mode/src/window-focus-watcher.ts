import * as x11 from 'x11';

export default class WindowFocusWatcher {
    private onFocusChange;
    private NET_ACTIVE_WINDOW;
    private X;

    constructor(onFocusChange) {
        this.onFocusChange = onFocusChange;
    }

    start() {
        x11.createClient(async (err, display) => {
            this.X = display.client;
            this.NET_ACTIVE_WINDOW = await this.getAtomByName('_NET_ACTIVE_WINDOW');

            const root = display.screen[0].root;

            this.X.ChangeWindowAttributes(root, {
                eventMask: x11.eventMask.PointerMotion | x11.eventMask.PropertyChange
            });

            this.X.on('event', this.onEvent.bind(this));
        });
    }

    onChange(name) {
        if (this.onFocusChange) {
            this.onFocusChange(name);
        }
    }

    async getAtomByName(name) {
        const promise = new Promise((resolve, reject) => {
            this.X.InternAtom(false, name, (wmNameErr, wmNameAtom) => {
                wmNameErr ? reject(wmNameErr) : resolve(wmNameAtom);
            });
        });

        return promise;
    }

    onEvent(event) {
        if (event.atom !== this.NET_ACTIVE_WINDOW) {
            return;
        }

        this.X.GetInputFocus((err, focus) => {
            if (err) {
                console.log('ERROR', err);
                return;
            }

            const windowId = focus.focus;
            const atom = this.X.atoms.WM_CLASS;

            this.X.GetProperty(0, windowId, atom, '', 0, 10000000, (nameErr, nameProp) => {
                if (nameErr) {
                    console.log(nameErr);
                    return;
                }

                // The data is a binary buffer which contains a 2 item tuple
                // with the values separated by a null byte. There are likely
                // better ways to get just the program name but here we just
                // convert it to a string and split it using null byte as
                // the delimiter.
                const nameStr = nameProp.data.toString();
                const name = nameStr.split('\x00')[1];
                this.onChange(name);
            });
        });
    }
}
