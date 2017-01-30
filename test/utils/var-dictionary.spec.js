'use strict';

var expect = require('expect.js'),
    Consts = require('../../lib/defs/consts'),
    ByteUtils = require('../../lib/utils/byte-utils'),
    BinaryStream = require('../../lib/utils/binary-stream'),
    Int64 = require('../../lib/utils/int64'),
    VarDictionary = require('../../lib/utils/var-dictionary');

describe('VarDictionary', function() {
    var data = '00010808000000426f6f6c5472756501000000010809000000426f6f6c46616c' +
        '73650100000000040600000055496e743332040000002a000000050600000055' +
        '496e74363408000000ccccddddeeeeffff0c05000000496e74333204000000d6' +
        'ffffff0d05000000496e74363408000000444433332222111118060000005374' +
        '72696e670b000000537472696e6756616c756542090000004279746541727261' +
        '7907000000000102030405ff00';

    it('reads and writes dictionary', function() {
        var dataBytes = ByteUtils.hexToBytes(data);
        var stm = new BinaryStream(ByteUtils.arrayToBuffer(dataBytes));
        var dict = VarDictionary.read(stm);
        expect(dict).to.be.a(VarDictionary);
        expect(dict.length).to.be(8);
        expect(dict.get('BoolTrue')).to.be(true);
        expect(dict.get('BoolFalse')).to.be(false);
        expect(dict.get('UInt32')).to.be(42);
        expect(dict.get('UInt64').hi).to.be(0xFFFFEEEE);
        expect(dict.get('UInt64').lo).to.be(0xDDDDCCCC);
        expect(dict.get('Int32')).to.be(-42);
        expect(dict.get('Int64').hi).to.be(0x11112222);
        expect(dict.get('Int64').lo).to.be(0x33334444);
        expect(dict.get('String')).to.be('StringValue');
        expect(dict.keys()).to.eql(['BoolTrue', 'BoolFalse', 'UInt32', 'UInt64', 'Int32', 'Int64', 'String', 'ByteArray']);
        expect(ByteUtils.bytesToHex(dict.get('ByteArray'))).to.be('000102030405ff');

        stm = new BinaryStream();
        dict.write(stm);
        expect(ByteUtils.bytesToHex(stm.getWrittenBytes())).to.be(data);
    });

    it('writes dictionary', function() {
        var dict = new VarDictionary();
        dict.set('BoolTrue', VarDictionary.ValueType.Bool, true);
        dict.set('BoolFalse', VarDictionary.ValueType.Bool, false);
        dict.set('UInt32', VarDictionary.ValueType.UInt32, 42);
        dict.set('UInt64', VarDictionary.ValueType.UInt64, new Int64(0xDDDDCCCC, 0xFFFFEEEE));
        dict.set('Int32', VarDictionary.ValueType.Int32, -42);
        dict.set('Int64', VarDictionary.ValueType.Int64, new Int64(0x33334444, 0x11112222));
        dict.set('String', VarDictionary.ValueType.String, 'StringValue');
        dict.set('ByteArray', VarDictionary.ValueType.Bytes, ByteUtils.hexToBytes('000102030405ff'));
        var stm = new BinaryStream();
        dict.write(stm);
        expect(ByteUtils.bytesToHex(stm.getWrittenBytes())).to.be(data);
    });

    it('returns undefined for not found value', function() {
        var dict = new VarDictionary();
        expect(dict.length).to.be(0);
        expect(dict.get('val')).to.be(undefined);
    });

    it('removes item from dictionary', function() {
        var dict = new VarDictionary();
        expect(dict.length).to.be(0);
        expect(dict.get('val')).to.be(undefined);
        dict.set('val', VarDictionary.ValueType.Bool, true);
        expect(dict.length).to.be(1);
        expect(dict.get('val')).to.be(true);
        dict.remove('val');
        expect(dict.length).to.be(0);
        expect(dict.get('val')).to.be(undefined);
    });

    it('allows to add key twice', function() {
        var dict = new VarDictionary();
        dict.set('UInt32', VarDictionary.ValueType.UInt32, 42);
        expect(dict.length).to.be(1);
        dict.set('UInt32', VarDictionary.ValueType.UInt32, 42);
        expect(dict.length).to.be(1);
    });

    it('throws error for empty version', function() {
        expect(function() {
            VarDictionary.read(new BinaryStream(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes('0000'))));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidVersion);
        });
    });

    it('throws error for larger version', function() {
        expect(function() {
            VarDictionary.read(new BinaryStream(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes('0002'))));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidVersion);
        });
    });

    it('throws error for bad value type', function() {
        expect(function() {
            VarDictionary.read(new BinaryStream(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes('0001ff01000000dd10000000'))));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('bad value type');
        });
    });

    it('reads empty dictionary', function() {
        var dict = VarDictionary.read(new BinaryStream(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes('000100'))));
        expect(dict.length).to.be(0);
    });

    it('throws error for bad key length', function() {
        expect(function() {
            VarDictionary.read(new BinaryStream(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes('0001ff00000000dd10000000'))));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('bad key length');
        });
    });

    it('throws error for bad value length', function() {
        expect(function() {
            VarDictionary.read(new BinaryStream(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes('0001ff01000000ddffffffff'))));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('bad value length');
        });
    });

    it('throws error for bad uint32 value', function() {
        expect(function() {
            VarDictionary.read(new BinaryStream(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes('00010401000000dd0500000000'))));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('bad uint32');
        });
    });

    it('throws error for bad uint64 value', function() {
        expect(function() {
            VarDictionary.read(new BinaryStream(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes('00010501000000dd0500000000'))));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('bad uint64');
        });
    });

    it('throws error for bad bool value', function() {
        expect(function() {
            VarDictionary.read(new BinaryStream(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes('00010801000000dd0500000000'))));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('bad bool');
        });
    });

    it('throws error for bad int32 value', function() {
        expect(function() {
            VarDictionary.read(new BinaryStream(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes('00010c01000000dd0500000000'))));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('bad int32');
        });
    });

    it('throws error for bad int64 value', function() {
        expect(function() {
            VarDictionary.read(new BinaryStream(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes('00010d01000000dd0500000000'))));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('bad int64');
        });
    });

    it('throws error for bad value type on write', function() {
        expect(function() {
            var dict = new VarDictionary();
            dict.set('BoolTrue', VarDictionary.ValueType.Bool, true);
            dict._items[0].type = 0xff;
            dict.write(new BinaryStream());
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.Unsupported);
        });
    });

    it('throws error for bad value type on set', function() {
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', 0xff, true);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
    });

    it('throws error for bad int32 on set', function() {
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Int32, 'str');
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Int32, null);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
    });

    it('throws error for bad int64 on set', function() {
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Int64, null);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Int64, 'str');
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Int64, 123);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Int64, { hi: 1 });
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Int64, { lo: 1 });
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
    });

    it('throws error for bad bool on set', function() {
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Bool, 'true');
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Bool, 1);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Bool, null);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Bool, undefined);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
    });

    it('throws error for bad uint32 on set', function() {
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.UInt32, 'str');
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.UInt32, -1);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
    });

    it('throws error for bad uint64 on set', function() {
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.UInt64, null);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.UInt64, 'str');
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.UInt64, 123);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.UInt64, { hi: 1 });
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.UInt64, { lo: 1 });
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
    });

    it('throws error for bad string on set', function() {
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.String, null);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.String, 123);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
    });

    it('throws error for bad bytes', function() {
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Bytes, null);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Bytes, 123);
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
        expect(function() {
            var dict = new VarDictionary();
            dict.set('val', VarDictionary.ValueType.Bytes, '0000');
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
    });
});
