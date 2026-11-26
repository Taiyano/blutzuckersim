class getDevice {
    getInfo() {
        return {
            id: 'getdevice',
            name: 'Get OS Platform',
            blocks: [
                {
                    opcode: 'getDevice',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'Get OS Device Platform'
                }
            ]
        };
    }

    getDevice() {
        let OS = window.navigator.platform
        return OS;
    }
}

Scratch.extensions.register(new getDevice());
