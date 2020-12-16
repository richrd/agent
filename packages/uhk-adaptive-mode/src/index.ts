#!/usr/bin/env ../../node_modules/.bin/ts-node-script

import fs from 'fs';

import Yargs from 'yargs';
import { join } from 'path';
import { LogService } from 'uhk-common';
import { UhkBlhost, UhkHidDevice, UhkOperations } from 'uhk-usb';

import AdaptiveMode from './adaptive-mode';

const yargs = Yargs
    .showHelpOnFail(true)
    .option('help', {
        description: 'Display help message'
    })
    .option('log', {
        description: 'Set logging categories. --log=misc,usb. Default is "none"',
        type: 'string',
        default: 'none',
        choices: ['all', 'config', 'misc', 'none', 'usb']
    })
    .help('help')
    .version(false)
;

(async () => {
    try {
        const argv = yargs
            .scriptName('./index.ts')
            .usage('Usage: $0 <config file>')
            .demandCommand(1, 'Config file name required')
            .argv as any;

        const logger = new LogService();
        const tmpDir = join(__dirname, '../../tmp');
        const device = new UhkHidDevice(logger, argv, tmpDir);
        const uhkBlhost = new UhkBlhost(logger, tmpDir);
        const operations = new UhkOperations(logger, uhkBlhost, device);

        const configData = fs.readFileSync(argv._[0]).toString();
        const config = JSON.parse(configData);

        const defaultKeymap = config.defaultKeymap;
        const windowToKeymap = config.windowToKeymap;
        const switchKeymap = name => operations.switchKeymap(name);

        const adaptiveMode = new AdaptiveMode(defaultKeymap, windowToKeymap, switchKeymap);
        adaptiveMode.start();
    } catch (error) {
        console.error('Fatal error occured:');
        console.error(error);
    }
})();
